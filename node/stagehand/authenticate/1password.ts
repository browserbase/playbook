import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import sdk from "@1password/sdk";

async function main() {
  // Initialize 1Password SDK client for secure credential retrieval
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN!,
    integrationName: "My Browserbase and 1Password Integration",
    integrationVersion: "v1.0.0",
  });

  // Initialize Stagehand with Browserbase environment
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
  });
  await stagehand.init();

  // Retrieve credentials from 1Password vault
  const username = await client.secrets.resolve("op://Browserbase Agent/Browserbase/username");
  const password = await client.secrets.resolve("op://Browserbase Agent/Browserbase/password");

  // Navigate to Browserbase sign-in page
  const page = stagehand.page;
  await page.goto("https://www.browserbase.com/sign-in", { waitUntil: "domcontentloaded" });
  console.log('Navigated to Browserbase sign-in page')

  // Login process
  await page.act({
    action: "Type in the username: %username%",
    variables: {
      username: username,
    },
  });
  console.log('Typed in the username')

  await page.act('Click continue')
  console.log('Clicked continue')

  await page.act({
    action: "Type in the password: %password%",
    variables: {
      password: password,
    },
  });
  console.log('Typed in the password')

  await page.act('Click the sign in button')
  console.log('Clicked the sign in button')

  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded')
  console.log('Page loaded')

  // Extract project information from the dashboard
  const { projectId } = await page.extract({
    instruction: "Extract the project ID of the Browserbase account",
    schema: z.object({
      projectId: z.string(),
    }),
  });

  const { totalSessions } = await page.extract({
    instruction: "Extract the total sessions for the period for the project",
    schema: z.object({
      totalSessions: z.number(),
    }),
  });

  console.log('For Project ID: ', projectId, ' the total sessions for the last 30 days is: ', totalSessions)

  // Close the stagehand session
  await stagehand.close();
}

main();