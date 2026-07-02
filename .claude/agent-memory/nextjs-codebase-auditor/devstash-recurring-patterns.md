---
name: devstash-recurring-patterns
description: Recurring code-quality patterns and file inventory in DevStash, useful to check quickly on repeat audits
metadata:
  type: project
---

Recurring real issue (present as of 2026-07-02, re-verify each audit):

- Icon-resolution maps (`Record<string, IconComponent>` resolving `ItemType.icon` / lucide export names to components) are duplicated near-verbatim in THREE files: `src/components/dashboard/main/ItemCard.tsx` (`TYPE_ICONS`), `src/components/dashboard/main/CollectionCard.tsx` (`TYPE_ICONS`), and `src/components/dashboard/sidebar/Sidebar.tsx` (`ICONS`, a superset). Each must be manually kept in sync with the icon names used in `prisma/seed.ts` (`SYSTEM_ITEM_TYPES`) and `src/lib/mock-data.ts`. Recommend extracting to a shared `src/lib/icon-map.ts` (or `src/components/dashboard/icon-map.tsx` since lucide components aren't serializable across a server/client boundary cleanly — check current shadcn/lucide-react version for the right pattern) exporting a single `ITEM_TYPE_ICONS` map + a `resolveIcon(name, fallback)` helper. Flag as Medium (Componentization/DRY) each time this is still true.

File inventory known to exist as of 2026-07-02 (from `context/current-feature.md` history + direct reads) — use as a starting map for future audits, but verify paths still exist since no directory-listing tool is available:

- `src/app/layout.tsx`, `src/app/page.tsx` (placeholder `<h1>Devstash</h1>`), `src/app/globals.css`
- `src/app/dashboard/layout.tsx` (async, fetches sidebar types/collections), `src/app/dashboard/page.tsx` (async, fetches stats/items/collections)
- `src/components/dashboard/TopBar.tsx`
- `src/components/dashboard/sidebar/{Sidebar.tsx,SidebarTrigger.tsx,sidebar-context.tsx,sidebar-data.ts}`
- `src/components/dashboard/main/{ItemCard.tsx,CollectionCard.tsx,StatsCards.tsx,SectionHeader.tsx}` — `dashboard-data.ts` (once superseded by `src/lib/db/*`) has already been deleted as of 2026-07-02 — confirmed it no longer exists, do not flag it as dead code again.
- `src/components/ui/{button,input,badge}.tsx` — vendored shadcn primitives, base-ui/react driven, do not flag their internal patterns.
- `src/lib/{prisma.ts,mock-data.ts,format.ts,utils.ts}`
- `src/lib/db/{items.ts,collections.ts,stats.ts,item-types.ts}` — all explicitly unscoped pre-auth (see repo-facts memory).
- `prisma/schema.prisma`, `prisma/seed.ts`, `prisma.config.ts`, `scripts/test-db.ts`, `flake.nix`
- No `src/actions/`, `src/types/`, `src/app/(auth)`, or items/collections detail routes exist yet.
