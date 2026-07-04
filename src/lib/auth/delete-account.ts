import { prisma } from "@/lib/prisma";

/**
 * Permanently delete a user and all of their content.
 *
 * The schema cascades User → items/collections/tags/custom types/accounts/
 * sessions, but Item → ItemType is `Restrict`, so deleting a user's custom
 * types and their items in one cascade can trip that constraint depending on
 * evaluation order. To stay safe we delete explicitly in FK-safe order inside a
 * transaction (mirrors scripts/delete-users.ts, scoped to one user). System
 * item types (no owner) are never touched.
 */
export async function deleteAccount(userId: string): Promise<void> {
  const scope = { userId };

  await prisma.$transaction([
    prisma.itemTag.deleteMany({ where: { item: scope } }),
    prisma.item.deleteMany({ where: scope }),
    prisma.tag.deleteMany({ where: scope }),
    prisma.collection.deleteMany({ where: scope }),
    // Only the user's custom types; system types have userId = null.
    prisma.itemType.deleteMany({ where: scope }),
    prisma.account.deleteMany({ where: scope }),
    prisma.session.deleteMany({ where: scope }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}
