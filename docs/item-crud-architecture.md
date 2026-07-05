# Item CRUD Architecture

A unified Create/Read/Update/Delete system that handles **all 7 item types**
(snippet, prompt, command, note, file, image, link) through **one** set of
mutations, **one** dynamic route, and **shared components that adapt by type** —
rather than seven parallel implementations.

> **Design document.** This describes the target architecture and the
> conventions it must follow; items CRUD is **not yet implemented** (there is no
> `src/actions/` directory yet, and `src/lib/db/items.ts` currently exposes only
> the read-only dashboard selector). It grounds every decision in patterns
> already established by the auth stack and the dashboard data layer.
>
> **Source notes:** The prompt referenced `@docs/content-types.md` (the actual
> file is [`docs/item-types.md`](./item-types.md)) and `@src/lib/constants.tsx`
> (which does not exist — the type/icon/color metadata lives in the DB
> `ItemType` rows, seeded by [`prisma/seed.ts`](../prisma/seed.ts), and the
> icon-name→component map is [`src/lib/item-type-icons.ts`](../src/lib/item-type-icons.ts)).

---

## Guiding principles (from the coding standards)

- **Server components fetch directly** with Prisma from `src/lib/db/*`.
- **Client components mutate via Server Actions** (`src/actions/*`), reserved for
  the item forms; API routes are only for webhooks / uploads / external clients.
- **Validate all inputs with Zod**; return the `{ success, data, error }` shape.
- **Scope every query and mutation to the session user** (`auth()` → `session.user.id`).
- **One job per component**; type-specific rendering lives in components, not actions.

---

## File Structure

```
src/
├── actions/
│   └── items.ts                 # ALL item mutations (create, update, delete,
│                                #   toggleFavorite, togglePin) — "use server"
├── lib/
│   ├── db/
│   │   └── items.ts             # ALL item queries (read) — called from
│   │                            #   server components; extend existing file
│   ├── validations/
│   │   └── item.ts              # Zod schemas (itemSchema + per-type refinements)
│   └── item-type-icons.ts       # existing icon map (reused, not duplicated)
├── app/
│   ├── items/
│   │   ├── [type]/
│   │   │   └── page.tsx         # list view for one type: /items/snippet
│   │   └── [type]/[id]/
│   │       └── page.tsx         # single-item view/editor (optional; or a modal)
│   └── dashboard/…              # existing; links into /items/[type]
└── components/
    └── items/
        ├── ItemForm.tsx          # shared create/edit form; adapts fields by type
        ├── ItemList.tsx          # grid/list of ItemCard (reuses dashboard card)
        ├── ItemActions.tsx       # per-card menu: edit / delete / favorite / pin
        ├── DeleteItemDialog.tsx  # confirm dialog (shadcn alert-dialog, like
        │                         #   DeleteAccountDialog)
        └── fields/               # type-specific field groups (see below)
            ├── CodeFields.tsx    # content + language  (snippet, command)
            ├── TextFields.tsx    # content            (prompt, note)
            ├── FileFields.tsx    # fileUrl/name/size  (file, image)  [Pro]
            └── UrlFields.tsx     # url                (link)
```

**Why this split:**
- **Mutations in one file** (`actions/items.ts`) — every write goes through the
  same auth check, Zod validation, ownership check, and `revalidatePath`. No
  per-type action files to keep in sync.
- **Queries in `lib/db/items.ts`** — server components import and `await` them
  directly (the established dashboard pattern). Reads never go through actions.
- **Type differences live in components** — the form swaps a `fields/*` group
  based on the type; the actions/db layers treat items uniformly.

---

## How `/items/[type]` routing works

- **Dynamic segment:** `src/app/items/[type]/page.tsx`. The `[type]` param is the
  **lowercase `ItemType.name`** (`snippet`, `prompt`, `command`, `note`, `file`,
  `image`, `link`) — matching the existing sidebar links, which already build
  `href={`/items/${type.name}`}` ([`dashboard/layout.tsx:42`](../src/app/dashboard/layout.tsx#L42)).
- **The page (server component):**
  1. `const session = await auth()` → `redirect("/sign-in?callbackUrl=…")` if absent
     (same guard as [`profile/page.tsx`](../src/app/profile/page.tsx)).
  2. Look up the `ItemType` by name **scoped to the user** (system types
     `isSystem: true` OR the user's own custom type: `where: { name, OR: [{ isSystem: true }, { userId }] }`).
     `notFound()` if it doesn't resolve.
  3. Fetch that type's items via `getItemsByType(userId, typeId)` from `lib/db/items.ts`.
  4. Render `<ItemList>` + a "New {Type}" button that opens `<ItemForm type={…} />`.
- **`export const dynamic = "force-dynamic"`** — reads live session + DB per
  request, consistent with `/dashboard` and `/profile`.
- **Single-item view/edit:** either a nested `/items/[type]/[id]` route or an
  in-place modal hosting the same `<ItemForm>` in edit mode. A dedicated route is
  cleaner for deep-linking; a modal is lighter. Recommend starting with the modal
  and promoting to a route only if deep links are needed.

---

## Where type-specific logic lives

**In components, never in actions or the db layer.**

- The **action** (`createItem`/`updateItem`) accepts the full item payload and a
  `typeId`; it validates against a Zod schema and writes whichever columns are
  present. It does **not** branch on the type name.
- The **db query** selects the same columns for every item (as `ITEM_SELECT`
  already does) and returns the uniform `DashboardItem`-style shape.
- The **`ItemForm`** is the only place that knows a `snippet` needs a
  `language` picker while a `link` needs a `url` input: it picks a `fields/*`
  group from a small map keyed by type name. Adding a new custom type = add a
  mapping entry, not a new action or route.
- **Card rendering** already adapts by type via `ItemCard`'s `Preview`
  (file → url → content priority) and the shared icon/color map — reuse it as-is.

Validation carries the small amount of type-awareness that must be enforced
server-side (e.g. `link` requires `url`, `file`/`image` require file fields,
text types require `content`). A discriminated Zod schema (`z.discriminatedUnion`
on a `kind` derived from the type, or a base schema `.superRefine`d by type)
keeps that in `lib/validations/item.ts` — one schema file, not seven.

---

## Component responsibilities

| Component | Responsibility |
|-----------|----------------|
| **`items/[type]/page.tsx`** (server) | Auth guard, resolve type by name, fetch items, compose the list + "New" action. No interactivity. |
| **`ItemList`** | Lay out the fetched items in the responsive grid; delegate each card to `ItemCard` + `ItemActions`. Pure presentation. |
| **`ItemCard`** (existing, `dashboard/main`) | Render one item: type badge/accent, preview block chosen by classification, tags, timestamp, pin/favorite markers. Reused unchanged. |
| **`ItemActions`** (client) | Per-item menu (shadcn `dropdown-menu`): Edit (opens `ItemForm`), Delete (opens `DeleteItemDialog`), toggle Favorite/Pin — each calls the matching server action, then relies on `revalidatePath`. |
| **`ItemForm`** (client) | Create & edit for **all** types. Zod-validated (client + server). Renders shared fields (title, description, tags, collection) plus a type-specific `fields/*` group. Submits to `createItem`/`updateItem`; toast on result (`sonner`). |
| **`fields/*`** (client) | Small field groups per classification: `CodeFields` (content + language), `TextFields` (content), `FileFields` (upload → fileUrl/name/size, Pro-gated), `UrlFields` (url). |
| **`DeleteItemDialog`** (client) | Confirm destructive delete via shadcn `alert-dialog`, mirroring `DeleteAccountDialog`; calls `deleteItem`, blocks while pending. |

---

## Mutations contract (`src/actions/items.ts`)

All are `"use server"`, and each one:
1. `const session = await auth()` → return `{ success:false, error:"Unauthorized" }` if no `session.user.id`.
2. Parse input with the Zod item schema.
3. For update/delete/toggle: confirm the item's `userId === session.user.id`
   **before** mutating (ownership-scoped `where: { id, userId }`), so users can
   never touch another user's items.
4. Write via Prisma (tags handled with `connectOrCreate` on `[userId, name]`, as
   the seed does).
5. `revalidatePath("/items/[type]")` (and `/dashboard`) so server components refetch.
6. Return `{ success, data?, error? }`.

Proposed surface:

```ts
createItem(input): Promise<Result<{ id: string }>>
updateItem(id, input): Promise<Result<{ id: string }>>
deleteItem(id): Promise<Result<null>>
toggleFavorite(id): Promise<Result<{ isFavorite: boolean }>>
togglePin(id): Promise<Result<{ isPinned: boolean }>>
```

> **File/image uploads** are the one exception to "Server Actions only": binary
> upload with progress belongs in an **API route** (per the coding standards),
> which returns a `fileUrl`/`fileName`/`fileSize` that the `ItemForm` then submits
> through the normal `createItem`/`updateItem` action. Uploads are a **Pro**
> feature — gate `file`/`image` creation on `session.user.isPro`.

---

## Reads contract (`src/lib/db/items.ts`)

Extend the existing file (currently only `getDashboardItems`). New selectors,
all **user-scoped** (replacing the temporary unscoped fetches once auth is wired):

```ts
getItemsByType(userId, typeId, opts?): Promise<DashboardItem[]>   // /items/[type]
getItemById(userId, id): Promise<DashboardItem | null>            // single view/edit
searchItems(userId, query): Promise<DashboardItem[]>              // top-bar search
```

Reuse `ITEM_SELECT` and `toDashboardItem` so every read returns the same shape the
cards already consume — no per-type query variants.

---

## Free-tier limits (enforce in `createItem`)

Per the project overview, Free users are capped at **50 items** and **3 collections**;
custom types, file/image uploads, and AI features are Pro-only. `createItem` should
count the user's existing items and reject over-limit creation with a friendly error
(and steer the UI toward the upgrade flow) before writing.

---

## Summary of the "unified" wins

- **One mutation file** → one place for auth, validation, ownership, revalidation.
- **One query module** → one item shape, reused by dashboard, lists, and search.
- **One dynamic route** `/items/[type]` → no per-type pages.
- **Shared components** → `ItemCard`/`ItemForm` adapt by looking up a per-type
  field group and the shared icon/color metadata; adding a custom type touches
  data + one mapping, not the CRUD plumbing.
