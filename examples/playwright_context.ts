import Browserbase from "@browserbasehq/sdk";
import { chromium, type Browser, type Cookie } from "playwright-core";

// Configuration
const CONTEXT_TEST_URL = "https://github.com";
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

async function findCookie(
  browser: Browser,
  name: string
): Promise<Cookie | undefined> {
  const [defaultContext] = browser.contexts();
  const cookies = await defaultContext?.cookies();
  return cookies?.find((cookie) => cookie.name === name);
}

async function runSessionWithContextPersistence() {
  let contextId: string;
  let sessionId: string;
  let testCookieName: string;
  let testCookieValue: string;

  try {
    // Step 1: Create a context
    console.log("Creating a new context...");
    const context = await bb.contexts.create({
      projectId: BROWSERBASE_PROJECT_ID,
    });
    contextId = context.id;
    console.log(`Context created with ID: ${contextId}`);

    // Step 2: Create a session with the context
    console.log("Creating a session with the context...");
    const session = await bb.sessions.create({
      projectId: BROWSERBASE_PROJECT_ID,
      browserSettings: {
        context: {
          id: contextId,
          persist: true,
        },
      },
    });
    sessionId = session.id;
    console.log(`Session created with ID: ${sessionId}`);
    console.log(
      `\n\n🅱️ View this session (with context persistence) live at https://browserbase.com/sessions/${sessionId}\n\n`
    );

    // Step 3: Populate and persist the context
    console.log(`Populating context ${contextId} during session ${sessionId}`);
    const browser = await chromium.connectOverCDP(session.connectUrl);
    const browserContext = browser.contexts()[0]!;
    const page = browserContext.pages()[0]!;

    await page.goto(CONTEXT_TEST_URL, { waitUntil: "domcontentloaded" });

    // Set a random cookie on the page
    const now = new Date();
    testCookieName = `bb_${now.getTime().toString()}`;
    testCookieValue = now.toISOString();

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

    // Validate cookie persistence between pages
    await page.goto("https://www.google.com", {
      waitUntil: "domcontentloaded",
    });
    await page.goBack();

    const cookie = await findCookie(browser, testCookieName);
    console.log("Cookie persisted between pages:", !!cookie);

    await page.close();
    await browser.close();

    // Wait for context to persist
    console.log("Waiting for context to persist...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Step 4: Create another session with the same context
    console.log("Creating a new session with the same context...");
    const newSession = await bb.sessions.create({
      projectId: BROWSERBASE_PROJECT_ID,
      browserSettings: {
        context: {
          id: contextId,
        },
      },
    });
    sessionId = newSession.id;
    console.log(
      `\n\n🅱️ View this session (without context persistence) live at https://browserbase.com/sessions/${sessionId}\n\n`
    );

    // Step 5: Verify previous state
    console.log(`Reusing context ${contextId} during session ${sessionId}`);
    const newBrowser = await chromium.connectOverCDP(newSession.connectUrl);
    const newPage = newBrowser.contexts()[0]!.pages()[0]!;

    await newPage.goto(CONTEXT_TEST_URL, { waitUntil: "domcontentloaded" });

    const foundCookie = await findCookie(newBrowser, testCookieName);
    console.log("Cookie found in new session:", !!foundCookie);
    console.log(
      "Cookie value matches:",
      foundCookie?.value === testCookieValue
    );

    await newPage.close();
    await newBrowser.close();

    console.log("Context persistence test completed successfully!");
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

// Run the script
runSessionWithContextPersistence();
