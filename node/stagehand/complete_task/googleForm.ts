import { Stagehand } from "@browserbasehq/stagehand";
import boxen from "boxen";
import { z } from "zod";

async function main() {
	const stagehand = new Stagehand({
		/**
		 * With npx create-browser-app, this config is found 
		 * in a separate stagehand.config.ts file
		*/
		env: "BROWSERBASE", // Environment to run in: LOCAL or BROWSERBASE
        apiKey: process.env.BROWSERBASE_API_KEY /* API key for authentication */,
        projectId: process.env.BROWSERBASE_PROJECT_ID /* Project identifier */,

        // LLM configuration
        modelName: "google/gemini-2.0-flash" /* Name of the model to use */,
        modelClientOptions: {
            apiKey: process.env.GOOGLE_API_KEY,
        }
	});

    // Initialize the stagehand instance
	await stagehand.init();
	const page = stagehand.page;

    // If running in Browserbase, print a link to the session
    if (stagehand.env === "BROWSERBASE" && stagehand.browserbaseSessionID) {
        console.log(
          boxen(
            `View this session live in your browser: \n${
              `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`
            }`,
            {
              title: "Browserbase",
              padding: 1,
              margin: 3,
            },
          ),
        );
    }

    // Define the inputs for the form
    const inputs = {
        "superpower": "Invisibility",
        "features_used": [
            "Stealth Mode",
            "Proxies",
            "Session Replay"
        ],
        "coolest_build": "A bot that automates form submissions across multiple sites.",
    }
    // Navigate to page
    await page.goto("https://forms.gle/f4yNQqZKBFCbCr6j7");

    // You can use the observe method to find the selector with an act command to fill it in
    const superpowerSelector = await page.observe(`Find the selector for the superpower field: ${inputs.superpower}`);
    await page.act(superpowerSelector[0]);

    // You can also explicitly specify the action to take
    for (const feature of inputs.features_used) {
        await page.act("Select the features used: " + feature);
    }

    // Fill in the text field with the coolest project you have built
    await page.act("Fill in the Coolest Project you have built field with the following value: " + inputs.coolest_build);

    // Click the submit button
    await page.act("Click the submit button");

    // Wait for 5 seconds
    await page.waitForTimeout(5000);

    // Extract to log the status of the form
    const status = await page.extract({instruction: "Extract the status of the form", schema: z.object({status: z.string()})});
    console.log(status);

    // Close the stagehand instance
	await stagehand.close();
}

main();