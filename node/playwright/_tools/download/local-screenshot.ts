/**
 * Run using npx tsx downloads/screenshot.ts
**/

import { writeFileSync } from "fs";
import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";
import dotenv from "dotenv";
dotenv.config();

const bb = new Browserbase({apiKey: process.env.BROWSERBASE_API_KEY!});

async function createSession() {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
  });
  return session;
}

(async () => {
  // Connect to the session
  const session = await createSession();
  const browser = await chromium.connectOverCDP(session.connectUrl);

  // Getting the default context to ensure the sessions are recorded.
  const defaultContext = browser.contexts()[0];
  const page = defaultContext?.pages()[0];

  await page.goto("https://en.wikipedia.org/wiki/Main_Page", {
    // let's make sure the page is fully loaded before taking the screenshot
    waitUntil: "domcontentloaded",
});

  console.log("Taking a screenshot!")

  const buf = await page.screenshot({ fullPage: true, timeout: 0 })
  writeFileSync('downloads/files/screenshot.jpeg', buf)

  console.log("Shutting down...")
  await page.close();
  await browser.close();
})().catch((error) => {
  console.error(error);
});