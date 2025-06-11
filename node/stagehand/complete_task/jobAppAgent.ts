import { Stagehand } from "@browserbasehq/stagehand";
import boxen from "boxen";
import chalk from "chalk";
import { z } from "zod"; // used for extract schema

const profile = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    headline: "Staff Software Engineer",
    phone: "1234567890",
    address: "Jersey City, New Jersey, United States",
    resumePath: "./resume.pdf",
  };

async function main() {
	const stagehand = new Stagehand({
		env: "BROWSERBASE", 
	});

    // Initialize the stagehand instance
	await stagehand.init();
	const page = stagehand.page;
    const agent = stagehand.agent();

    await page.goto(
        "https://jobs.workable.com/view/dbvD6SyquGD1b4d8FZtsLw/staff-software-engineer%2C-devices---(remote---new-york)-in-new-york-at-jobgether",
    );

    await agent.execute(`Fill in the fields with the following information: ${JSON.stringify(profile)}`);

    // DANGER!!
    // await page.act("click the submit button");
}

(async () => {
  await main();
})();