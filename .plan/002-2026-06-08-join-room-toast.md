# Plan: Show Toast When a User Joins a Room

Status: done
Owner: Yaron Biton
Last updated: 2026-06-08

---

## Goal

Display a toast notification to all existing room members when a new user joins a room, so participants are aware of who is present without checking a member list.

## Scope

- **In scope:** Server-side broadcast of a join event; client-side toast display using the existing Sonner library.
- **Out of scope:** Persistent join/leave history in messages, member lists, leave notifications.

## Assumptions

- The joining user should NOT see a toast about themselves joining (server handles this via `socket.to()` which excludes the sender).
- Toast style: `toast.success()` (Sonner already installed and used in `apps/client/src/App.tsx`).
- No new dependencies needed.

## Open Questions

1. **Toast message wording** — Recommended: `"<nickname> joined #<room>"`. Any preference?
2. **Show toast for every room or only the active room?** — Recommended: only show it if it matches the currently active room (avoids noise from background rooms). Confirm?

## Steps

### 1. Server — broadcast join to room peers

File: `apps/server/src/socket.ts`

After `socket.join(parsedPayload.data.room)` (currently line 35), add:

```ts
socket.to(parsedPayload.data.room).emit('room:user-joined', {
  room: parsedPayload.data.room,
  nickname: parsedPayload.data.nickname
})
```

`socket.to(room)` sends to all sockets in the room **except** the sender, so the joining user never receives this event about themselves.

### 2. Client — listen and show toast

File: `apps/client/src/App.tsx`

Inside the socket setup `useEffect` (alongside the existing `message:new` and `error:event` listeners), add:

```ts
socket.on('room:user-joined', payload => {
  const { nickname: who, room } = payload as { nickname: string; room: string }
  if (room === activeRoom) {
    toast.success(`${who} joined #${room}`)
  }
})
```

No new imports, no new state, no new types.

## Validation

1. Start both server and client (`npm run dev` from root).
2. Open two browser tabs; each enters a different nickname.
3. Tab A joins "general" first.
4. Tab B then picks a nickname and joins "general".
5. **Expected:** Tab A shows a Sonner toast: _"Bob joined #general"_.
6. **Expected:** Tab B does NOT show a toast about itself.
7. Switch Tab B to a different room (e.g. "random"); Tab A should NOT get a toast (because it's watching "general").

## Risks

- Low risk — additive change only; no existing behavior is modified.
- If a user switches rooms rapidly, multiple toasts could stack. Sonner handles stacking gracefully by default.

## Rollout Order

1. Merge server change (`apps/server/src/socket.ts`).
2. Merge client change (`apps/client/src/App.tsx`).
3. Both can ship together in a single PR since this is a local monorepo.

## Rollback

Remove the `socket.to(...).emit('room:user-joined', ...)` line from `socket.ts` and the corresponding `socket.on('room:user-joined', ...)` listener from `App.tsx`. No database or schema changes to revert.
