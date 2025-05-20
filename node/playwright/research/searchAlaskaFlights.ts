import { chromium } from "playwright-core";
import { Browserbase } from "@browserbasehq/sdk";
import * as dotenv from "dotenv";
import boxen from "boxen";
import chalk from "chalk";
dotenv.config();

async function createSession() {
    const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
    const session = await bb.sessions.create({
        projectId: process.env.BROWSERBASE_PROJECT_ID!,
        browserSettings: {
            advancedStealth: true,
        },
        proxies: true
    });

    console.log(
      boxen(
        `View this session recording in your browser: \n${chalk.blue(
        `https://browserbase.com/sessions/${session.id}`
        )}`,
        {
          title: "Browserbase",
          padding: 1,
          margin: 3,
        }
      )
    );

    return session;
}

async function main() {  
  const session = await createSession();
  const browser = await chromium.connectOverCDP(session.connectUrl);

  const context = browser.contexts()[0];
  const page = context.pages()[0];

  // Set the origin and destination
  const origin = "SFO";
  const destination = "LAX";

  await page.goto("https://www.alaskaair.com/")
  await page.waitForTimeout(5000);
  await page.waitForLoadState("load");

  // Select the origin
  await page.locator('#fromCity1').click();
  await page.locator('#fromCity1').fill(origin);

  // Select the destination
  await page.locator('#toCity1').fill(destination);

  // Select the departure date
  await page.locator('#departureDate1').click();
  await page.locator('#btn-next').click();
  await page.locator('#day4').click();

  // Select the return date
  await page.locator('#returnDate').click();
  await page.locator('#day8').click();

  // Click the search for flights button
  await page.locator('auro-button#findFlights').click();

  // get the flights from the page content
  const content = await page.content();
  console.log(content);

  await browser.close();

}

(async () => {
  await main();
  console.log(
    `\n🤘 Thanks for using Stagehand! Create an issue if you have any feedback: ${chalk.blue(
      "https://github.com/browserbase/stagehand/issues/new"
    )}\n`
  );
})().catch(console.error);

