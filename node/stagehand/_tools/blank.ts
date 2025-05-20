import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod"; // used for extract schema

async function main() {
	const stagehand = new Stagehand({
		env: "BROWSERBASE", // Environment to run in: LOCAL or BROWSERBASE
	});

    // Initialize the stagehand instance
	await stagehand.init();
	const page = stagehand.page;

    // Navigate to the page + take some action

    // Close the stagehand instance
	await stagehand.close();
}

main();