"use server";

import { auth } from "@/auth";
import {
  updateItem as updateItemQuery,
  type ItemDetail,
} from "@/lib/db/items";
import { prisma } from "@/lib/prisma";
import { updateItemSchema } from "@/lib/validations/items";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Update an item from the drawer's edit mode.
 *
 * Validates the payload with Zod (source of truth), requires a session, and
 * checks the item belongs to the signed-in user before writing — a mutation, so
 * it is owner-scoped even though the read selectors are still unscoped. Returns
 * the refreshed `ItemDetail` so the drawer can update in place.
 */
export async function updateItem(
  itemId: string,
  input: unknown,
): Promise<ActionResult<ItemDetail>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in" };
  }

  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const existing = await prisma.item.findUnique({
    where: { id: itemId },
    select: { userId: true },
  });
  if (!existing) {
    return { success: false, error: "Item not found" };
  }
  if (existing.userId !== session.user.id) {
    return { success: false, error: "You do not have access to this item" };
  }

  try {
    const data = await updateItemQuery(itemId, session.user.id, parsed.data);
    return { success: true, data };
  } catch (error) {
    console.error("Update item failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
