# System Architecture

## Purpose
- Provide a concise architecture reference for service boundaries, ownership, and major flows.

## System Overview
- Full stack app
- MVP persistence model is in-memory only (no database).

## Recommended Sections
- `Primary Components`
	- Frontend based on React, Vite
	- Backend with Node.js
	- Everything with Typescript
	- In-memory store for rooms and messages (process lifetime)
	- Socket.io Multi rooms chats

- `Auth`
	- simple localStorage - nickname based


## Future phase
- Pub/Sub Processing Queue
- Full auth, multi tenancy based on WorkOs
