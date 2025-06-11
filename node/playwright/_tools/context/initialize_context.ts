import { Browserbase } from "@browserbasehq/sdk";
import { chromium } from "playwright-core";

const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

async function createContext() {
  const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });
  const context = await bb.contexts.create({ projectId: process.env.BROWSERBASE_PROJECT_ID! });
  return context.id;
}

async function useContext(contextId: string) {
  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    keepAlive: true, // Keep the session alive after the script is done - you will need to close the session manually
    browserSettings: {
      context: { 
        id: contextId, 
        persist: true 
        }
    }
  })
  return session;
}

async function getLiveDebugURL(sessionId: string) {
  const options = {
      method: 'GET',
      headers: {'X-BB-API-Key': `${process.env.BROWSERBASE_API_KEY}`}
      };
  const response = await fetch(`https://api.browserbase.com/v1/sessions/${sessionId}/debug`, options);
  const json = await response.json();
  return json.debuggerUrl;
  };

(async () => {
  // Create session with context
  console.log("Creating context...");
  const contextId = await createContext();
  console.log("Creating session with context ID:", contextId);
  const session = await useContext(contextId);

  // Get live debug URL to interact with the session
  const liveDebugURL = await getLiveDebugURL(session.id);
  console.log("Live Debug URL: " + liveDebugURL);

  // Connect to the session
  const browser = await chromium.connectOverCDP(session.connectUrl);
  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0];

  // Navigate to the page
  await page.goto("https://en.wikipedia.org/wiki/Main_Page");
  await page.waitForTimeout(10000);

  // YOU WILL INTERACT WITH THE SESSION HERE

  // View session replay
  console.log("View session replay at https://browserbase.com/sessions/" + session.id);
})();