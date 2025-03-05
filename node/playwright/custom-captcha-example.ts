/**
 * Run using npx tsx custom-captcha.ts
**/

import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";
import dotenv from "dotenv";
dotenv.config();

const bb = new Browserbase({apiKey: process.env.BROWSERBASE_API_KEY!});

async function createCustomCaptchaSession() {
    // Create a new session
    const session = await bb.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      browserSettings: {
        //@ts-ignore
          captchaImageSelector: "#c_turingtestpage_ctl00_maincontent_captcha1_CaptchaImage",
          captchaInputSelector: "#ctl00_MainContent_txtTuringText"
        }
    });

    // Connect to the session
    return session;
}

async function runCustomCaptchaSession() {
  const session = await createCustomCaptchaSession();
  const browser = await chromium.connectOverCDP(session.connectUrl);

  // Getting the default context to ensure the sessions are recorded.
  const defaultContext = browser.contexts()[0];
  const page = defaultContext?.pages()[0];
  console.log(
  `View sessionreplay at https://browserbase.com/sessions/${session.id}`,
  );
  // Navigate to website with custom captcha
  const consumerAccess = await page.goto("https://nmlsconsumeraccess.org/");
  await page.waitForLoadState('networkidle');

  // Search for company
  await page.waitForSelector('input[type="text"]');
  await page.click('input[type="text"]');
  await page.locator('input[type="text"]').first().fill(company);

  // Click search
  await page.click('input[id="searchButton"]');

  // Click the terms and conditions checkbox
  await page.click('#ctl00_MainContent_cbxAgreeToTerms');

  // wait for page to load
  console.log("Captcha auto-solving...");
  await page.waitForTimeout(5000); // can add this - but CAPTCHA is usually solved much quicker

  await page.click('#ctl00_MainContent_btnContinue');
  await page.waitForLoadState('networkidle');

  console.log("Shutting down...");
  await page.close();
  await browser.close();
}

const company = "alt platform";
runCustomCaptchaSession();