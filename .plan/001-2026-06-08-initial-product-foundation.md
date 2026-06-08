Status: done
Owner: team
Last updated: 2026-06-08

# Goal
Create the first shippable version of the discussion product described in .doc/product-definition.md with a simple, fast flow: enter nickname, join one of multiple rooms, post messages, and read live updates.

# Scope
In scope:
- Frontend app using React and Vite.
- Backend API and realtime gateway using Node.js, TypeScript, and Socket.io rooms.
- Basic nickname-based session handling in browser storage.
- In-memory chat messages and room state for process lifetime.
- Core quality baseline: lint, typecheck, and smoke tests.
- Documentation updates in .doc/architecture.md and .doc/glossary.md if terms or boundaries change.

Out of scope:
- WorkOS or multi-tenant org auth.
- Processing queues and async moderation pipelines.
- Advanced ranking, recommendation, or engagement systems.

# Assumptions
- This is a greenfield implementation in this repository.
- Product language can remain simple and informal for MVP.
- MVP includes multiple chat rooms from day one.
- Data is stored in-memory and resets when backend process restarts.
- Initial release readiness is local-only.

# Open Questions
1. Should MVP support one room only, or multiple rooms from day one?
Recommended answer: Start with one default room to reduce complexity and ship faster.
Answer: Multiple rooms

2. Do we require message moderation in MVP?
Recommended answer: No automated moderation in MVP; add basic report capability in next phase.
Answer: No automated moderation in MVP.

3. What message retention policy should apply initially?
Recommended answer: Keep all messages during MVP and add retention controls after usage data is available.
Answer: Keep all messages in memory during process lifetime.

4. Should users be allowed to change nickname during a session?
Recommended answer: No, lock nickname per session and allow change only after sign-out/reset.
Answer: Keep nickname in localStorage, show a logout link that removes localStorage value, and ask for nickname if unknown.

5. Which environments are required for first release readiness?
Recommended answer: local and one staging environment with CI checks.
Answer: local only.

Resolved status: All open questions are resolved for this iteration.

# Steps
1. Foundation setup
- Create frontend and backend app structure with shared TypeScript configuration.
- Add linting, formatting, and typecheck scripts.
- Add environment configuration examples and startup scripts.

2. Core domain and data model
- Define core entities for room, user session, and message.
- Implement in-memory room/message store and lifecycle behavior.
- Add service layer interfaces around in-memory storage for future persistence swap.

3. Backend delivery
- Implement health route and message history route.
- Implement Socket.io room join and message broadcast.
- Add validation, error handling, and basic rate limiting.

4. Frontend delivery
- Build nickname entry, logout link, and multi-room view.
- Implement live message list, composer, and optimistic updates.
- Add reconnect handling and error states.

5. Quality and docs
- Add smoke tests for API and realtime flow.
- Validate architecture and naming alignment with rules.
- Update docs and add runbook notes in repository docs.

6. Release prep
- Run full validation checklist.
- Prepare local release checklist and rollback instructions.
- Request implementation approval before execution.

# Validation
- Functional checks:
  - User can set nickname, persist it in localStorage, and clear it via logout.
  - User can join multiple rooms and switch between rooms.
  - User can post message and receive realtime updates.
  - New client can load recent in-memory message history while server is running.
- Technical checks:
  - Lint passes.
  - Typecheck passes.
  - Tests pass for API and socket smoke coverage.
- Documentation checks:
  - Architecture and glossary remain aligned with implemented terms.

# Risks
- Realtime delivery edge cases may cause duplicate or out-of-order messages.
- Nickname-only identity can allow impersonation.
- Missing moderation can create abuse risk during early usage.
- In-memory-only state can cause data loss on restart and blocks durable history.

# Rollout Order
1. Internal developer testing on local environment.
2. Team validation on local setups.
3. Local sign-off for MVP completion.

# Rollback
- Keep previous stable backend and frontend build artifacts available.
- Disable websocket message posting via feature flag or route guard if critical issues appear.
- Roll back application to previous stable build; no persistence-layer rollback is required.
- If state corruption is detected, restart backend process to reset in-memory state.
