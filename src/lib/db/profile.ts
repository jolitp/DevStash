/**
 * Profile page queries — the signed-in user's account info and usage stats.
 *
 * Unlike the dashboard selectors (still unscoped against the single seeded
 * user), these are scoped to a `userId` since the profile is explicitly about
 * "your" account.
 */
import { prisma } from "@/lib/prisma";

/** Account fields shown on the profile page. */
export interface ProfileAccount {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  /** True for email/password signups; false for OAuth-only accounts. */
  hasPassword: boolean;
}

/** One row of the per-type item breakdown. */
export interface ItemTypeBreakdown {
  id: string;
  /** stored lowercase (e.g. "snippet") */
  name: string;
  /** lucide-react icon export name (from ItemType.icon) */
  icon: string | null;
  /** hex accent color (from ItemType.color) */
  color: string | null;
  count: number;
}

export interface ProfileStats {
  totalItems: number;
  totalCollections: number;
  breakdown: ItemTypeBreakdown[];
}

/**
 * Fetch the account fields for the profile header. Returns null if the user
 * row no longer exists (e.g. deleted in another tab). Never returns the
 * password hash — only whether one is set.
 */
export async function getProfileAccount(
  userId: string,
): Promise<ProfileAccount | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      password: true,
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: Boolean(user.password),
  };
}

/**
 * Totals plus a per-type breakdown covering every system type (and the user's
 * own custom types), including types with zero items so the full set always
 * renders. Ordered by name.
 */
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [types, grouped, totalCollections] = await Promise.all([
    prisma.itemType.findMany({
      where: { OR: [{ isSystem: true }, { userId }] },
      orderBy: { name: "asc" },
      select: { id: true, name: true, icon: true, color: true },
    }),
    prisma.item.groupBy({
      by: ["typeId"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.collection.count({ where: { userId } }),
  ]);

  const countByType = new Map(
    grouped.map((row) => [row.typeId, row._count._all]),
  );

  const breakdown: ItemTypeBreakdown[] = types.map((type) => ({
    id: type.id,
    name: type.name,
    icon: type.icon,
    color: type.color,
    count: countByType.get(type.id) ?? 0,
  }));

  const totalItems = breakdown.reduce((sum, row) => sum + row.count, 0);

  return { totalItems, totalCollections, breakdown };
}
