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
	await page.goto("https://aryanashville.com/");
	await page.act( "close pop up");
  
	await page.act("Click on the 'Floorplans' from the navigation menu");
	const floorplans = await page.extract({
	  instruction: "Extract the floorplans from the page",
	  schema: z.object({
		floorplans: z.array(z.object({
		  floorplan_name: z.string(),
		  floorplan_price: z.string(),  
		  floorplan_sqft: z.string(),
		  floorplan_bedrooms: z.string(),
		  floorplan_bathrooms: z.string(),
		  floorplan_link: z.string(),
		}))
	  })
	});
	console.log(floorplans);

    // Close the stagehand instance
	await stagehand.close();
}

main();