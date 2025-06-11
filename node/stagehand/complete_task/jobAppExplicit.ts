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

    await page.goto(
        "https://jobs.workable.com/view/dbvD6SyquGD1b4d8FZtsLw/staff-software-engineer%2C-devices---(remote---new-york)-in-new-york-at-jobgether",
    );

    await page.act("accept cookies");

    await page.act("click apply now");

    await page.act({
        action: "type %firstName% into the first name field",
        variables: {
        firstName: profile.firstName,
        },
    });

    await page.act({
        action: "type %lastName% into the last name field",
        variables: {
        lastName: profile.lastName,
        },
    });

    await page.act({
        action: "type %email% into the email field",
        variables: {
        email: profile.email,
        },
    });

    await page.act({
        action: "type %headline% into the headline field",
        variables: {
        headline: profile.headline,
        },
    });

    await page.act({
        action: "type %phone% into the phone field",
        variables: {
        phone: profile.phone,
        },
    });

    await page.act({
        action: "type %address% into the address field",
        variables: {
        address: profile.address,
        },
    });

    await page.act({
        action: "click the upload resume button",
    });

    // Add resume upload here
    // const fileChooserPromise = page.waitForEvent("filechooser");
    // const fileChooser = await fileChooserPromise;
    // await fileChooser.setFiles(path.join(__dirname, profile.resumePath));

    await page.act("click the LabelText after the 'yes' radio button");

    await page.act("type 120,000 into the salary expectations field");

    // DANGER!!
    // await page.act("click the submit button");
}

(async () => {
  await main();
})();