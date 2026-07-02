/**
 * Item-type queries for the sidebar.
 *
 * Reads real data from Postgres via Prisma. Until auth lands there is a single
 * seeded user, so these run unscoped; add a `userId` filter once sessions exist.
 */
import { prisma } from "@/lib/prisma";

/** An item type shaped for the sidebar "Types" section. */
export interface SidebarItemType {
  id: string;
  /** stored lowercase (e.g. "snippet"); used for the /items/[name] route */
  name: string;
  /** lucide-react icon export name (from ItemType.icon) */
  icon: string | null;
  /** hex accent color (from ItemType.color) */
  color: string | null;
  /** how many items use this type */
  count: number;
}

/** System + custom item types with their item counts, ordered by name. */
export async function getSidebarItemTypes(): Promise<SidebarItemType[]> {
  const types = await prisma.itemType.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      _count: { select: { items: true } },
    },
  });

  return types.map((type) => ({
    id: type.id,
    name: type.name,
    icon: type.icon,
    color: type.color,
    count: type._count.items,
  }));
}