# Runbook

## Purpose
- Quick local steps for running and validating the MVP chat system.

## Prerequisites
- Node.js 20+
- npm 10+

## Install
1. Run `npm install` at repository root.

## Start Services
1. Start backend: `npm run dev:server`
2. Start frontend: `npm run dev:client`
3. Open the Vite URL shown in terminal (default `http://localhost:5173`).

## Validation Commands
1. Lint: `npm run lint`
2. Typecheck: `npm run typecheck`
3. Tests: `npm run test`

## Notes
- Message and room state is in-memory only and resets on backend restart.
- Nickname is stored in localStorage in the browser.
