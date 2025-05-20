import { Stagehand } from "@browserbasehq/stagehand";
import chalk from "chalk";
import boxen from "boxen";
import dotenv from "dotenv";

dotenv.config();

function announce(message: string, title?: string) {
  console.log(
    boxen(message, {
      padding: 1,
      margin: 3,
      title: title || "Stagehand",
    })
  );
}

async function main() {
  console.log(
    [
      `🤘 ${chalk.yellow("Welcome to Stagehand!")}`,
      "",
      "Stagehand is a tool that allows you to automate browser interactions.",
      "In this quickstart, we'll be automating a parking ticket payment on the San Francisco Municipal Transportation Agency website.",
      "",
      `1. Navigate to ${chalk.blue(
        "https://wmq.etimspayments.com/pbw/include/sanfrancisco/input.jsp"
      )}`,
      `2. Use ${chalk.green("act")} to enter the license plate information`,
      `3. Select all tickets and submit the form`,
      `4. Fill out the payment information using ${chalk.green(
        "act"
      )} with variables`,
      "",
    ].join("\n")
  );

  // Initialize the stagehand instance
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    browserbaseSessionCreateParams: {
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      browserSettings: {
        // This site has a custom captcha that we need to solve
        // more details on handling custom captchas in the Browserbase Docs:
        // https://docs.browserbase.com/features/stealth-mode#custom-captcha-solving
        captchaImageSelector: "img[id='captcha']",
        captchaInputSelector: "input[size='10']",
      },
    },
  });

  await stagehand.init();
  const page = stagehand.page;

  if (stagehand.env === "BROWSERBASE") {
    console.log(
      boxen(
        `View this session live in your browser: \n${chalk.blue(
          `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`
        )}`,
        {
          title: "Browserbase",
          padding: 1,
        }
      )
    );
  }

  await stagehand.page.goto(
    "https://wmq.etimspayments.com/pbw/include/sanfrancisco/input.jsp"
  );

  await page.act({
    action: "Enter the plate number 8XWY857 and then search for citations.",
  });

  await page.act({
    action:
      "Select the 'I would like to pay for all tickets' radio button. Then click the 'Submit' button.",
  });

  await page.act({
    action:
      "Enter the following information:\n" +
      "Name on the card: %nameOnCard%\n" +
      "Address: %address%\n" +
      "City: %city%\n" +
      "State: %state%\n" +
      "Zip code: %zip%" +
      "Card number: %cardNumber%\n" +
      "Expiration date month: %expirationDateMonth%\n" +
      "Expiration date year: %expirationDateYear%\n" +
      "CVV: %cvv%\n",
    variables: {
      cardNumber: "4111111111111111",
      expirationDateMonth: "05 - May",
      expirationDateYear: "2025",
      cvv: "123",
      nameOnCard: "John Doe",
      address: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zip: "94101",
    },
  });

  await page.act({
    action: "Click the 'Submit' button.",
  });

  await stagehand.close();

}

(async () => {
  await main().catch(console.error);
})();
