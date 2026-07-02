---
name: devstash-repo-facts
description: Confirmed environment/tooling facts about the DevStash repo needed before every audit
metadata:
  type: project
---

Confirmed facts (checked directly, do not re-verify each time unless something looks off):

- `.gitignore` at repo root DOES include `.env*` with `!.env.example` exception (line 34-35). Never flag `.env` handling as an issue — this was already verified.
- `/src/generated/` (Prisma 7 client output) is gitignored — intentional, not a build artifact leak.
- No `Bash`/`Glob`/`LS` tool is available in this environment's toolset for the code-scanner/nextjs-codebase-auditor subagent — only `Read`, `Write`, `Edit`, `WebFetch`, `WebSearch`, `TaskStop`. File discovery must happen by reading known paths inferred from `context/current-feature.md` history (it names every file created per phase) rather than directory listing. Read `context/current-feature.md` first every time to get the file inventory before trying to guess paths.
- Package manager: pnpm. Stack: Next.js 16.2.9, React 19.2.4, Prisma 7 (Neon serverless driver adapter, `src/generated/prisma` output, no native engine), Tailwind v4 (CSS `@theme`, no tailwind.config.*), shadcn (base-nova style, lucide-react icons), NextAuth not yet installed/wired.
- As of 2026-07-02 (last feature: "Pro badge on sidebar types"), NO auth system, NO server actions (`src/actions/` does not exist), NO items CRUD, NO file uploads, NO AI features, NO Stripe. Dashboard reads live Prisma data (items/collections/stats/item-types) but the DB helpers in `src/lib/db/*.ts` are explicitly documented as **unscoped by design** ("Until auth lands there is a single seeded user... add a `userId` filter once sessions exist") — do NOT flag this as a missing-authorization bug; it's pre-auth scope. Re-check this comment still exists before relying on the memory — if auth has since landed and these comments/filters weren't updated, THAT would be a real finding.
- `Sidebar.tsx` (`src/components/dashboard/sidebar/Sidebar.tsx`) still imports `currentUser` from `src/lib/mock-data.ts` for the plan-usage card + avatar footer, even though item/collection nav data was migrated to Prisma. Worth a Medium note (stale mock dependency / inconsistency) each audit until a real user session replaces it — check whether this is still true before repeating.
- `prisma/seed.ts` seeds a demo user with a hardcoded weak password `"12345678"` (bcrypt-hashed). Fine for a dev seed script; only worth a Low note, not higher — don't inflate severity.
- TopBar search input and "New Item" button are intentionally non-functional stubs per an inline comment ("Search stays display only until later phases wire it up") — do not flag as broken functionality.
