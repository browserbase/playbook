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
  // Stagehand can't yet scroll within divs (yet), so it's best to ask questions with brief answers
  const question = "Tell me, in one sentence, why I should use Stagehand";
  const docsUrl = "https://docs.stagehand.dev/reference/introduction";

  await page.goto(docsUrl);
  await page.act({
    action: "click on the search bar",
  });
  await page.act({
    action: `type '${question}' into the search bar and click on the suggestion that says 'Use AI to answer your question'`,
  });
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const { text } = await page.extract({
    instruction: "extract the response from the chatbot",
    schema: z.object({
      text: z.string(),
    }),
  });
  console.log(
    "\n\n" +
      chalk.gray("Question: ") +
      question +
      "\n" +
      chalk.green("Answer from Mintlify AI: ") +
      text +
      "\n\n"
  );
}
