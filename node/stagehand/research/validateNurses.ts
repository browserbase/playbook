import { ConstructorParams, Stagehand } from "@browserbasehq/stagehand";
import boxen from "boxen";
import chalk from "chalk";
import { z } from "zod"; // used for extract schema

const LicenseRecords = [
    {
        Site: "https://pod-search.kalmservices.net/",
        FirstName: "Ronald",
        LastName: "Agee",
        LicenseNumber: "346",
    }
]

async function main() {
	const stagehand = new Stagehand({
        env: "BROWSERBASE"
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

    for (const LicenseRecord of LicenseRecords) {
        // Navigate to the page + take some action
        await page.goto(LicenseRecord.Site);

        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(1000);
    
        const inputs = await page.observe("Input the first name, last name, and license number into the page: " + JSON.stringify(LicenseRecord));
        console.log(inputs);
        
        for (const input of inputs) {
        if (input.method == "fill") {
            await page.act(input);
        } else {
            // pass
        }
        }
    
        await page.act("Click the search button");
    
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(1000);
    
        const results = await page.extract({
        instruction: "Extract ALL the license verification results from the page, including name, license number and status",
        schema: z.object({
            list_of_licenses: z.array(
            z.object({
                name: z.string(),
                license_number: z.string(), 
                status: z.string(),
                more_info_url: z.string(),
            })
            )
        })
        });
        
        console.log(
            boxen(
                `Results: \n${chalk.blue(
                JSON.stringify(results)
                )}`,
                {
                    title: "Results",
                    padding: 1,
                    margin: 3,
                }
            )
        );

    }

    // Close the stagehand instance
    await stagehand.close();

}

main();