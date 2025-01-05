# 🤘 Create Browser App

Welcome! This is a starter kit for creating browser apps with [Stagehand](https://github.com/browserbase/stagehand).

## Setting the Stage

Stagehand is an SDK for automating browsers. It's built on top of [Playwright](https://playwright.dev/) and provides a higher-level API for better debugging and AI fail-safes.

## Curtain Call

Get ready for a show-stopping development experience.

1. Run `npx create-browser-app` to create a new blank Stagehand project.

   ```bash
   npx create-browser-app my-browser-app
   ```

   We also have a few examples to get you started:

   **Quickstart**: A simple example that demonstrates the basics of Stagehand.

   ```bash
   npx create-browser-app my-app --example quickstart
   ```

   **Deploy Vercel**: A scaffolded Vercel function that can be deployed with `npx vercel deploy`.

   ```bash
   npx create-browser-app my-app --example deploy-vercel
   ```

   **Persist Context**: A project with persistent contexts:

   ```bash
   npx create-browser-app my-app --example persist-context
   ```

   **SF Ticket Agent**: A simple example that demonstrates how to create a ticket agent for San Francisco Muni.

   ```bash
   npx create-browser-app my-app --example sf-ticket-agent
   ```

2. Install dependencies:

   ```bash
   cd my-app && npm install
   ```

3. Run the script:

   ```bash
   npm run start
   ```
