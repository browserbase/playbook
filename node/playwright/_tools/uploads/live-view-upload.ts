import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";
import "dotenv/config";
import open from "open";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY as string,
});

// Native file picker for macOS
function openFilePicker(): string | null {
  try {
    const result = execSync(
      `osascript -e 'POSIX path of (choose file with prompt "Select a file to upload:")'`,
      { encoding: "utf-8" },
    );
    return result.trim();
  } catch {
    return null;
  }
}

(async (): Promise<void> => {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID as string,
  });

  const browser = await chromium.connectOverCDP(session.connectUrl);
  console.log("Browser version:", browser?.version());
  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0];

  const cdp = (await defaultContext.newCDPSession(page)) as any;

  page.on("filechooser", async (fileChooser) => {
    console.log("\n📁 File chooser detected!");
    console.log("   Opening native file picker...");

    const localFilePath = openFilePicker();

    if (!localFilePath || !fs.existsSync(localFilePath)) {
      console.log("❌ File selection cancelled or not found");
      return;
    }

    const originalFileName = path.basename(localFilePath);
    // Use a simple alphanumeric name to avoid any issues
    const ext = path.extname(originalFileName);
    const sanitizedFileName = `upload_${Date.now()}${ext}`;

    const fileSize = fs.statSync(localFilePath).size;
    console.log(
      `⬆️  Uploading "${originalFileName}" (${fileSize} bytes) as "${sanitizedFileName}"...`,
    );

    // Copy file to temp location with sanitized name
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, sanitizedFileName);
    fs.copyFileSync(localFilePath, tempFilePath);

    console.log(
      `📍 Temp file created: ${tempFilePath} (${fs.statSync(tempFilePath).size} bytes)`,
    );

    // Upload using stream
    const fileStream = fs.createReadStream(tempFilePath);
    const uploadResult = await bb.sessions.uploads.create(session.id, {
      file: fileStream,
    });
    console.log("✅ Upload API response:", JSON.stringify(uploadResult));

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    const remoteFilePath = `/tmp/.uploads/${sanitizedFileName}`;

    // Wait for file to sync to browser container
    console.log("⏳ Waiting for file to sync to browser container...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      // Check if file exists on remote browser using CDP
      const checkResult = await cdp.send("Runtime.evaluate", {
        expression: `                                                                                                                                                  
            (async () => {                                                                                                                                               
              try {                                                                                                                                                      
                const response = await fetch('file://${remoteFilePath}');                                                                                                
                return { exists: response.ok, status: response.status };                                                                                                 
              } catch (e) {                                                                                                                                              
                return { exists: false, error: e.message };                                                                                                              
              }                                                                                                                                                          
            })()                                                                                                                                                         
          `,
        awaitPromise: true,
        returnByValue: true,
      });
      console.log(
        "📂 Remote file check:",
        JSON.stringify(checkResult.result?.value),
      );

      const { root } = await cdp.send("DOM.getDocument");

      const { nodeId } = await cdp.send("DOM.querySelector", {
        nodeId: root.nodeId,
        selector: 'input[type="file"]',
      });

      if (!nodeId) {
        console.log("❌ Could not find file input element");
        return;
      }

      console.log(`📂 Setting remote file path: ${remoteFilePath}`);

      await cdp.send("DOM.setFileInputFiles", {
        files: [remoteFilePath],
        nodeId: nodeId,
      });

      console.log("✅ CDP setFileInputFiles completed");

      await page.evaluate(() => {
        const input = document.querySelector(
          'input[type="file"]',
        ) as HTMLInputElement;
        if (input) {
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });

      // Verify
      const fileInfo = await page.evaluate(() => {
        const input = document.querySelector(
          'input[type="file"]',
        ) as HTMLInputElement;
        if (input && input.files && input.files.length > 0) {
          const f = input.files[0];
          return { name: f.name, size: f.size, type: f.type };
        }
        return null;
      });

      console.log(`📋 Verification:`, JSON.stringify(fileInfo));
    } catch (err) {
      console.error("Error:", err);
    }
  });

  const liveView1 = await bb.sessions.debug(session.id);
  console.log(`\n=================================================`);
  console.log(`🔍 LIVE VIEW URL: ${liveView1.debuggerFullscreenUrl}`);
  console.log(`=================================================`);
  console.log(`\n👆 Click the "Choose File" button in the live view!\n`);
  open(liveView1.debuggerFullscreenUrl);

  await page.goto("https://browser-tests-alpha.vercel.app/api/upload-test");
  await page.waitForTimeout(120000);
  await page.close();
  await browser.close();
})().catch((error: Error) => console.error(error.message));
