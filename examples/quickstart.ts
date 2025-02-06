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
 */
import { Page, BrowserContext, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import chalk from "chalk";
import dotenv from "dotenv";
import { clearOverlays, drawObserveOverlay } from "./utils.js";

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
  async function actWithCache(instruction: string) {
    // Observe the page and return the action to execute
    const results = await page.observe({
      instruction,
      onlyVisible: false, // Faster/better/cheaper, but uses Chrome a11y tree so may not always target directly visible elements
      returnAction: true, // return the action to execute
    });
    console.log(chalk.blue("Got results:"), results);

    // You can cache the playwright action to use it later with no additional LLM calls :)
    const actionToCache = results[0];
    console.log(chalk.blue("Taking cacheable action:"), actionToCache);

    // OPTIONAL: Draw an overlay over the relevant xpaths
    await drawObserveOverlay(page, results);
    await page.waitForTimeout(1000); // Can delete this line, just a pause to see the overlay
    await clearOverlays(page);

    // Execute the action
    await page.act(actionToCache);
  }

  await page.goto("https://docs.stagehand.dev/reference/introduction");

  // You can pass a string directly to act with something like:
  // await page.act("Click the search box")
  // However, it's faster/cheaper/more reliable to use a cache-able approach
  await actWithCache("Click the search box");

  await actWithCache(
    "Type 'Tell me in one sentence why I should use Stagehand' into the search box"
  );
  await actWithCache("Click the suggestion to use AI");
  await page.waitForTimeout(2000);
  const { text } = await page.extract({
    instruction:
      "extract the text of the AI suggestion from the search results",
    schema: z.object({
      text: z.string(),
    }),
    useTextExtract: false, // Set this to true if you want to extract longer paragraphs
  });
  console.log(chalk.green("AI suggestion:"), text);
}

