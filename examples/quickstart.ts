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
import { actWithCache } from "./utils.js";

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
