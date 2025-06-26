import { ConstructorParams, Stagehand } from "@browserbasehq/stagehand";
import dotenv from "dotenv";

dotenv.config();

const stagehandConfig = (): ConstructorParams => ({
  env: "BROWSERBASE",
  modelName: "openai/gpt-4o-mini",
  modelClientOptions: { apiKey: process.env.MODEL_API_KEY! },
  browserbaseSessionCreateParams: {
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserSettings: {
      extensionId: process.env.EXTENSION_ID!,
    },
  },
});
const stagehand = new Stagehand(stagehandConfig());
await stagehand.init();
const page = stagehand.page;

// log in to 1password
await page.goto("chrome-extension://aeblfdkhhhdcdjpifhhbdiojplfjncoa/app/app.html#/page/welcome");
await page.act("click the Continue button");
await page.act("click the Sign in button");
await page.act(`type '${process.env.PASS_USERNAME}' into the email input`);
await page.act("click the Continue button");
await page.act(`type '${process.env.PASS_SECRETKEY}' into the Secret Key input`);
await page.act(`type '${process.env.PASS_PASSWORD}' into the Password input`);
await page.act("click the Sign In button");
await page.waitForLoadState("networkidle");

// log in to browserbase using the credentials from 1password
await page.goto("https://browserbase.com/sign-in");
await page.waitForLoadState("networkidle");

await page.close();