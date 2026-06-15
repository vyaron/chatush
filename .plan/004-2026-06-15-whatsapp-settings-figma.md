Status: done
Owner: Yaron Biton
Last updated: 2026-06-15

# Plan: Implement WhatsApp Settings Screen from Figma (node 0:9198)

## Goal
Implement the Figma design at node `0:9198` (WhatsApp Settings screen) as a production-ready page in the client app, preserving visual hierarchy, interaction structure, and responsive behavior while fitting the existing app architecture.

## Scope
In scope:
- Build a new settings page that matches the Figma screen structure:
  - iOS-like top status area and navigation title (`Settings`)
  - profile header card (avatar, name, subtitle, chevron)
  - grouped setting rows with icons, labels, right chevrons, separators
  - tab bar/footer area and home indicator treatment (if retained from current mobile shell)
- Add routing entry for the new screen (for example `/settings`).
- Reuse existing design tokens and UI patterns where possible.
- Ensure keyboard accessibility and focus visibility.
- Keep mobile-first behavior and acceptable desktop scaling.

Out of scope:
- Functional backend for setting toggles/actions.
- Persisting changed settings data.
- Rebuilding the full tab navigation architecture across all pages.
- Localization or dynamic content from APIs.

## Assumptions
- The screen will initially be static/readonly (navigation rows may be placeholders).
- Existing client page split remains (`/`, `/chat`) and we can add one more route.
- Icons can be implemented using `lucide-react` with light visual tuning unless exact Figma icon assets are required.
- Existing CSS organization can accept additional settings-specific selectors in the existing component stylesheet.

## Open Questions
1. Should the new settings page be reachable from homepage footer/navigation, or only via direct route (`/settings`)?
Recommended answer: Expose a visible link from homepage for easier QA and discovery.

2. Should the bottom tab bar on this screen be purely visual, or interactive with route navigation?
Recommended answer: Visual-only first pass, then wire routes in follow-up if needed.

3. Do you want exact exported Figma icons/images for row icons, or is close parity with `lucide-react` acceptable?
Recommended answer: Start with `lucide-react`, switch to Figma exports only for visible mismatches.

4. Should profile texts remain as in design (`Sabohiddin`, `Digital goodies designer - Pixsellz`) or be replaced with app/domain-specific text?
Recommended answer: Replace with product-consistent copy before final merge.

## Steps
1. Map Figma structure to React component model
- Create a new page component `apps/client/src/SettingsPage.tsx`.
- Break screen into semantic sections:
  - `settings-top` (status + nav title)
  - `settings-profile-card`
  - `settings-group` blocks
  - `settings-row` items
  - optional `settings-tabbar` and `home-indicator`
- Define row data arrays to avoid hardcoded repeated JSX for each row.

2. Add route integration in app shell
- Update `apps/client/src/App.tsx` to support `/settings`.
- Keep existing behavior for `/` and `/chat` unchanged.
- Add safe default route fallback to homepage for unknown paths if missing.

3. Implement visual styling
- Extend `apps/client/src/style/cmps/chat.css` with settings-specific classes.
- Reuse existing spacing, radius, shadows, and text color conventions from current mobile shell.
- Match Figma layout rhythm:
  - grouped cards with separators
  - row height and icon/label alignment
  - right-chevron affordance
- Add focus-visible styles for interactive rows/links.

4. Add discoverability entry point
- Add a `Settings` link/button from homepage/footer in `apps/client/src/HomePage.tsx`.
- Ensure label and aria attributes are explicit and keyboard reachable.

5. Optional Figma asset pass (only if needed)
- If visual mismatch is significant, export required icons/profile/avatar assets from Figma MCP.
- Place assets under `apps/client/public/figma/settings/` and swap only affected items.

6. QA and acceptance verification
- Build and type-check client.
- Manual checks:
  - `/settings` renders and matches screen composition.
  - Mobile widths align with intended shell.
  - Desktop centers/scales without breakage.
  - Keyboard tab flow and focus rings are visible on interactive controls.

## Validation
- Run:
  - `npm run build -w apps/client`
- Manual verification list:
  - Visual parity against node `0:9198` for section order and spacing.
  - Row labels present: Starred Messages, WhatsApp Web/Desktop, Account, Chats, Data and Storage Usage, Notifications, Help, Tell a Friend.
  - Profile card block and title area are present.
  - No regression on `/` and `/chat`.

## Risks
- Exact iconography mismatch if using `lucide-react` instead of exported Figma vectors.
- CSS coupling risk because settings styles live in a shared stylesheet.
- Route growth without centralized router may increase maintenance overhead.
- Minor typography mismatch if Figma font metrics differ from current stack.

## Rollout Order
1. Add `SettingsPage` component structure.
2. Wire `/settings` route.
3. Add CSS styles and row grouping.
4. Add homepage entry point.
5. Visual polish and optional asset export.
6. Build and manual QA.

## Rollback
- Remove `/settings` branch from `apps/client/src/App.tsx`.
- Delete `apps/client/src/SettingsPage.tsx`.
- Remove settings-only CSS selectors from `apps/client/src/style/cmps/chat.css`.
- Remove homepage `Settings` entry link if added.
- Rebuild client to verify baseline routes remain stable.
