import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";
import { config } from "dotenv";
config();

console.info("Launching browser...");

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY;
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;

const bb = new Browserbase({
  apiKey: BROWSERBASE_API_KEY,
});

(async () => {
  // Create a new session
  const session = await bb.sessions.create({
    projectId: BROWSERBASE_PROJECT_ID,
    keepAlive: true,
    proxies: true,
    browserSettings: {
      context:
      {
        id: BROWSERBASE_CONTEXT_ID,
        persist: true,
      }
    }
  });
  
  // Connect to the session
  const browser = await chromium.connectOverCDP(session.connectUrl);

  // Getting the default context to ensure the sessions are recorded.
  const defaultContext = browser.contexts()[0];
  const page = defaultContext?.pages()[0];
  console.log(
    `View sessionreplay at https://browserbase.com/sessions/${session.id}`,
  );
  const airline = await page.goto("https://www.aeromexico.com/en-us");

  // Wait for cookie accept button to be visible
  await page.waitForSelector('.CookiesModal--btn.Btn.Btn--filledRed', { state: 'visible', timeout: 60000})
  // Click the accept button
  await page.locator('button').filter({ hasText: 'Accept' }).click();
  // Wait for cookie modal to disappear
  await page.waitForSelector('.Modal.Modal--HOME_COOKIES', { state: 'hidden' })

  // Wait for the airport origin input field to appear
  await page.getByPlaceholder('Type an origin').click()
  await page.getByPlaceholder('Type an origin').fill('SFO');

  // // Wait for suggestions list to appear and select first matching option 
  await page.waitForSelector('.NewBookerAirportAutocompleteList')
  await page.locator('.NewBookerAirportAutocompleteList').first().click()

  await page.getByPlaceholder('Please type a destination.').click();
  await page.getByPlaceholder('Please type a destination.').fill('MEX');
  
  // Wait for suggestions list to appear and select first matching option 
  await page.waitForSelector('.NewBookerAirportAutocompleteList')
  await page.locator('.NewBookerAirportAutocompleteList').first().click()

  await page.getByText('Departure — Return').click();
  await page.getByRole('button', { name: '1', exact: true }).nth(1).click();
  await page.getByRole('button', { name: '8', exact: true }).nth(1).click();

  await page.getByLabel('Find flight').click();

  // wait for 20 seconds
  await new Promise(resolve => setTimeout(resolve, 20000));

  // console log the page source
  // console.log("Waiting for FlightOptionsList-flightOption to be visible...");
  // await page.waitForSelector('.FlightOptionsList-flightOption', {
  //   state: 'visible', // Ensure the element is visible (default is 'attached')
  // });
  // console.log('FlightOptionsList-flightOption is now visible!');

  // console log the page source with pretty print
  console.log(JSON.stringify(await page.content(), null, 2));
  // console.log(await page.content());

  await page.close();
  await browser.close();
})().catch((error) => console.error(error.message));