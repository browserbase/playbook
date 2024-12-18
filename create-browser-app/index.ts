import StagehandConfig from "./stagehand.config.ts";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import chalk from "chalk";
import boxen from "boxen";

async function main() {
  const stagehand = new Stagehand({
    ...StagehandConfig,
  });
  await stagehand.init();
  const page = stagehand.page;

  if (StagehandConfig.env === "BROWSERBASE") {
    console.log(
      boxen(
        `View this session live in your browser: \n${chalk.blue(
          `https://browserbase.com/session/${stagehand.browserbaseSessionID}`
        )}`,
        {
          title: "Browserbase",
          padding: 1,
          margin: 3,
        }
      )
    );
  }

  //   You can use the `page` instance to write any Playwright code
  //   For more info: https://playwright.dev/docs/pom
  await page.goto("https://www.google.com");

  //   In the event that your Playwright code fails, you can use the `act` method to
  //   let Stagehand AI take over and complete the action.
  try {
    throw new Error("Comment me out to run the base Playwright code!");
    await page.locator('textarea[name="q"]').click();
    await page.locator('textarea[name="q"]').fill("Stagehand GitHub");
    await page.keyboard.press("Enter");
    await page.waitForLoadState("networkidle");
  } catch {
    await stagehand.act({
      action: "type in 'Stagehand GitHub' in the search bar and hit enter",
    });
  }

  const githubResult = await stagehand.extract({
    instruction: "find the github link in the search results",
    // Zod is a schema validation library similar to Pydantic in Python
    // For more information on Zod, visit: https://zod.dev/
    schema: z.object({
      title: z.string(),
      link: z.string(),
      description: z.string(),
    }),
  });
  console.log(
    boxen(
      chalk.green(`Extract`) +
        `: The top result is ${githubResult.title}: ${githubResult.link}. ${githubResult.description}`,
      {
        title: "Extract",
        padding: 1,
        margin: 3,
      }
    )
  );

  //   Click the first link in the search results to to the GitHub page
  try {
    //   Stagehand's `observe` method returns a list of selectors that can be used to interact with the page
    //   NOTE: you could also just do stagehand.act() to click the top result, but this is a good example of how to use observe
    const observeResult = await stagehand.observe({
      instruction: "Find the link to click to click the top result",
    });
    console.log(
      boxen(
        chalk.green(`Observe`) +
          `: We can click: ${observeResult.map((r) => r.selector).join(", ")}`,
        {
          title: "Observe",
          padding: 1,
          margin: 3,
        }
      )
    );

    // Click the selector at the top of the list
    await page.locator(`${observeResult[0].selector}`).click();
    await page.waitForLoadState("networkidle");
  } catch {
    await stagehand.act({
      action: "click the first link in the search results",
    });
  }
  await stagehand.close();

  if (StagehandConfig.env === "BROWSERBASE") {
    console.log(
      "Session completed. Waiting for 10 seconds to see the logs and recording..."
    );
    //   Wait for 10 seconds to see the logs
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log(
      boxen(
        `View this session recording in your browser: \n${chalk.blue(
          `https://browserbase.com/session/${stagehand.browserbaseSessionID}`
        )}`,
        {
          title: "Browserbase",
          padding: 1,
          margin: 3,
        }
      )
    );
  } else {
    console.log(
      "We hope you enjoyed using Stagehand locally! On Browserbase, you can bypass captchas, replay sessions, and access unparalleled debugging tools!\n10 free sessions: https://www.browserbase.com/sign-up\n\n"
    );
  }

  console.log(
    `🤘 Thanks for using Stagehand! Create an issue if you have any feedback: ${chalk.blue(
      "https://github.com/browserbase/stagehand/issues/new"
    )}\n`
  );
}

(async () => {
  await main().catch(console.error);
})();
