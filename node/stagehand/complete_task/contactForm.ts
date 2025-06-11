import { Stagehand } from "@browserbasehq/stagehand";
import boxen from "boxen";
import chalk from "chalk";
import { z } from "zod"; // used for extract schema

async function main() {
	const stagehand = new Stagehand({
		env: "BROWSERBASE", // Environment to run in: LOCAL or BROWSERBASE
	});

    // Initialize the stagehand instance
	await stagehand.init();
	const page = stagehand.page;

	// Log your session recording in the terminal so you can see it
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

    // Navigate to the page + take some action
	await page.goto('https://www.browserbase.com/contact');
	const contact_page = await page.observe({ instruction: "What are the fields can be filled in?" });
	console.log(contact_page);
	await page.act({action: "Fill in the fields with name: %name% email: %email% phone: %phone% message: %message%",
	  variables: {
		name: "John Doe",
		email: "john.doe@example.com",
		phone: "1234567890",
		message: "Hello, I am interested in your services."
	  }
	});
	await page.waitForTimeout(3000);

    // Close the stagehand instance
	await stagehand.close();
}

main();