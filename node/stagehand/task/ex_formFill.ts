import { Stagehand, Page, BrowserContext } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import boxen from "boxen";
import { drawObserveOverlay, clearOverlays, actWithCache, announce } from "./utils.js";
import { z } from "zod";

/**
 * 🤘 Welcome to Stagehand! Thanks so much for trying us out!
 * 🛠️ CONFIGURATION: stagehand.config.ts will help you configure Stagehand
 *
 * 📝 Check out our docs for more fun use cases, like building agents
 * https://docs.stagehand.dev/
 *
 * 💬 If you have any feedback, reach out to us on Slack!
 * https://stagehand.dev/slack
 *
 * 📚 You might also benefit from the docs for Zod, Browserbase, and Playwright:
 * - https://zod.dev/
 * - https://docs.browserbase.com/
 * - https://playwright.dev/docs/intro
 */
async function main({
  page,
  context,
  stagehand,
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  context: BrowserContext; // Playwright BrowserContext
  stagehand: Stagehand; // Stagehand instance
}) {
  // Define the inputs for the form
  const inputs = {
    "superpower": "Invisibility",
    "features_used": [
        "Stealth Mode",
        "Proxies",
        "Session Replay"
    ],
    "coolest_build": "A bot that automates form submissions across multiple sites.",
  }
  // Navigate to page
  await page.goto("https://forms.gle/f4yNQqZKBFCbCr6j7");

  // You can use the observe method to find the selector with an act command to fill it in
  const superpowerSelector = await page.observe(`Find the selector for the superpower field: ${inputs.superpower}`);
  console.log(superpowerSelector);
  await page.act(superpowerSelector[0]);

  // You can also explicitly specify the action to take
  for (const feature of inputs.features_used) {
    await page.act("Select the features used: " + feature);
  }

  announce(inputs.coolest_build);
  await page.act("Fill in the coolest_build field with the following value: " + inputs.coolest_build);

  await page.act("Click the submit button");

  await page.waitForTimeout(5000);

  // Extract to log the status of the form
  const status = await page.extract({instruction: "Extract the status of the form", schema: z.object({status: z.string()})});
  announce(status.status);
  console.log(status);

  stagehand.log({
    category: "create-browser-app",
    message: `Metrics`,
    auxiliary: {
      metrics: {
        value: JSON.stringify(stagehand.metrics),
        type: "object",
      },
    },
  });
}

/**
 * This is the main function that runs when you do npm run start
 *
 * YOU PROBABLY DON'T NEED TO MODIFY ANYTHING BELOW THIS POINT!
 *
 */
async function run() {
  const stagehand = new Stagehand({
    ...StagehandConfig,
  });
  await stagehand.init();

  if (StagehandConfig.env === "BROWSERBASE" && stagehand.browserbaseSessionID) {
    console.log(
      boxen(
        `View this session live in your browser: \n${chalk.blue(
          `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`,
        )}`,
        {
          title: "Browserbase",
          padding: 1,
          margin: 3,
        },
      ),
    );
  }

  const page = stagehand.page;
  const context = stagehand.context;
  await main({
    page,
    context,
    stagehand,
  });
  await stagehand.close();
  console.log(
    `\n🤘 Thanks so much for using Stagehand! Reach out to us on Slack if you have any feedback: ${chalk.blue(
      "https://stagehand.dev/slack",
    )}\n`,
  );
}

run();
