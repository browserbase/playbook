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
          `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`
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
  await page.goto("https://stagehand.mintlify.app/");

  const description = await stagehand.extract({
    instruction: "extract the title, description, and link of the quickstart",
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
        `: The ${chalk.bgYellow(description.title)} is at: ${chalk.bgYellow(
          chalk.blue(description.link)
        )}` +
        `\n\n${chalk.bgYellow(description.description)}` +
        `\n\n${chalk.gray(JSON.stringify(description, null, 2))}`,
      {
        title: "Extract",
        padding: 1,
        margin: 3,
      }
    )
  );

  const observeResult = await stagehand.observe({
    instruction: "Find the links under the 'Get Started' section",
  });
  console.log(
    boxen(
      chalk.green(`Get Started`) +
        `: We can click:\n${observeResult
          .map(
            (r) =>
              `"${chalk.yellow(r.description)}" -> ${chalk.gray(r.selector)}`
          )
          .join("\n")}`,
      {
        title: "Observe",
        padding: 1,
        margin: 3,
      }
    )
  );

  //   In the event that your Playwright code fails, you can use the `act` method to
  //   let Stagehand AI take over and complete the action.
  try {
    throw new Error("Comment me out to run the base Playwright code!");

    // Wait for search button and click it
    const quickStartSelector = `#content-area > div.relative.mt-8.prose.prose-gray.dark\:prose-invert > div > a:nth-child(1)`;
    await page.waitForSelector(quickStartSelector);
    await page.locator(quickStartSelector).click();
    await page.waitForLoadState("networkidle");
    console.log(
      boxen(
        `Clicked the quickstart link using base Playwright code. ${chalk.yellow(
          "Uncomment line 82 in index.ts to have Stagehand take over!"
        )}`,
        {
          padding: 1,
          margin: 3,
        }
      )
    );
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(
        boxen(
          `${chalk.red("Looks like an error occurred running Playwright. Let's have Stagehand take over!")} \n${chalk.gray(
            e.message
          )}`,
          {
            padding: 1,
            margin: 3,
          }
        )
      );
      const actResult = await stagehand.act({
        action: "Click the link to the quickstart",
      });
      console.log(
        boxen(
          `${chalk.green("Attempted to click the quickstart link using Stagehand AI.")} \n${chalk.gray(
            JSON.stringify(actResult, null, 2)
          )}`,
          {
            padding: 1,
            margin: 3,
          }
        )
      );
    }
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
          `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`
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
