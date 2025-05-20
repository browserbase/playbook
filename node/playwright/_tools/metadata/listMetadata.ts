import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({apiKey: process.env["BROWSERBASE_API_KEY"]!});

async function listSessionsWithMetadata(query: string) {
    const sessions = await bb.sessions.list({
        q: query
    });
    return sessions;
}

const sessions = await listSessionsWithMetadata("user_metadata['client']:'enterprise_customer_xyz'");
console.log(sessions);