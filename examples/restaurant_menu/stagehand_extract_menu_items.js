import 'dotenv/config';
import { Stagehand } from '@browserbasehq/stagehand';
import z from 'zod';

const stagehand = new Stagehand({
  env: "BROWSERBASE",
  verbose: 1,
});

await stagehand.init();

const search_query = "ti piacera"

await stagehand.page.goto("https://www.google.com/");
await stagehand.act({ action: `type in search query: ${search_query} restaurant` });
await stagehand.act({ action: "click search" });
await stagehand.act({ action: "click do not share location" });
await stagehand.act({ action: "click the first search result" });
await stagehand.act({action: "click the menu option in the navbar"})
await stagehand.act({ action: "click the dinner menu from the dropdown" });

const dinner_menu_meats = await stagehand.extract({
  action: "extract the menu items that contain meat on the dinner menu, only include the name of the dish, catorize by red and white meats",
  schema: z.object({
    red_meat_dishes: z.array(z.string()),
    white_meat_dishes: z.array(z.string()),
  }),
});

console.log(dinner_menu_meats);
