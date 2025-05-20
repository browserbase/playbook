import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const stagehand = new Stagehand({
	env: "BROWSERBASE",
});

await stagehand.init();
const page = stagehand.page;

const inputs = {
    "superpower": "Invisibility",
    "features_used": [
        "Stealth Mode",
        "Proxies",
        "Session Replay"
    ],
    "coolest_build": "A bot that automates form submissions across multiple sites.",
  }

// Navigate to the form
await page.goto("https://forms.gle/f4yNQqZKBFCbCr6j7");

// You can use the observe method to find the selector with an act command to fill it in
const superpowerSelector = await page.observe({instruction: `Find the selector for the superpower field: ${inputs.superpower}`});
console.log(superpowerSelector);
await page.act(superpowerSelector[0]);

// You can also explicitly specify the action to take
await page.act({action: "Select the features used: " + inputs.features_used.join(", ")});
await page.act({action: "Fill in the coolest_build field with the following value: " + inputs.coolest_build});

await page.act({action: "Click the submit button"});
await page.waitForTimeout(5000);

// Extract to log the status of the form
const status = await page.extract({instruction: "Extract the status of the form", schema: z.object({status: z.string()})});
console.log(status);

await stagehand.close();