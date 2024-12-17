import Browserbase from "@browserbasehq/sdk";
import { Stagehand } from "@browserbasehq/stagehand";
import { ContextCreateResponse } from "@browserbasehq/sdk/resources/contexts";
import * as readline from "node:readline";

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY!;
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID!;

const WEBSITE_TO_PERSIST_COOKIES = "https://docs.browserbase.com";
const TEST_COOKIE_NAME = "TEST_PERSISTED_CONTEXT_COOKIE";

// Create a persisted context
async function createContext(): Promise<ContextCreateResponse> {
  const browserbase = new Browserbase({
    apiKey: BROWSERBASE_API_KEY,
  });

  const context = await browserbase.contexts.create({
    projectId: BROWSERBASE_PROJECT_ID,
  });

  return context;
}

// This function creates a context and a session, then retrieves the session with the persisted context
async function getSessionWithPersistedContext(url: string) {
  const context = await createContext();
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    browserbaseSessionCreateParams: {
      projectId: BROWSERBASE_PROJECT_ID,
      browserSettings: {
        context: {
          id: context.id,
          persist: true,
        },
      },
    },
  });

  // Create the session first
  await stagehand.init();
  await stagehand.page.goto(url);

  const browserbase = new Browserbase({
    apiKey: BROWSERBASE_API_KEY,
  });

  const debugPersistedSession = await browserbase.sessions.debug(
    stagehand.browserbaseSessionID!
  );

  console.log("\n\n");
  console.log(`CONTEXT_ID="${context.id}"`);
  console.log(`SESSION_ID="${stagehand.browserbaseSessionID}"`);
  console.log("\n");
  console.log(
    "Open (cmd+click) this URL in your browser to login to a web page yourself"
  );
  console.log(debugPersistedSession.debuggerFullscreenUrl);
  console.log("\n\n");
  console.log(
    "Press Enter to end this session and start a new one with the same context..."
  );
  // Wait for the user to press Enter
  await new Promise((resolve) =>
    readline
      .createInterface({ input: process.stdin, output: process.stdout })
      .question("", async () => {
        // Set a random cookie on the page
        const now = new Date();
        const testCookieValue = now.toISOString();

        await stagehand.context.addCookies([
          {
            domain: `.${new URL(WEBSITE_TO_PERSIST_COOKIES).hostname}`,
            expires: new Date(now.getTime() + 60 * 60 * 1000).getTime() / 1_000, // 1 hour,
            name: TEST_COOKIE_NAME,
            path: "/",
            value: testCookieValue,
          },
        ]);

        console.log(`Set test cookie: ${TEST_COOKIE_NAME}=${testCookieValue}`);
        await stagehand.close();
        resolve(void 0);
      })
  );
  return context;
}

async function main() {
  const context = await getSessionWithPersistedContext(
    WEBSITE_TO_PERSIST_COOKIES
  );

  // Now we can create a new session with the same context that has the cookies from the previous session
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    browserbaseSessionCreateParams: {
      projectId: BROWSERBASE_PROJECT_ID,
      browserSettings: {
        context: {
          id: context.id,
          persist: false, // We don't need to persist this context once we have the cookies
        },
      },
    },
  });
  await stagehand.init();

  await stagehand.page.goto(WEBSITE_TO_PERSIST_COOKIES);
  // Add wait for network idle to ensure page is fully loaded
  await stagehand.page.waitForLoadState("networkidle");

  const cookies = await stagehand.context.cookies();
  if (!cookies || cookies.length === 0) {
    console.log("No cookies found in context");
    return;
  }

  const testCookie = cookies.find((cookie) => cookie.name === TEST_COOKIE_NAME);
  console.log("Found cookie:", testCookie);

  await stagehand.page.goto(WEBSITE_TO_PERSIST_COOKIES);
  await stagehand.close();
}

main();
