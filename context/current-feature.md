# Current Feature

Dashboard Collections — real data from database

## Status

<!-- Not Started|In Progress|Completed -->

Completed

## Goals

<!-- Goals & requirements -->

Replace the dummy collection data in the dashboard main area (the 6 recent-collection cards) with real data from the Neon database via Prisma, keeping the current design. Do NOT add the items underneath yet.

- Create `src/lib/db/collections.ts` with data-fetching functions
- Fetch collections directly in the server component (no mock data)
- Collection card border color derived from the most-used content type in that collection
- Show small icons of all types present in that collection
- Keep the current design (reference `context/screenshots/dashboard-ui-main.png`)
- Update the collection stats display

## Notes

<!-- Any extra notes -->

Full spec: `context/features/006-dashboard-collections-spec.md`

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-01 — Initial Next.js 16 + React 19 + Tailwind v4 setup: scaffolded via `create-next-app`, removed default starter SVGs, expanded `CLAUDE.md`, added project context files, replaced default page with placeholder.
- 2026-07-01 — Dashboard UI Phase 1: added `src/lib/mock-data.ts` as the mock data source of truth; initialized ShadCN (base-nova, neutral, lucide) and installed `button` + `input`; enabled dark mode by default and set DevStash metadata in the root layout; built the `/dashboard` route with a top bar (display-only search + New Item button) and a shell splitting into Sidebar/Main placeholders. Verified with `pnpm build` and `pnpm lint`.
- 2026-07-01 — Dashboard UI Phase 2: built the collapsible sidebar under `src/components/dashboard/sidebar/` — `sidebar-context.tsx` (desktop-collapse + mobile-drawer state, Escape-to-close, body scroll lock), `sidebar-data.ts` (nav model derived from mock data: library links, type links to `/items/[slug]`, favorite + recent collections with item counts), `Sidebar.tsx` (brand header, Library/Types/Favorite Collections/Recent Collections sections with active-route highlighting, plan-usage card + user avatar footer), and `SidebarTrigger.tsx` (mobile drawer button). Restructured the dashboard layout to a full-height sidebar with top bar + main stacked to its right; moved the brand from the top bar into the sidebar; added a `no-scrollbar` utility in `globals.css`. Off-canvas drawer on mobile with backdrop. Verified with `pnpm build` and `pnpm lint`.
- 2026-07-01 — Dashboard UI Phase 3: built the main area under `src/components/dashboard/main/` — `dashboard-data.ts` (selectors over mock data: stats, pinned items, 10 recent items, top-4 recent collections with counts, `typeById` lookup, stable `referenceNow`), `StatsCards.tsx` (4 stat cards: items/collections/favorite items/favorite collections), `ItemCard.tsx` (type badge + type-colored left accent border, pin/favorite markers, per-type content preview, tags, relative time), `CollectionCard.tsx`, and `SectionHeader.tsx`. Added `src/lib/format.ts` (`formatRelativeTime`, `fileExtension`) and assembled the `/dashboard` page: stats → Pinned Items → Recent Collections → Recent Items grids. Server component reading mock data directly. Verified with `pnpm build` and `pnpm lint`.
- 2026-07-02 — Prisma 7 + Neon PostgreSQL setup: added the `prisma-client` generator (output `src/generated/prisma`, cjs) + `prisma.config.ts` (dotenv-loaded `DATABASE_URL`) + Neon serverless driver adapter in `src/lib/prisma.ts`; wrote the initial schema (User, Item, ItemType, Collection, Tag, ItemTag + NextAuth Account/Session/VerificationToken) with FK indexes and cascade deletes, and created/applied migration `20260702120514_init` to the Neon dev branch. Added `flake.nix`/`flake.lock` (provides the Prisma 7 `schema-engine` on NixOS), a `scripts/test-db.ts` connectivity check, `db:*` scripts (generate/migrate/deploy/studio/test), `.env.example`, and a NixOS/Prisma note in `CLAUDE.md`. Verified with `prisma validate`, `prisma migrate status`, `pnpm db:test`, `pnpm lint`, and `pnpm build`.
- 2026-07-02 — Seed data: added `prisma/seed.ts` (registered via `migrations.seed` in `prisma.config.ts`) that wipes the app tables and inserts a deterministic dataset — demo user `demo@devstash.io` (password hashed with bcryptjs @ 12 rounds), the 7 system item types, and 5 collections with 18 items (React Patterns snippets, AI Workflows prompts, DevOps, Terminal Commands, Design Resources) using real URLs and `connectOrCreate` tags. Added the `bcryptjs` dependency and a `db:seed` script; expanded `scripts/test-db.ts` to fetch and print the seeded user/types/collections/items. Verified with `pnpm db:seed` (idempotent re-run), `pnpm db:test`, `pnpm lint`, and `pnpm build`.
- 2026-07-02 — Dashboard Collections (real data): added `src/lib/db/collections.ts` with `getRecentCollections()` — fetches collections + their items/types via Prisma, sorts by latest item activity, and per card derives item count, distinct types (most-used first), and an accent color from the top type. Rewrote `CollectionCard.tsx` to take the new `DashboardCollection` shape: left accent border from the most-used type color plus a row of small type-icon badges (icon-name → lucide map covering the seeded `ItemType.icon` values). Made `/dashboard` an async server component awaiting `getRecentCollections()` and added `export const dynamic = "force-dynamic"` so it reads live DB data per request instead of prerendering stale data at build. Items grids and `StatsCards` still on mock (items not migrated yet, per spec). Verified with `pnpm lint`, `pnpm build` (dashboard now `ƒ Dynamic`), and a live render against the seeded DB (correct counts, accent colors, and multi-type badges e.g. DevOps → link·2/snippet·1/command·1).