import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";
import dotenv from "dotenv";
dotenv.config();

const bb = new Browserbase({apiKey: process.env.BROWSERBASE_API_KEY!});

(async () => {
  const sleep = async () => await new Promise((resolve) => setTimeout(resolve, Math.floor(50 +(Math.random() * 100))));

  const { id, connectUrl } = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
  });
  console.log(`View session at: https://browserbase.com/sessions/${id}`);
  
  const browser = await chromium.connectOverCDP(connectUrl);
  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0];

  // Go to the login page
  await page.goto("https://www.dewa.gov.ae/en/consumer/my-account/login?returnUrl=%2fen%2fconsumer%2fmy-account%2fdashboard", {waitUntil: "load"});

  //Locate the username input
  const usernameInput = page.locator('input[name="Username"]');
  await usernameInput.fill(process.env["DEWA_USERNAME"]!);
  await sleep();

  // Locate the password input
  const passwordInput = page.locator('input[name="Password"]');
  await passwordInput.fill(process.env["DEWA_PASSWORD"]!);
  await sleep();

  // Locate the login button
  const loginButton = page.locator('button[id="loginButton"]');
  await loginButton.click();

  // Wait for the page to load
  await page.waitForLoadState("load");

  // Close the browser
  await browser.close();
})();