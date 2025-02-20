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
import {
  Page,
  BrowserContext,
  Stagehand,
  ObserveResult,
} from "@browserbasehq/stagehand";
import { z } from "zod";
import chalk from "chalk";
import dotenv from "dotenv";
import {
  clearOverlays,
  drawObserveOverlay,
  readCache,
  simpleCache,
} from "./utils.js";

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
  /**
   * This function is used to act with a cacheable action.
   * It will first try to get the action from the cache.
   * If not in cache, it will observe the page and cache the result.
   * Then it will execute the action.
   * @param instruction - The instruction to act with.
   */
  async function actWithCache(instruction: string) {
    // Try to get action from cache first
    const cachedAction = await readCache(instruction);
    if (cachedAction) {
      console.log(chalk.blue("Using cached action for:"), instruction);
      await page.act(cachedAction);
      return;
    }

    // If not in cache, observe the page and cache the result
    const results = await page.observe(instruction);
    console.log(chalk.blue("Got results:"), results);

    // Cache the playwright action
    const actionToCache = results[0];
    console.log(chalk.blue("Taking cacheable action:"), actionToCache);
    await simpleCache(instruction, actionToCache);
    // OPTIONAL: Draw an overlay over the relevant xpaths
    await drawObserveOverlay(page, results);
    await page.waitForTimeout(1000); // Can delete this line, just a pause to see the overlay
    await clearOverlays(page);

    // Execute the action
    await page.act(actionToCache);
  }

  // Navigate to the page
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
