import { chromium } from "playwright-core";
import { Browserbase } from "@browserbasehq/sdk";

(async () => {
  console.log("Starting remote browser...");
  const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
  });

  const browser = await chromium.connectOverCDP(session.connectUrl);
  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0];

  await page.goto("https://news.ycombinator.com");

  console.log("Generating PDF...");

  await page.pdf({
    path: "files/generate_pdf.pdf",
    format: "A4",
  });

  console.log("Shutting down...");
  await page.close();
  await browser.close();
})().catch((error) => {
  console.error(error);
});