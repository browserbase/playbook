# 🤘 Create Browser App

Welcome! This is a starter kit for creating browser apps with [Stagehand](https://github.com/browserbase/stagehand).

## Setting the Stage

Stagehand is an SDK for automating browsers. It's built on top of [Playwright](https://playwright.dev/) and provides a higher-level API for better debugging and AI fail-safes.

## Curtain Call

Get ready for a show-stopping development experience.

```bash
npx create-browser-app@latest my-browser-app
```

1. Git clone this repo:

   ```bash
   git clone https://github.com/browserbase/quickstart-stagehand.git
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

4. Compile TypeScript in watch mode:

   ```bash
   tsc -w
   ```

5. Run the file:

   ```bash
   node dist/index.js
   ```

6. Watch your script live or review the replay:

- Live: Open the debugUrl - printed in the console.
- Replay: Open the session Url - printed in the console.

## Behind the Scenes

Key features and components that make the magic happen.

## Show Must Go On

Troubleshooting tips and maintenance.

## Break a Leg!

Best practices and performance tips.

## Setup Instructions
