
/**
 * Run using npx tsx set-metadata.ts
**/

import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({apiKey: process.env["BROWSERBASE_API_KEY"]!});

async function createSessionWithMetadata() {
  const session = await bb.sessions.create({
    projectId: process.env["BROWSERBASE_PROJECT_ID"]!,
    userMetadata: {
      "key": "value",
      "key2":{
        "key2A": "value2A",
        "key2B": "value2B"
      }
    },
  });
  return session;
}

const session = await createSessionWithMetadata();
console.log("Session URL: https://browserbase.com/sessions/" + session.id);