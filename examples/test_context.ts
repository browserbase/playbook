import Browserbase from "@browserbasehq/sdk";
import { Stagehand } from "@browserbasehq/stagehand";

// Configuration
const CONTEXT_TEST_URL = "https://docs.browserbase.com";
const BROWSERBASE_PROJECT_ID = process.env["BROWSERBASE_PROJECT_ID"]!;
const BROWSERBASE_API_KEY = process.env["BROWSERBASE_API_KEY"]!;

const bb = new Browserbase({
  apiKey: BROWSERBASE_API_KEY,
});

// Helper functions
function addHour(date: Date): number {
  const SECOND = 1000;
  return new Date(date.getTime() + 60 * 60 * 1000).getTime() / SECOND;
}

async function findCookie(stagehand: Stagehand, name: string) {
  const defaultContext = stagehand.context;
  const cookies = await defaultContext?.cookies();
  return cookies?.find((cookie) => cookie.name === name);
}

async function createContext() {
  console.log("Creating a new context...");
  const context = await bb.contexts.create({
    projectId: BROWSERBASE_PROJECT_ID,
  });
  const contextId = context.id;
  console.log(`Context created with ID: ${contextId}`);
  return contextId;
}

async function setRandomCookie(contextId: string, stagehand: Stagehand) {
  console.log(
    `Populating context ${contextId} during session ${stagehand.browserbaseSessionID}`
  );
  const browserContext = stagehand.context;
  const page = browserContext.pages()[0]!;

  await page.goto(CONTEXT_TEST_URL, { waitUntil: "domcontentloaded" });

  // Step 3: Set a random cookie on the page
  const now = new Date();
  const testCookieName = `bb_${now.getTime().toString()}`;
  const testCookieValue = now.toISOString();

  await browserContext.addCookies([
    {
      domain: `.${new URL(CONTEXT_TEST_URL).hostname}`,
      expires: addHour(now),
      name: testCookieName,
      path: "/",
      value: testCookieValue,
    },
  ]);

  console.log(`Set test cookie: ${testCookieName}=${testCookieValue}`);
  return { testCookieName, testCookieValue };
}

async function validateCookiePersistenceBetweenPages(
  stagehand: Stagehand,
  testCookieName: string
) {
  const page = stagehand.page;
  await page.goto("https://www.google.com", {
    waitUntil: "domcontentloaded",
  });
  await page.goBack();

  const cookie = await findCookie(stagehand, testCookieName);
  const found = !!cookie;
  console.log("Cookie persisted between pages:", found);
  if (!found) {
    throw new Error("Cookie not found between pages");
  }
  return found;
}

async function initStagehandWithContext(contextId: string, persist: boolean) {
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    // These are the parameters that can be used in browserbase.sessions.create()
    browserbaseSessionCreateParams: {
      projectId: BROWSERBASE_PROJECT_ID,
      browserSettings: {
        context: {
          id: contextId,
          persist: persist,
        },
      },
    },
  });
  await stagehand.init();
  return stagehand;
}

async function main() {
  try {
    // Step 1: Create a context
    const contextId = await createContext();

    // Step 2: Instantiate Stagehand with the context to persist
    // We will be adding cookies to the context in this session, so we need mark persist=true
    const stagehand = await initStagehandWithContext(contextId, true);

    // Step 3: Set a random cookie on the page
    const { testCookieName, testCookieValue } = await setRandomCookie(
      contextId,
      stagehand
    );

    // Step 4: Validate cookie persistence between pages
    await validateCookiePersistenceBetweenPages(stagehand, testCookieName);
    await stagehand.close();

    // Wait for context to persist
    console.log("Waiting for context to persist...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Step 5: Create another session with the same context
    console.log("Creating a new session with the same context...");
    // We don't need to persist cookies in this session, so we can mark persist=false
    const newStagehand = await initStagehandWithContext(contextId, false);
    console.log(
      `Reusing context ${contextId} during session ${newStagehand.browserbaseSessionID}`
    );
    const newPage = newStagehand.page;
    await newPage.goto(CONTEXT_TEST_URL, { waitUntil: "domcontentloaded" });

    // Step 6: Verify cookie persistence across sessions
    const foundCookie = await findCookie(newStagehand, testCookieName);
    console.log("Cookie found in new session:", !!foundCookie);
    console.log(
      "Cookie value matches:",
      foundCookie?.value === testCookieValue
    );

    await newStagehand.close();

    console.log(
      `\n\n🅱️ View this session recording at https://browserbase.com/sessions/${stagehand.browserbaseSessionID}\n\n`
    );

    console.log("Context persistence test completed successfully!");
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

// Run the script
main();
