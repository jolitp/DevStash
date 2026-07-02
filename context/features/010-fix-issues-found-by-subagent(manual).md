

## Status

<!-- Not Started|In Progress|Completed -->

Not Started

## Goals

<!-- Goals & requirements -->

**Audit quick wins** — low/no-risk cleanups surfaced by the code-scanner audit (2026-07-02). No behavior change; refactors and hardening only.

1. **Consolidate the item-type icon map (M2).** Extract the `icon-name → lucide component` lookup that is currently duplicated in three files (`ItemCard.tsx`, `CollectionCard.tsx`, `Sidebar.tsx`) into a single `src/lib/item-type-icons.ts` exporting a shared map + a `resolveItemTypeIcon(name, fallback)` helper, and import it in all three. Union of the three current key sets so no icon regresses.

2. **Simplify `referenceNow` in `getDashboardItems` (L4).** Rows are already `orderBy: { updatedAt: "desc" }`, so read the newest timestamp from `rows[0]` instead of `reduce`-ing over the whole array. Pure simplification, identical result.

3. **Move the seed demo password to an env var (L1).** Replace the hardcoded `"12345678"` in `prisma/seed.ts` with `process.env.SEED_DEMO_PASSWORD ?? "12345678"` and document it in `.env.example` as dev-only. Still bcrypt-hashed; keeps the fallback so `pnpm db:seed` works out of the box.

**Explicitly out of scope (not quick wins):** M1 (unbounded collection fetches — needs a schema/denormalization change or pagination), M3 (sidebar user still on mock data — blocked on auth), L2 (splitting `Sidebar.tsx` — larger refactor), L3 (`ItemGrid` extraction — deferred until a second items grid actually exists).

## Notes

<!-- Any extra notes -->

- These three were chosen for little-to-no risk: two are internal refactors with no output change, one is dev-only seed hardening with a safe fallback.
- Verify with `pnpm lint` and `pnpm build`; the icon consolidation should also be spot-checked with a live dashboard render to confirm every type still shows the correct icon.
