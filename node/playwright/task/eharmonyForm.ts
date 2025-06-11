import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk/index.mjs";
import * as dotenv from 'dotenv';
dotenv.config();

const BROWSERBASE_API_KEY = process.env["BROWSERBASE_API_KEY"]!;
const BROWSERBASE_PROJECT_ID = process.env["BROWSERBASE_PROJECT_ID"]!;
const ACCOUNT_EMAIL = process.env["ACCOUNT_EMAIL"]!;

const formData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
    message: "I am an authorized agent of the trademark owner",
};

const bb = new Browserbase({
  apiKey: BROWSERBASE_API_KEY,
});

(async () => {
    // Create a new session
    const session = await bb.sessions.create({
        projectId: BROWSERBASE_PROJECT_ID,
        browserSettings: {
            // This workflow REQUIRES advancedStealth which is only available on the Scale plan
            advancedStealth: true,
        },
        proxies:  true,
    });

    // Connect to the session
    const browser = await chromium.connectOverCDP(session.connectUrl);

    // Getting the default context to ensure the sessions are recorded.
    const defaultContext = browser.contexts()[0];
    const page = defaultContext?.pages()[0];

    await page.goto('https://support.eharmony.com/app/ask/c/30/p/4/baseurl/www.eharmony.co.uk/baseprotocol/http');
    await page.waitForTimeout(10000);



    // log the full page source
    console.log(await page.content());

    // // Fill in email address
    // await page.locator("input[placeholder='Enter your email address']").click()
    // await page.locator("input[placeholder='Enter your email address']").fill(ACCOUNT_EMAIL)

    // // Remove 'disabled' attribute
    // await page.evaluate(() => {
    //   document.querySelector('.submit-button')?.removeAttribute('disabled');
    // });

    // // Set { bubbles: true }
    // await page.evaluate(() => {
    //     const button = document.querySelector('.submit-button');
    //     if (button) {
    //         const event = new MouseEvent('click', { bubbles: true });
    //         button.dispatchEvent(event);
    //     }
    // });
    // // wait for 10 seconds
    // await page.waitForTimeout(10000);

    // // clock done button
    // await page.locator("button[type='button']").click();

    // await page.evaluate(() => {
    //   (document.querySelector("input[type='radio'][id='extra_cfgoods_no']") as HTMLElement)?.click();
    // });

    // // Click "I am an authorized agent of the trademark owner" radio button
    // await page.evaluate(() => {
    //     (document.querySelector("input[type='radio'][id='I am an authorized agent of the trademark owner']") as HTMLElement)?.click();
    // });
    
    // // Click all checkboxes
    // await page.evaluate(() => {
    //     document.querySelectorAll("input[type='checkbox']").forEach(checkbox => (checkbox as HTMLElement).click());
    // });

    await page.waitForTimeout(10000);

    await page.close();
    await browser.close();
    console.log(
    `Session complete! View replay at https://browserbase.com/sessions/${session.id}`,
    );

})().catch((error) => console.error(error.message));
