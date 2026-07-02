/**
 * Summary counts for the dashboard stat cards.
 *
 * Reads real data from Postgres via Prisma. Unscoped until auth lands (single
 * seeded user); add a `userId` filter once sessions exist.
 */
import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  items: number;
  collections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

/** Total items/collections and how many of each are favorited. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [items, collections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count(),
      prisma.collection.count(),
      prisma.item.count({ where: { isFavorite: true } }),
      prisma.collection.count({ where: { isFavorite: true } }),
    ]);

  return { items, collections, favoriteItems, favoriteCollections };
}