# Item Types

DevStash stores every resource as an **Item** belonging to exactly one **ItemType**.
There are **7 system item types** (owner-less, `isSystem: true`, shared by all users).
Pro users can also create **custom item types** (owned via `ItemType.userId`).

> **Source of truth:** The values below come from the database seed
> ([`prisma/seed.ts`](../prisma/seed.ts)) and the Prisma schema
> ([`prisma/schema.prisma`](../prisma/schema.prisma)). The icon-name → component
> mapping is in [`src/lib/item-type-icons.ts`](../src/lib/item-type-icons.ts).
> The research prompt referenced `src/lib/constants.tsx`, which does not exist —
> that role is filled by `item-type-icons.ts` and the seed's `SYSTEM_ITEM_TYPES`.
>
> ⚠️ The dashboard mock data ([`src/lib/mock-data.ts`](../src/lib/mock-data.ts))
> uses **different** names, icons, and colors (e.g. `Snippet`/`Code2`/`#22c55e`,
> and calls the link type `URL`). Mock data is placeholder UI-only and is being
> phased out — treat the **seed/DB values as authoritative**. Divergences are
> noted per type below.

---

## The 7 System Item Types

| # | Name (DB) | Icon (lucide) | Hex Color | Swatch | Classification |
|---|-----------|---------------|-----------|--------|----------------|
| 1 | `snippet` | `Code`        | `#3b82f6` | 🔵 blue    | text |
| 2 | `prompt`  | `Sparkles`    | `#8b5cf6` | 🟣 violet  | text |
| 3 | `command` | `Terminal`    | `#f97316` | 🟠 orange  | text |
| 4 | `note`    | `StickyNote`  | `#fde047` | 🟡 yellow  | text (Markdown) |
| 5 | `file`    | `File`        | `#6b7280` | ⚫ gray    | file (Pro) |
| 6 | `image`   | `Image`       | `#ec4899` | 🩷 pink    | file (Pro) |
| 7 | `link`    | `Link`        | `#10b981` | 🟢 green   | URL |

> Names are stored **lowercase** in the DB. The UI capitalizes them for display
> (`capitalize` class in [`ItemCard.tsx`](../src/components/dashboard/main/ItemCard.tsx)).

---

## Per-Type Details

### 1. Snippet
- **Name:** `snippet`
- **Icon:** `Code` · **Color:** `#3b82f6` (blue)
- **Purpose:** Reusable code — hooks, utilities, boilerplate, component patterns.
- **Key fields:** `content` (the code), `language` (for syntax highlighting, e.g. `typescript`, `dockerfile`), `title`, `description`, `tags`.
- **Mock-data divergence:** name `Snippet`, icon `Code2`, color `#22c55e`.

### 2. Prompt
- **Name:** `prompt`
- **Icon:** `Sparkles` · **Color:** `#8b5cf6` (violet)
- **Purpose:** AI prompts and prompt-engineering recipes (system prompts, workflow prompts).
- **Key fields:** `content` (the prompt text), `title`, `description`, `tags`. `language` is typically null.
- **Mock-data divergence:** color `#a855f7`.

### 3. Command
- **Name:** `command`
- **Icon:** `Terminal` · **Color:** `#f97316` (orange)
- **Purpose:** Shell/CLI commands for everyday development and deployment.
- **Key fields:** `content` (the command), `language` (usually `bash`), `title`, `description`, `tags`.
- **Mock-data divergence:** name `Command`, icon `SquareTerminal`, color `#38bdf8`.

### 4. Note
- **Name:** `note`
- **Icon:** `StickyNote` · **Color:** `#fde047` (yellow)
- **Purpose:** Free-form notes and context, written in Markdown.
- **Key fields:** `content` (Markdown body), `language` (may be `markdown`), `title`, `description`, `tags`.
- **Mock-data divergence:** name `Note`, icon `FileText`, color `#eab308`.

### 5. File  *(Pro)*
- **Name:** `file`
- **Icon:** `File` · **Color:** `#6b7280` (gray)
- **Purpose:** Uploaded documents, templates, configs — arbitrary file attachments.
- **Key fields:** `fileUrl`, `fileName`, `fileSize` (bytes), `title`, `description`, `tags`. `content` is null.
- **Pro-tier:** flagged `PRO` in the sidebar (file uploads are a Pro feature).
- **Mock-data divergence:** name `File`, color `#f43f5e`.

### 6. Image  *(Pro)*
- **Name:** `image`
- **Icon:** `Image` · **Color:** `#ec4899` (pink)
- **Purpose:** Uploaded images — screenshots, references, inspiration.
- **Key fields:** `fileUrl`, `fileName`, `fileSize` (bytes), `title`, `description`, `tags`. `content` is null.
- **Pro-tier:** flagged `PRO` in the sidebar. *(Note: basic image uploads are listed as a Free-tier feature in the project overview; the sidebar currently marks the type Pro.)*
- **Mock-data divergence:** name `Image`, color `#c084fc`.

### 7. Link
- **Name:** `link`
- **Icon:** `Link` (`LinkIcon`) · **Color:** `#10b981` (green)
- **Purpose:** Bookmarked URLs — docs, references, external resources.
- **Key fields:** `url` (the link), `title`, `description`, `tags`. `content` is null.
- **Mock-data divergence:** named **`URL`** (`type_url`), icon `Link`, color `#2dd4bf`.

---

## Content Classification: text vs. file vs. URL

Items carry a single `contentType` column (`"text" | "file"`), but functionally
there are **three storage shapes**. The type determines which fields are populated:

| Classification | Types | `contentType` | Primary field(s) | Empty fields |
|----------------|-------|---------------|------------------|--------------|
| **Text**  | snippet, prompt, command, note | `"text"` | `content` (+ optional `language`) | `fileUrl`/`fileName`/`fileSize`, `url` |
| **File**  | file, image | `"file"` | `fileUrl`, `fileName`, `fileSize` | `content`, `url` |
| **URL**   | link | `"text"`\* | `url` | `content`, file fields |

\* In the current seed, link items are stored with `contentType: "text"` and only
`url` populated — the DB schema has no dedicated `"url"` contentType, so links ride
on the `"text"` classification with `content` left null. `fileSize` is stored in
**bytes** (`Int`) and formatted for display via `formatFileSize`.

---

## Shared Properties (all types)

Every Item — regardless of type — has these common fields
([`Item` model](../prisma/schema.prisma)):

- **Identity/meta:** `id`, `title`, `description`
- **Ownership:** `userId` → `User`, `typeId` → `ItemType`, optional `collectionId` → `Collection`
- **Flags:** `isFavorite`, `isPinned`
- **Tags:** many-to-many via `ItemTag` → `Tag`
- **Timestamps:** `createdAt`, `updatedAt`
- **Payload columns (type-dependent):** `content`, `fileUrl`, `fileName`, `fileSize`, `url`, `language`

`ItemType` itself carries: `name`, `icon` (lucide export name), `color` (hex),
`isSystem`, and optional `userId` (null for system types, set for Pro custom types).

---

## Display Differences

Rendering logic lives in [`ItemCard.tsx`](../src/components/dashboard/main/ItemCard.tsx):

- **Accent color & badge:** Each card gets a left border (`border-l-4`) and a type
  badge tinted with the type's hex `color` (badge background is `${color}1a` — ~10% alpha).
- **Type icon:** Resolved from `ItemType.icon` through the `ITEM_TYPE_ICONS` map;
  rendered inside the badge next to the capitalized type name.
- **Preview block** (the `<pre>` panel) is chosen by classification, in priority order:
  1. **File** (`contentType === "file"` and `fileName`): shows `fileName · size · extension`.
  2. **URL** (`url` present): shows the raw URL.
  3. **Text** (`content` present): shows the content (code/prompt/note/command), clamped to `max-h-24`.
  4. Otherwise: no preview.
- **Markers:** Pinned items show a `Pin` icon; favorites show a filled amber `Star`.
- **Footer:** tag chips (`#tag`) on the left, relative time (`formatRelativeTime`) on the right.

The badge, collection cards, and sidebar all draw from the **same** icon map and
type colors, so a type looks consistent everywhere it appears.
