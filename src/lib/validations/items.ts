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
 * Payload for updating an item from the drawer's edit mode. The server action
 * is the source of truth — the client's disabled-Save guard is only UX.
 *
 * Type-specific fields (content/language/url) are always present in the payload;
 * the client sends the existing value for fields not shown for a given type, so
 * nothing is wiped. Tags arrive as an array (the client splits the comma input);
 * we trim, drop empties, and de-duplicate to avoid ItemTag primary-key clashes.
 */
export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: optionalText,
  content: optionalText,
  language: optionalText,
  url: z
    .string()
    .trim()
    .nullish()
    .transform((value) => (value && value.length > 0 ? value : null))
    .refine((value) => value === null || z.url().safeParse(value).success, {
      message: "Enter a valid URL",
    }),
  tags: z
    .array(z.string())
    .transform((tags) => {
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
    }),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
