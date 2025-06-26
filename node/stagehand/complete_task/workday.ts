import { Stagehand, type ConstructorParams } from "@browserbasehq/stagehand";
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const contextId = process.env.BROWSERBASE_CONTEXT_ID;
const variables = {
  USERNAME: process.env.WORKDAY_USERNAME,
  PASSWORD: process.env.WORKDAY_PASSWORD
};

// Stagehand configuration
const stagehandConfig = (): ConstructorParams => {
  return {
    env: 'BROWSERBASE',
    verbose: 1,
    modelName: 'google/gemini-2.5-flash-preview-05-20',
    modelClientOptions: {
      apiKey: process.env.GOOGLE_API_KEY,
    },
    browserbaseSessionCreateParams: {
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      browserSettings: {
        ...(contextId !== undefined ? {
          context: {
            id: contextId,
            persist: true,
          },
        } : {}),
      },
    },
  };
};

async function runWorkflow() {
  let stagehand: Stagehand | null = null;
  
  try {
    // Initialize Stagehand
    console.log("Initializing Stagehand...");
    stagehand = new Stagehand(stagehandConfig());
    await stagehand.init();
    console.log("Stagehand initialized successfully.");
    
    // Get the page instance
    const page = stagehand.page;
    if (!page) {
      throw new Error("Failed to get page instance from Stagehand");
    }
  
    
// Step 1: Navigate to URL
console.log("Navigating to: https://impl.workday.com/wday/authgwy/pgahq8/login.htmld");
await page.goto("https://impl.workday.com/wday/authgwy/pgahq8/login.htmld");
    
// Step 2: Perform action
console.log("Performing action: click the Workday Native Login option");
await page.act({
  description: "click the Workday Native Login option",
  method: "click",
  arguments: [],
  selector: "xpath=/html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/ul[1]/li[1]/div[1]"
});
    
// Step 3: Login action - only execute if no contextId
if (!contextId) {
  // Step 3: Perform action
  console.log(`Performing action: type ${variables.USERNAME} into the Username input`);
  await page.act({
    description: `type ${variables.USERNAME} into the Username input`,
    method: "fill",
    arguments: [variables.USERNAME],
    selector: "xpath=/html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[3]/div[1]/div[1]/input[1]"
  });
}
    
// Step 4: Login action - only execute if no contextId
if (!contextId) {
  // Step 4: Perform action
  console.log(`Performing action: type Password input`);
  await page.act({
    description: `type ${variables.PASSWORD} into the Password input`,
    method: "fill",
    arguments: [variables.PASSWORD],
    selector: "xpath=/html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[3]/div[2]/div[1]/input[1]"
  });
}
    
// Step 5: Login action - only execute if no contextId
if (!contextId) {
  // Step 5: Perform action
  console.log("Performing action: click the Sign In button");
  await page.act({
    description: "click the Sign In button",
    method: "click",
    arguments: [],
    selector: "xpath=/html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[3]/button[1]"
  });
}
    
    
    console.log("Workflow completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Workflow failed:", error);
    return { success: false, error };
  } finally {
    // Clean up
    if (stagehand) {
      console.log("Closing Stagehand connection.");
      try {
        await stagehand.close();
      } catch (err) {
        console.error("Error closing Stagehand:", err);
      }
    }
  }
}


// Single execution
runWorkflow().then((result) => {
  console.log('Execution result:', result);
  process.exit(result.success ? 0 : 1);
});


export default runWorkflow;