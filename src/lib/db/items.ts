/**
 * Item queries for the dashboard.
 *
 * Reads real data from Postgres via Prisma. Until auth lands there is a single
 * seeded user, so these run unscoped; add a `userId` filter once sessions exist.
 */
import { prisma } from "@/lib/prisma";

/** The item type an item belongs to, for card icons/accent colors. */
export interface DashboardItemType {
  id: string;
  name: string;
  /** lucide-react icon export name (from ItemType.icon) */
  icon: string | null;
  /** hex accent color (from ItemType.color) */
  color: string | null;
}

/** An item shaped for the dashboard cards. */
export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  content: string | null;
  fileName: string | null;
  /** file size in bytes (from ItemType file uploads) */
  fileSize: number | null;
  url: string | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
  /** ISO timestamp, for relative-time formatting */
  updatedAt: string;
  type: DashboardItemType;
}

/** The pinned + recent item grids plus a shared "now" for relative times. */
export interface DashboardItems {
  pinned: DashboardItem[];
  recent: DashboardItem[];
  /** epoch ms of the latest item, so relative times stay stable per render */
  referenceNow: number;
}

const ITEM_SELECT = {
  id: true,
  title: true,
  description: true,
  contentType: true,
  content: true,
  fileName: true,
  fileSize: true,
  url: true,
  language: true,
  isFavorite: true,
  isPinned: true,
  updatedAt: true,
  type: { select: { id: true, name: true, icon: true, color: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;

type ItemRow = {
  updatedAt: Date;
  tags: { tag: { name: string } }[];
  type: DashboardItemType;
} & Omit<DashboardItem, "updatedAt" | "tags" | "type">;

function toDashboardItem(row: ItemRow): DashboardItem {
  return {
    ...row,
    tags: row.tags.map((t) => t.tag.name),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Items for the dashboard: the pinned grid and the most recent items, derived
 * from a single newest-first fetch. `referenceNow` is the latest item time (or
 * the wall clock when empty) so relative times render deterministically.
 */
export async function getDashboardItems(
  recentLimit = 10,
): Promise<DashboardItems> {
  const rows = await prisma.item.findMany({
    orderBy: { updatedAt: "desc" },
    select: ITEM_SELECT,
  });

  const items = rows.map(toDashboardItem);
  // Rows are ordered newest-first, so the first item carries the latest time.
  const referenceNow = items[0] ? Date.parse(items[0].updatedAt) : Date.now();

  return {
    pinned: items.filter((item) => item.isPinned),
    recent: items.slice(0, recentLimit),
    referenceNow,
  };
}