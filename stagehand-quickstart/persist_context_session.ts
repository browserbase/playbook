/**
 * 🤘 Welcome to Stagehand!
 *
 * This is a simple example of how to persist a context session using Stagehand and Browserbase.
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

import StagehandConfig from "./stagehand.config.ts";
import { Page, BrowserContext, Stagehand } from "@browserbasehq/stagehand";
import { Browserbase } from "@browserbasehq/sdk";
import { z } from "zod";
import chalk from "chalk";
import boxen from "boxen";
import dotenv from "dotenv";
import { announce } from "./utils.ts";
import { SessionCreateParams } from "@browserbasehq/sdk/resources/index.mjs";

dotenv.config();

let BROWSERBASE_PROJECT_ID: string;
let BROWSERBASE_API_KEY: string;
try {
  BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID!;
  BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY!;
} catch (e) {
  console.error(
    "BROWSERBASE_PROJECT_ID and BROWSERBASE_API_KEY must be set in .env to run this example"
  );
  process.exit(1);
}

const browserbase = new Browserbase({
  apiKey: BROWSERBASE_API_KEY,
});

async function persistContextSession(contextId: string) {
  const stagehand = new Stagehand({
    ...StagehandConfig,
    browserbaseSessionCreateParams: {
      projectId: BROWSERBASE_PROJECT_ID,
      browserSettings: {
        context: {
          id: contextId,
          persist: true,
        },
      },
    },
  });
  await stagehand.init();
  announce(
    `Session created with ID: ${stagehand.browserbaseSessionID}.\n\nSession URL: https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`
  );
  const page = stagehand.page;
  await page.goto("https://www.amazon.com/gp/sign-in.html");

  announce(
    `${chalk.green("Press enter")} to open the debugger URL in your default browser. When you login to Amazon, the following session will remember your authentication.

${chalk.yellow("When you're logged in, come back here and press enter once again to continue...")}`
  );
  await waitForEnter();

  console.log(
    chalk.yellow("\n\nOnce you're logged in, press enter to continue...\n\n")
  );
  await openDebuggerUrl(stagehand.browserbaseSessionID!);
  await waitForEnter();
  await stagehand.close();
  console.log(chalk.green("Done!"));
}

async function openPersistedContextSession(contextId: string) {
  const stagehand = new Stagehand({
    ...StagehandConfig,
    browserbaseSessionCreateParams: {
      projectId: BROWSERBASE_PROJECT_ID,
      browserSettings: {
        context: {
          id: contextId,
          persist: false, // We don't need to persist this context since we're already logged in
        },
      },
    },
  });
  await stagehand.init();
  const page = stagehand.page;
  // This will be logged in
  await page.goto("https://www.amazon.com");
  announce(
    `${chalk.green("Press enter")} to open the debugger URL in your default browser. This session should take you to the logged in Amazon homepage if you logged in previously and the context was persisted.

${chalk.yellow("Press enter once again to continue...")}`
  );
  await waitForEnter();
  await openDebuggerUrl(stagehand.browserbaseSessionID!);
  await waitForEnter();
  await stagehand.close();
}

(async () => {
  const bbContext = await browserbase.contexts.create({
    projectId: BROWSERBASE_PROJECT_ID,
  });
  await persistContextSession(bbContext.id);
  await openPersistedContextSession(bbContext.id);

  // Do it again with the persisted context
})();

async function waitForEnter() {
  await new Promise<void>((resolve) => {
    process.stdin.once("data", () => resolve());
  });
}

// Open debugger URL in default browser
async function openDebuggerUrl(sessionId: string) {
  const { debuggerFullscreenUrl } = await browserbase.sessions.debug(sessionId);
  const { exec } = await import("child_process");
  const platform = process.platform;
  const command =
    platform === "win32"
      ? "start"
      : platform === "darwin"
        ? "open"
        : "xdg-open";
  exec(`${command} ${debuggerFullscreenUrl}`);
}
