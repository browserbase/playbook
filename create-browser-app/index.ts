import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

async function main() {
  // Initialize Stagehand
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    enableCaching: true,
  });

  // Initialize the session and get the debugUrl
  const { debugUrl, sessionUrl } = await stagehand.init();

  console.log("🚀 Debug View:", debugUrl);

  // Navigate to the GitHub repository
  await stagehand.page.goto("https://github.com/browserbase/stagehand");

  // Click on the contributors link
  await stagehand.act({ action: "click on the contributors" });
  
  // Extract the top contributor
  const contributor = await stagehand.extract({
    instruction: "extract the top contributor",
    schema: z.object({
      username: z.string(),
      url: z.string(),
    }),
  });

  console.log({ contributor });

  // Close the session
  await stagehand.close();

  // Log the favorite contributor
  console.log(`Our favorite contributor is ${contributor.username}`);

  // view the session replay
  console.log("🚀 Session Replay:", sessionUrl);
}

main().catch(console.error);
