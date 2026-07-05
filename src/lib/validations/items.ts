import { z } from "zod";

/**
 * Optional free-text field: trims and treats empty/whitespace-only as `null`
 * (so a cleared textarea/input clears the column rather than storing "").
 */
const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value && value.length > 0 ? value : null));

/**
 * Optional URL field: empty/whitespace normalizes to `null`, otherwise it must
 * parse as a valid URL. Shared by create and update.
 */
const optionalUrl = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value && value.length > 0 ? value : null))
  .refine((value) => value === null || z.url().safeParse(value).success, {
    message: "Enter a valid URL",
  });

/**
 * Tag list: trims each entry, drops empties, and de-duplicates to avoid ItemTag
 * primary-key clashes. Shared by create and update.
 */
const tagList = z.array(z.string()).transform((tags) => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const name = raw.trim();
    if (name.length > 0 && !seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }
  return result;
});

/**
 * Payload for updating an item from the drawer's edit mode. The server action
 * is the source of truth — the client's disabled-Save guard is only UX.
 *
 * Type-specific fields (content/language/url) are always present in the payload;
 * the client sends the existing value for fields not shown for a given type, so
 * nothing is wiped. Tags arrive as an array (the client splits the comma input).
 */
export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: optionalText,
  content: optionalText,
  language: optionalText,
  url: optionalUrl,
  tags: tagList,
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

/** Item types offered by the create dialog (File/Image are Pro-only, excluded). */
export const CREATE_ITEM_TYPES = [
  "snippet",
  "prompt",
  "command",
  "note",
  "link",
] as const;

export type CreateItemType = (typeof CREATE_ITEM_TYPES)[number];

/**
 * Payload for creating an item from the "New Item" dialog. The server action is
 * the source of truth. Like update, all type-specific fields are optional at the
 * schema level; the `link` type additionally requires a URL, enforced by the
 * refine below (with a `url` path so the message attaches to that field).
 */
export const createItemSchema = z
  .object({
    type: z.enum(CREATE_ITEM_TYPES, { message: "Choose an item type" }),
    title: z.string().trim().min(1, "Title is required"),
    description: optionalText,
    content: optionalText,
    language: optionalText,
    url: optionalUrl,
    tags: tagList,
  })
  .refine((data) => data.type !== "link" || data.url !== null, {
    message: "URL is required for links",
    path: ["url"],
  });

export type CreateItemInput = z.infer<typeof createItemSchema>;
