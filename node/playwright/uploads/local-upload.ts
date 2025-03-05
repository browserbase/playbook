/**
 * Run using npx tsx uploads/local-upload.ts
**/

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
  const url = "https://browser-tests-alpha.vercel.app/api/upload-test";

  const session = await createSession();
  const browser = await chromium.connectOverCDP(session.connectUrl);

  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0];

  await page.goto(url);

  const fileInput = page.locator("#fileUpload");
  await fileInput.setInputFiles("./downloads/files/screenshot.jpeg");

  await browser.close();
})().catch((error) => console.error(error.message));