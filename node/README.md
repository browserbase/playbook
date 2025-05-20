# Browserbase Node Playbook

This repository contains a collection of browser automation scripts and tools using various frameworks including Stagehand, Playwright, and Puppeteer.

## Project Structure
```
playbook/node/
├── stagehand/
│ ├── _tools/ 
│ ├── research/ 
│ ├── complete_task/ 
│ └── authenticate/ 
├── playwright/ 
│ ├── _tools/ 
│ ├── research/ 
│ ├── complete_task/ 
│ └── authenticate/ 
├── puppeteer/ 
│ ├── _tools/ 
│ ├── research/ 
│ ├── complete_task/ 
│ └── authenticate/ 
└── useful_browserbase_functions.ts # Shared utility
```

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)
- [Browserbase API Key / Project ID](https://www.browserbase.com/sign-up)

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd playbook/node
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Available Scripts

- `npm start` - Run the main application
- `npm run build` - Build TypeScript files

## Dependencies

The project uses several key dependencies:

- `@browserbasehq/stagehand` - For browser automation with Stagehand
- `@playwright/test` - For Playwright-based automation
- `zod` - For runtime type checking
- `dotenv` - For environment variable management
- `chalk` - For terminal styling
- `boxen` - For terminal box drawing

## Environment Setup

1. Create a `.env` file in the root directory
2. Add your Browserbase credentials:
   ```
    BROWSERBASE_PROJECT_ID=
    BROWSERBASE_API_KEY=
   ```

## Usage Examples

### Running Scripts

```bash
npx tsx script.ts
```

## Support

For issues and feedback, please create reach out to support@browserbase.com