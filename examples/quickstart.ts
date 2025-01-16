/**
 * 🤘 Welcome to Stagehand!
 *
 * TO RUN THIS PROJECT:
 * ```
 * npm install
 * npm run start
 * ```
 *
 * To edit config, see `stagehand.config.ts`
 *
 * In this quickstart, we'll be automating a browser session to show you the power of Playwright and Stagehand's AI features.
 *
 * 1. Go to https://docs.browserbase.com/
 * 2. Use `extract` to find information about the quickstart
 * 3. Use `observe` to find the links under the 'Guides' section
 * 4. Use Playwright to click the first link. If it fails, use `act` to gracefully fallback to Stagehand AI.
 */

import { Page, BrowserContext, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import chalk from "chalk";
import boxen from "boxen";
import dotenv from "dotenv";

dotenv.config();

export async function main({
  page,
  context,
  stagehand,
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  context: BrowserContext; // Playwright BrowserContext
  stagehand: Stagehand; // Stagehand instance
}) {
  console.log(
    [
      `🤘 ${chalk.yellow("Welcome to Stagehand!")}`,
      "",
      "Stagehand is a tool that allows you to automate browser interactions.",
      "Watch as this demo automatically performs the following steps:",
      "",
      `📍 Step 1: Stagehand will auto-navigate to ${chalk.blue(
        "https://docs.browserbase.com/"
      )}`,
      `📍 Step 2: Stagehand will use AI to ${chalk.green(
        "extract"
      )} information about the quickstart`,
      `📍 Step 3: Stagehand will use AI to ${chalk.green(
        "observe"
      )} and identify links in the 'Guides' section`,
      `📍 Step 4: Stagehand will attempt to click the first link using Playwright, with ${chalk.green(
        "act"
      )} as an AI fallback`,
    ].join("\n")
  );

  //   You can use the `page` instance to write any Playwright code
  //   For more info: https://playwright.dev/docs/pom
  await page.goto("https://docs.browserbase.com/");

  const description = await page.extract({
    instruction: "extract the title, description, and link of the quickstart",
    // Zod is a schema validation library similar to Pydantic in Python
    // For more information on Zod, visit: https://zod.dev/
    schema: z.object({
      title: z.string(),
      link: z.string(),
      description: z.string(),
    }),
  });
  announce(
    `The ${chalk.bgYellow(description.title)} is at: ${chalk.bgYellow(
      chalk.blue(description.link)
    )}` +
      `\n\n${chalk.bgYellow(description.description)}` +
      `\n\n${chalk.gray(JSON.stringify(description, null, 2))}`,
    "Extract"
  );

  const observeResult = await page.observe({
    instruction: "Find the links under the 'Guides' section",
  });
  announce(
    `${chalk.green("Observe:")} We can click:\n${observeResult
      .map(
        (r) => `"${chalk.yellow(r.description)}" -> ${chalk.gray(r.selector)}`
      )
      .join("\n")}`,
    "Observe"
  );

  //   In the event that your Playwright code fails, you can use the `act` method to
  //   let Stagehand AI take over and complete the action.
  try {
    throw new Error(
      "Comment out line 118 in index.ts to run the base Playwright code!"
    );

    // Wait for search button and click it
    const quickStartSelector = `#content-area > div.relative.mt-8.prose.prose-gray.dark\:prose-invert > div > a:nth-child(1)`;
    await page.waitForSelector(quickStartSelector);
    await page.locator(quickStartSelector).click();
    await page.waitForLoadState("networkidle");
    announce(
      `Clicked the quickstart link using base Playwright code. ${chalk.yellow(
        "Uncomment line 118 in index.ts to have Stagehand take over!"
      )}`
    );
  } catch (e) {
    if (!(e instanceof Error)) {
      throw e;
    }
    announce(
      `${chalk.red(
        "Looks like an error occurred running Playwright. Let's have Stagehand take over!"
      )} \n${chalk.gray(e.message)}`,
      "Playwright"
    );

    const actResult = await page.act({
      action: "Click the link to the quickstart",
    });
    announce(
      `${chalk.green(
        "Clicked the quickstart link using Stagehand AI fallback."
      )} \n${chalk.gray(actResult)}`,
      "Act"
    );
  }

  //   Close the browser
  await stagehand.close();

  console.log(
    [
      "To recap, here are the steps we took:",
      `1. We went to ${chalk.blue("https://docs.browserbase.com/")}`,
      `---`,
      `2. We used ${chalk.green(
        "extract"
      )} to find information about the quickstart`,
      `The ${chalk.bgYellow(description.title)} is at: ${chalk.bgYellow(
        chalk.blue(description.link)
      )}` +
        `\n\n${chalk.bgYellow(description.description)}` +
        `\n\n${chalk.gray(JSON.stringify(description, null, 2))}`,
      `---`,
      `3. We used ${chalk.green(
        "observe"
      )} to find the links under the 'Guides' section and got the following results:`,
      `\nWe could have clicked:\n${observeResult
        .map(
          (r) => `"${chalk.yellow(r.description)}" -> ${chalk.gray(r.selector)}`
        )
        .join("\n")}`,
      `---`,
      `4. We used Playwright to click the first link. If it failed, we used ${chalk.green(
        "act"
      )} to gracefully fallback to Stagehand AI.`,
    ].join("\n\n")
  );
}

function announce(message: string, title?: string) {
  console.log(
    boxen(message, {
      padding: 1,
      margin: 3,
      title: title || "Stagehand",
    })
  );
}
