# Chatush

Chatush is a small WhatsApp-inspired chat app built as a TypeScript monorepo. It pairs a React + Vite frontend with a Node.js + Socket.IO backend and keeps the current MVP simple: rooms, messages, and lightweight local identity.

## What it does

- Real-time multi-room chat with Socket.IO
- Nickname-based entry stored in `localStorage`
- Mobile-first UI inspired by WhatsApp
- In-memory message storage for the current process lifetime
- Optional AI-powered features on the server side
- Figma-driven UI work for homepage and settings screens

## Project Structure

```text
apps/
  client/   # React + Vite frontend
  server/   # Node.js + Express + Socket.IO backend
```

## Tech Stack

- React 18
- Vite
- TypeScript
- Socket.IO
- Express
- zod
- lucide-react
- sonner

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development servers

Start the backend:

```bash
npm run dev:server
```

Start the frontend:

```bash
npm run dev:client
```

## Available Scripts

From the repository root:

```bash
npm run dev:server   # Start the server in watch mode
npm run dev:client   # Start the client with Vite
npm run build        # Build server, then client
npm run lint         # Lint server, then client
npm run typecheck    # Type-check server, then client
npm run test         # Run server tests
```

## Architecture Notes

- The app uses in-memory storage for the MVP, so data resets when the server restarts.
- Rooms are handled with Socket.IO multi-room support.
- The current auth model is nickname-based and stored locally in the browser.
- The frontend is organized around route-like screens (`/`, `/chat`, `/settings`) without a heavy router dependency.

## Environment Variables

The server expects API keys or configuration values for external integrations when those features are enabled. Keep secrets out of source control and set them locally through your environment or `.env` file.

## Design Workflows

This repository uses Figma MCP-based design implementation for UI work. Refer to the planning files under `.plan/` for approved implementation steps and current UI initiatives.

## Notes

- This project is intentionally lightweight and focused on fast iteration.
- If you are changing the UI, keep the mobile-first shell and the current visual language consistent.
- If you are changing the server, remember the current persistence model is in-memory only.

## License

No license has been declared in this repository yet.
