/**
 * 🤘 Welcome to Stagehand!
 *
 * This is a simple API endpoint that extracts the description of Browserbase from the docs.
 */

import { run } from "../index.js";

export async function GET(request: Request) {
  return await run(request);
}
