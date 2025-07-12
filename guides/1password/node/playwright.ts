import Browserbase from "@browserbasehq/sdk";
import { chromium } from "playwright-core";
import dotenv from "dotenv";
dotenv.config();

const bb = new Browserbase({apiKey: process.env.BROWSERBASE_API_KEY!});

(async () => {
  const { id, connectUrl } = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserSettings: {
      extensionId: process.env.EXTENSION_ID!,
    },
  });
  
  const browser = await chromium.connectOverCDP(connectUrl);
  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0];

  // Go to the login page
  await page.goto("chrome-extension://aeblfdkhhhdcdjpifhhbdiojplfjncoa/app/app.html#/page/welcome", {waitUntil: "load"});

  // wait for enter in the terminal
  await new Promise(resolve => setTimeout(resolve, 60000));

  // log in to browserbase using the credentials from 1password
  await page.goto("https://browserbase.com/sign-in");
  await page.waitForLoadState("networkidle");

  await page.close();
})();