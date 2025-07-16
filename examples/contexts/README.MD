# Browserbase Context Persistence Demo

This project demonstrates how to use Browserbase's context persistence feature to maintain browser state across multiple sessions.

## Overview

The demo script showcases:
- Creating a Browserbase context
- Starting a browser session with a persistent context
- Setting and verifying cookie persistence between pages
- Creating a new session with the same context
- Verifying that the browser state (cookies) persists between sessions

## Prerequisites

- Node.js (v14 or higher recommended)
- A Browserbase account with API access
- Your Browserbase Project ID and API Key

## Installation

1. Clone this repository
2. Install dependencies: npm install
3. Create a `.env` file and add your Browserbase Project ID and API Key
4. Run: tsc -w
5. Run: node dist/index.js