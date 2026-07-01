# Current Feature

<!-- Feature Name -->

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-01 — Initial Next.js 16 + React 19 + Tailwind v4 setup: scaffolded via `create-next-app`, removed default starter SVGs, expanded `CLAUDE.md`, added project context files, replaced default page with placeholder.
- 2026-07-01 — Dashboard UI Phase 1: added `src/lib/mock-data.ts` as the mock data source of truth; initialized ShadCN (base-nova, neutral, lucide) and installed `button` + `input`; enabled dark mode by default and set DevStash metadata in the root layout; built the `/dashboard` route with a top bar (display-only search + New Item button) and a shell splitting into Sidebar/Main placeholders. Verified with `pnpm build` and `pnpm lint`.
- 2026-07-01 — Dashboard UI Phase 2: built the collapsible sidebar under `src/components/dashboard/sidebar/` — `sidebar-context.tsx` (desktop-collapse + mobile-drawer state, Escape-to-close, body scroll lock), `sidebar-data.ts` (nav model derived from mock data: library links, type links to `/items/[slug]`, favorite + recent collections with item counts), `Sidebar.tsx` (brand header, Library/Types/Favorite Collections/Recent Collections sections with active-route highlighting, plan-usage card + user avatar footer), and `SidebarTrigger.tsx` (mobile drawer button). Restructured the dashboard layout to a full-height sidebar with top bar + main stacked to its right; moved the brand from the top bar into the sidebar; added a `no-scrollbar` utility in `globals.css`. Off-canvas drawer on mobile with backdrop. Verified with `pnpm build` and `pnpm lint`.
- 2026-07-01 — Dashboard UI Phase 3: built the main area under `src/components/dashboard/main/` — `dashboard-data.ts` (selectors over mock data: stats, pinned items, 10 recent items, top-4 recent collections with counts, `typeById` lookup, stable `referenceNow`), `StatsCards.tsx` (4 stat cards: items/collections/favorite items/favorite collections), `ItemCard.tsx` (type badge + type-colored left accent border, pin/favorite markers, per-type content preview, tags, relative time), `CollectionCard.tsx`, and `SectionHeader.tsx`. Added `src/lib/format.ts` (`formatRelativeTime`, `fileExtension`) and assembled the `/dashboard` page: stats → Pinned Items → Recent Collections → Recent Items grids. Server component reading mock data directly. Verified with `pnpm build` and `pnpm lint`.