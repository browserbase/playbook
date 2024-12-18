import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";
import { config } from "dotenv";
config();
import { Stagehand } from '@browserbasehq/stagehand';
import z from 'zod';

const stagehand = new Stagehand({
  env: "LOCAL",
  verbose: 1,
});

await stagehand.init();

// Set the origin and destination
const origin = "SFO";
const destination = "LAX";

await stagehand.page.goto("https://www.southwest.com/");
await stagehand.act({ action: "select the round trip option" });
await stagehand.act({ action: `type in origin: ${origin}` });
await stagehand.act({ action: `select ${origin} from the origin options` });
await stagehand.act({ action: `type in destination: ${destination}` });
await stagehand.act({ action: `select ${destination} from the destination options` });
await stagehand.act({ action: "click the departure date of the first of next month" });
await stagehand.act({ action: "click the return date of the eighth of the month" });
await stagehand.act({ action: "click search for flights" });
await stagehand.act({ action: "select only the non stop flights" });

  // Use stagehand to extract the flight data from the page
  const flightData = await stagehand.extract({
    instruction: "extract all of the flight data from the page, only include the flight number, departure and arrival times, and the price",
    schema: z.object({
      flights: z.object({
        flightNumber: z.string(),
        departureTime: z.string(),
        arrivalTime: z.string(),
        price: z.string(),
      }).array(),
    }),
    domSettleTimeoutMs: 60_000
  });

console.log(flightData);