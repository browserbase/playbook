/**
 * 🤘 Welcome to Stagehand!
 *
 * TO DEPLOY THIS PROJECT:
 *
 * 1. Make a new Vercel project and add the environment variables to the project:
 * https://vercel.com/docs/projects/environment-variables/managing-environment-variables#declare-an-environment-variable
 *
 * 2. Run `npx vercel deploy`
 *
 * 3. Go to https://YOUR_VERCEL_APP_URL/api/stagehand
 *
 * TO RUN THIS PROJECT LOCALLY:
 * ```
 * npm install
 * npm run dev
 * ```
 *
 */

import StagehandConfig from "./stagehand.config.js";
import { Page, BrowserContext, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import dotenv from "dotenv";
import chalk from "chalk";
import { getEnvVar } from "./utils.js";

dotenv.config();

async function main({
  page,
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  context: BrowserContext; // Playwright BrowserContext
  stagehand: Stagehand; // Stagehand instance
}) {
  await page.goto("https://docs.browserbase.com/introduction");
  const { description } = await page.extract({
    instruction: "Extract the description of what Browserbase is",
    schema: z.object({
      description: z.string(),
    }),
  });

  return { description };
}

// Initialize Stagehand and run the main function
export async function run(request?: Request) {
  // Check for required environment variables
  try {
    getEnvVar("BROWSERBASE_API_KEY", true);
    getEnvVar("BROWSERBASE_PROJECT_ID", true);
  } catch (error) {
    return new Response(
      "You must set the BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID environment variables to run this example",
      {
        status: 500,
      }
    );
  }

  if (StagehandConfig.enableCaching) {
    console.warn(
      "You are running this example with prompt caching enabled. Overriding to disable."
    );
  }

  // Initialize Stagehand
  const stagehand = new Stagehand({
    ...StagehandConfig,
    enableCaching: false,
  });
  await stagehand.init();
  const page = stagehand.page;
  const context = stagehand.context;

  let response;

  try {
    // Run the main function
    const data = await main({
      page,
      context,
      stagehand,
    });
    response = Response.json(
      {
        data,
        // Return the session ID and URL for debugging
        browserbase: {
          sessionId: stagehand.browserbaseSessionID,
          sessionUrl: `https://www.browserbase.com/sessions/${stagehand.browserbaseSessionID}`,
          reportIssue: "https://github.com/browserbase/stagehand/issues/new",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error)
      response = Response.json({ error: error.message }, { status: 500 });
  }

  // Cleanup
  await stagehand.close();

  // Return the response
  return response;
}

// Only run this if you're running npm run start
if (import.meta.url === new URL(process.argv[1], "file:").href) {
  (async () => {
    const response = await run();
    console.log(response);
    console.log(chalk.yellow("\n\n🤘 Thanks for using Stagehand!"));
    console.log(
      `Report an issue: ${chalk.blue(
        "https://github.com/browserbase/stagehand/issues/new"
      )}`
    );
  })();
}
