# 🤘 Create Browser App

Welcome! This is a starter kit for creating browser apps with [Stagehand](https://github.com/browserbase/stagehand).

## Setting the Stage

Stagehand is an SDK for automating browsers. It's built on top of [Playwright](https://playwright.dev/) and provides a higher-level API for better debugging and AI fail-safes.

## Curtain Call

Get ready for a show-stopping development experience.

1. Run `npx create-browser-app` to create a new project.

   ```bash
   npx create-browser-app@latest my-browser-app
   ```

2. Copy `.env.example` to `.env` and update with your credentials:

   ```bash
   cp .env.example .env
   ```

   Required credentials in .env:

   ```
   BROWSERBASE_PROJECT_ID="YOUR_BROWSERBASE_PROJECT_ID"
   BROWSERBASE_API_KEY="YOUR_BROWSERBASE_API_KEY"
   OPENAI_API_KEY="THIS_IS_OPTIONAL_WITH_ANTHROPIC_KEY"
   ANTHROPIC_API_KEY="THIS_IS_OPTIONAL_WITH_OPENAI_KEY"
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the script:

   ```bash
   npx tsx index.ts
   ```
