/**
 * 🤘 Welcome to Stagehand!
 *
 * This is a simple example of how to persist a context session using Stagehand and Browserbase.
 *
 * To use it, change URL_TO_LOGIN_TO to the URL you want to login to, default is Amazon.
 * This will create two browser sessions - one to login and one to use the cookies from the login session.
 *
 * TO RUN THIS PROJECT:
 * ```
 * npm install
 * npm run start
 * ```
 *
 * To edit Stagehand config, see `stagehand.config.ts`
 *
 */

import StagehandConfig from "./stagehand.config.ts";
import { Stagehand } from "@browserbasehq/stagehand";
import { Browserbase } from "@browserbasehq/sdk";
import chalk from "chalk";
import dotenv from "dotenv";
import { announce } from "./utils.ts";

// TODO: Change this to the URL you want to login to, default is Amazon
const URL_TO_LOGIN_TO = "https://www.amazon.com/gp/sign-in.html";
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

/**
 * Creates a new session with a context ID and adds session cookies to the context
 * @param contextId - The ID of the context to persist
 */
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
  await page.goto(URL_TO_LOGIN_TO);

  announce(
    `Opening the debugger URL in your default browser. When you login, the following session will remember your authentication.`
  );

  console.log(
    chalk.yellow("\n\nOnce you're logged in, press enter to continue...\n\n")
  );
  await openDebuggerUrl(stagehand.browserbaseSessionID!);
  await waitForEnter();
  await stagehand.close();
  console.log("Waiting 10 seconds for the context to be persisted...");
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log(
    chalk.green("Ready to open a new session with the persisted context!")
  );
}

/**
 * Opens a new session with a context ID and uses the cookies from the context to automatically login
 * @param contextId - The ID of the persisted context
 */
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
  await page.goto(URL_TO_LOGIN_TO);
  announce(
    `Opening the debugger URL in your default browser. This session should take you to the logged in page if the context was persisted.`
  );
  await openDebuggerUrl(stagehand.browserbaseSessionID!);
  await waitForEnter();
  await stagehand.close();
}

async function main() {
  // Create a new context
  const bbContext = await browserbase.contexts.create({
    projectId: BROWSERBASE_PROJECT_ID,
  });
  console.log("Created context", bbContext.id);

  // Create a new session with the context
  await persistContextSession(bbContext.id);
  announce(
    "Waiting 10 seconds before opening the persisted context session..."
  );
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Open the persisted context session
  await openPersistedContextSession(bbContext.id);
}

(async () => {
  await main();
})();

// Wait for enter key press
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