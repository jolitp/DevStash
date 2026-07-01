/**
 * Derived data for the dashboard main area.
 *
 * Pure selectors over the mock data — sorted/sliced here so the page and its
 * sections stay declarative. Replace with real queries once the DB lands.
 */
import { collections, items, itemTypes } from "@/lib/mock-data";

/** Stable "now" for relative times: the most recent item timestamp. */
export const referenceNow = items.reduce(
  (latest, item) => Math.max(latest, Date.parse(item.updatedAt)),
  0,
);

export const stats = {
  items: items.length,
  collections: collections.length,
  favoriteItems: items.filter((item) => item.isFavorite).length,
  favoriteCollections: collections.filter((c) => c.isFavorite).length,
};

const byNewest = (a: { updatedAt: string }, b: { updatedAt: string }) =>
  Date.parse(b.updatedAt) - Date.parse(a.updatedAt);

export const pinnedItems = items.filter((item) => item.isPinned).sort(byNewest);

export const recentItems = [...items].sort(byNewest).slice(0, 10);

function itemCount(collectionId: string): number {
  return items.filter((item) => item.collectionId === collectionId).length;
}

function latestActivity(collectionId: string): number {
  return items
    .filter((item) => item.collectionId === collectionId)
    .reduce((latest, item) => Math.max(latest, Date.parse(item.updatedAt)), 0);
}

export interface CollectionSummary {
  id: string;
  name: string;
  description: string;
  count: number;
}

export const recentCollections: CollectionSummary[] = [...collections]
  .sort((a, b) => latestActivity(b.id) - latestActivity(a.id))
  .slice(0, 4)
  .map((collection) => ({
    id: collection.id,
    name: collection.name,
    description: collection.description,
    count: itemCount(collection.id),
  }));

/** Item type lookup by id, for badges and accent colors on item cards. */
export const typeById = new Map(itemTypes.map((type) => [type.id, type]));