// Generated script for workflow 9109cecf-fbc1-4645-9c22-699057e510d0
// Generated at 2025-06-24T21:41:45.902Z



import { Stagehand, type ConstructorParams } from "@browserbasehq/stagehand";
import { z } from 'zod';

// Stagehand configuration
const stagehandConfig = (): ConstructorParams => {
  return {
    env: 'BROWSERBASE',
    verbose: 1,
    modelName: 'google/gemini-2.5-flash-preview-05-20',
    modelClientOptions: {
      apiKey: process.env.GOOGLE_API_KEY,
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
    
    
    const variables = {
  input_9109ce_1: "Elon Musk unfollow Trump"
};
    
// Step 1: Navigate to URL
console.log("Navigating to: https://polymarket.com/");
await page.goto("https://polymarket.com/");
    
// Step 2: Perform action
console.log("Performing action: click the search box at the top of the page");
await page.act({
  description: "click the search box at the top of the page",
  method: "click",
  arguments: [],
  selector: "xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[2]/form[1]/div[1]/input[1]"
});
    
// Step 3: Perform action
console.log("Performing action: type 'Elon Musk unfollow Trump' into the search box");
await page.act({
  description: "type 'Elon Musk unfollow Trump' into the search box",
  method: "fill",
  arguments: [variables.input_9109ce_1],
  selector: "xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[2]/form[1]/div[1]/input[1]"
});
    
// Step 4: Perform action
console.log("Performing action: click the first Will Elon Musk unfollow Donald Trump before July? market result");
await page.act({
  description: "click the first 'Will Elon Musk unfollow Donald Trump before July?' market result",
  method: "click",
  arguments: [],
  selector: "xpath=/html[1]/body[1]/div[1]/div[2]/nav[1]/div[1]/div[2]/form[1]/div[2]/div[1]/div[1]/div[3]/a[1]"
});
    
// Step 5: Extract data
console.log("Extracting: Extract the current odds and market information for the Elon Musk unfollowing Donald Trump prediction market");
const extractedData5 = await page.extract({
  instruction: "Extract the current odds and market information for the Elon Musk unfollowing Donald Trump prediction market",
  schema: z.object({
  marketTitle: z.string().optional(),
  currentOdds: z.string().optional(),
  yesPrice: z.string().optional(),
  noPrice: z.string().optional(),
  totalVolume: z.string().optional(),
  priceChange: z.string().optional()
})
});
console.log("Extracted:", extractedData5);
    
    
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