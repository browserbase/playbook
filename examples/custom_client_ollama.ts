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
 * In this example, we'll be using a custom LLM client to use Ollama instead of the default OpenAI client.
 *
 * 1. Go to Hacker News (https://news.ycombinator.com)
 * 2. Use `extract` to find the top 3 stories
 */

import StagehandConfig from "./stagehand.config.js";
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
  await stagehand.page.goto("https://news.ycombinator.com");

  const headlines = await stagehand.page.extract({
    instruction: "Extract the top story from the Hacker News homepage.",
    schema: z.object({
      story: z.object({
        title: z.string(),
        points: z.number(),
      }),
    }),
    useTextExtract: true,
  });

  console.log(headlines);

  //   Close the browser
  await stagehand.close();

  if (StagehandConfig.env === "BROWSERBASE" && stagehand.browserbaseSessionID) {
    console.log(
      "Session completed. Waiting for 10 seconds to see the logs and recording..."
    );
    //   Wait for 10 seconds to see the logs
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log(
      boxen(
        `View this session recording in your browser: \n${chalk.blue(
          `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`
        )}`,
        {
          title: "Browserbase",
          padding: 1,
          margin: 3,
        }
      )
    );
  } else {
    console.log(
      "We hope you enjoyed using Stagehand locally! On Browserbase, you can bypass captchas, replay sessions, and access unparalleled debugging tools!\n10 free sessions: https://www.browserbase.com/sign-up\n\n"
    );
  }

  console.log(
    `\n🤘 Thanks for using Stagehand! Create an issue if you have any feedback: ${chalk.blue(
      "https://github.com/browserbase/stagehand/issues/new"
    )}\n`
  );
  process.exit(0);
}
