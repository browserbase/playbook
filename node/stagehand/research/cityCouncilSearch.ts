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
	await page.goto("https://phila.legistar.com/");
	
	await page.act({action: "click calendar from the navigation menu"})
	await page.act({action: "select 2025 from the month dropdown"})

	const results = await page.extract({
	  instruction: "Extract the table with the name, date and time of the events",
	  schema: z.object({
		results: z.array(z.object({
		  name: z.string(),
		  date: z.string(),
		  time: z.string(),
		})),
	  })
	});
	console.log(results);

    // Close the stagehand instance
	await stagehand.close();
}

main();