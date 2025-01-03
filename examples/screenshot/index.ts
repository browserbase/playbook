import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";
import dotenv from "dotenv";
import { writeFileSync } from "fs";

dotenv.config();

const PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;
const API_KEY = process.env.BROWSERBASE_API_KEY;

const URL_TO_TAKE_SCREENSHOT_OF = "https://www.oakley.com/en-us";

if (!API_KEY) {
  throw new Error("BROWSERBASE_API_KEY is not set");
}

if (!PROJECT_ID) {
  throw new Error("BROWSERBASE_PROJECT_ID is not set");
}

async function main() {
  const bb = new Browserbase({
    apiKey: API_KEY,
  });

  const session = await bb.sessions.create({
    projectId: PROJECT_ID as string,
    proxies: true,
    browserSettings: {
      viewport: {
        width: 375,
        height: 814,
      },
      fingerprint: {
        devices: ["mobile"],
        operatingSystems: ["ios"],
        screen: {
          minWidth: 375,
          maxWidth: 428,
          minHeight: 667,
          maxHeight: 926,
        },
      },
    },
  });
  console.log(`Session created, id: ${session.id}`);

  console.log("Starting remote browser...");
  const browser = await chromium.connectOverCDP(session.connectUrl);
  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0]

  await page.goto(URL_TO_TAKE_SCREENSHOT_OF, {
    // let's make sure the page is fully loaded before asking for the live debug URL
    waitUntil: "domcontentloaded",
  });

  const debugUrls = await bb.sessions.debug(session.id);
  console.log(
    `Session started, live debug accessible here: ${debugUrls.debuggerUrl}.`
  );

  console.log("Taking a screenshot!");
  const buf = await page.screenshot({ fullPage: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  writeFileSync(
    `${process.env.HOME}/Downloads/screenshot-${timestamp}.jpeg`,
    buf
  );
  console.log(
    `Screenshot saved to Downloads folder: screenshot-${timestamp}.jpeg`
  );

  console.log("Shutting down...");
  await page.close();
  await browser.close();

  console.log(
    `Session complete! View replay at https://browserbase.com/sessions/${session.id}`
  );
}

const COUNT_TO_RUN_IN_PARALLEL = 1;
for (let i = 0; i < COUNT_TO_RUN_IN_PARALLEL; i++) {
  main();
}
