import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";
import dotenv from "dotenv";
dotenv.config();

const bb = new Browserbase({apiKey: process.env.BROWSERBASE_API_KEY!});

async function createSession() {
    // Create a new session
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      browserSettings: {
        advancedStealth: true,
        // advancedStealthMouseMovement: true,
      },
      keepAlive: true,
      proxies: true,
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
  console.log(
    `View session at https://browserbase.com/sessions/${session.id}`,
  );

  await page.goto("https://browserbase.com/");

  await page.waitForTimeout(2000);
  await page.close();
  await browser.close();
})().catch((error) => console.error(error.message));