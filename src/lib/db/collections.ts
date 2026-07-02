/**
 * Collection queries for the dashboard.
 *
 * Reads real data from Postgres via Prisma. Until auth lands there is a single
 * seeded user, so these run unscoped; add a `userId` filter once sessions exist.
 */
import { prisma } from "@/lib/prisma";

/** A distinct item type present in a collection, with how many items use it. */
export interface CollectionTypeBadge {
  id: string;
  name: string;
  /** lucide-react icon export name (from ItemType.icon) */
  icon: string | null;
  /** hex accent color (from ItemType.color) */
  color: string | null;
  count: number;
}

export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  /** distinct item types in this collection, most-used first */
  types: CollectionTypeBadge[];
  /** border accent color, from the most-used type (null when empty) */
  accentColor: string | null;
}

/** Most recent item timestamp in a collection, as epoch ms (0 when empty). */
function latestActivity(items: { updatedAt: Date }[]): number {
  return items.reduce(
    (latest, item) => Math.max(latest, item.updatedAt.getTime()),
    0,
  );
}

/**
 * Collections ordered by most recent item activity, shaped for the dashboard
 * cards. Each carries its item count and the distinct types it contains.
 */
export async function getRecentCollections(
  limit = 6,
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    include: {
      items: {
        select: {
          updatedAt: true,
          type: {
            select: { id: true, name: true, icon: true, color: true },
          },
        },
      },
    },
  });

  return collections
    .sort(
      (a, b) =>
        latestActivity(b.items) - latestActivity(a.items) ||
        b.updatedAt.getTime() - a.updatedAt.getTime(),
    )
    .slice(0, limit)
    .map((collection) => {
      // Tally item types, keeping the most-used first.
      const byType = new Map<string, CollectionTypeBadge>();
      for (const { type } of collection.items) {
        const existing = byType.get(type.id);
        if (existing) {
          existing.count += 1;
        } else {
          byType.set(type.id, {
            id: type.id,
            name: type.name,
            icon: type.icon,
            color: type.color,
            count: 1,
          });
        }
      }

      const types = [...byType.values()].sort((a, b) => b.count - a.count);

      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        itemCount: collection.items.length,
        types,
        accentColor: types[0]?.color ?? null,
      };
    });
}