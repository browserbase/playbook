/**
* Run using npx tsx downloads/cloud-download.ts
**/

import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

async function createSession() {
    const response = await fetch(`https://api.browserbase.com/v1/sessions`, {
      method: "POST",
      headers: {
        "x-bb-api-key": `${process.env.BROWSERBASE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId: process.env.BROWSERBASE_PROJECT_ID,
      }),
    });
    const json = await response.json();
    return json;
}

async function saveDownloadsOnDisk(sessionId: string, retryForSeconds: number) {
  return new Promise<void>((resolve, reject) => {
    let pooler;
    const timeout = setTimeout(() => {
      if (pooler) {
        clearInterval(pooler);
      }
    }, retryForSeconds);
    async function fetchDownloads() {
      try {
        const response = await fetch(
          `https://api.browserbase.com/v1/sessions/${sessionId}/downloads`,
          {
            method: "GET",
            headers: {
              "x-bb-api-key": process.env.BROWSERBASE_API_KEY!,
            },
          },
        );
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > 0) {
          const buffer = Buffer.from(arrayBuffer);
          writeFileSync("downloads.zip", buffer);
          clearInterval(pooler);
          clearTimeout(timeout);
          resolve();
        }
      } catch (e) {
        clearInterval(pooler);
        clearTimeout(timeout);
        reject(e);
      }
    }
    pooler = setInterval(fetchDownloads, 2000);
  });
}

(async () => {
  // `createSession()` performs a call to the Sessions API
  const { id: sessionId } = await createSession();
  const browser = await chromium.connectOverCDP(
    // we connect to a Session created via the API
    `wss://connect.browserbase.com?apiKey=${process.env.BROWSERBASE_API_KEY}&sessionId=${sessionId}`,
  );
  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0];

  // Required to avoid playwright overriding location
  const client = await defaultContext.newCDPSession(page);
  await client.send("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: "downloads",
    eventsEnabled: true,
  });

  await page.goto("https://browser-tests-alpha.vercel.app/api/download-test");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#download").click(),
  ]);

  let downloadError = await download.failure();
  if (downloadError !== null) {
    console.log("Error happened on download:", downloadError);
    throw new Error(downloadError);
  }

  await page.close();
  await browser.close();

  if (!downloadError) {
    // wait up to 20s to save the downloaded files locally
    await saveDownloadsOnDisk(sessionId, 20000);
  }
})().catch((error) => console.error(error.message));