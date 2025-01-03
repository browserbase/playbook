/**
 * 🤘 Welcome to Stagehand!
 *
 * This example shows how to deploy a Stagehand project to Vercel.
 * If you're seeing this in the browser, go to /api/stagehand to see the results!
 *
 * TO DEPLOY THIS PROJECT:
 * 1. Run `npx vercel deploy`
 * 2. Go to YOUR_APP_URL/api/stagehand
 *
 * TO RUN THIS PROJECT LOCALLY:
 * ```
 * npm install
 * npm run dev
 * ```
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
      chalk.yellow(
        "[WARNING] You are running this example with prompt caching enabled. Overriding to disable."
      )
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
    const data = await response?.json();
    console.log("Got data:", data);
    console.log(
      [
        chalk.yellow("\nTO DEPLOY THIS PROJECT:"),
        "",
        "1. Make a new Vercel project",
        "",
        "2. Add the environment variables to the project:",
        chalk.blue(
          "https://vercel.com/docs/projects/environment-variables/managing-environment-variables#declare-an-environment-variable"
        ),
        "",
        "3. Run " + chalk.green("npx vercel deploy"),
        "",
        "3. Go to " + chalk.blue("https://YOUR_VERCEL_APP_URL/api/stagehand"),
        "",
      ].join("\n")
    );
    console.log(chalk.yellow("\n🤘 Thanks for using Stagehand!"));
    console.log(
      `Report an issue: ${chalk.blue(
        "https://github.com/browserbase/stagehand/issues/new"
      )}`
    );
  })();
}
