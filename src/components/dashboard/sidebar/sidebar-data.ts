/**
 * Sidebar navigation model, derived from the mock data.
 *
 * Pure data only (no JSX) — icon names are lucide-react export names that the
 * Sidebar resolves to components. Type routes follow /items/[slug] per the spec.
 */
import { collections, items, itemTypes } from "@/lib/mock-data";

export interface NavLink {
  label: string;
  href: string;
  /** lucide-react icon export name */
  icon: string;
  /** optional accent color for the icon (hex) */
  color?: string;
  /** optional trailing count badge */
  count?: number;
}

/** "Snippet" -> "snippets", "URL" -> "urls" */
export function typeSlug(name: string): string {
  return `${name.toLowerCase()}s`;
}

function itemCount(collectionId: string): number {
  return items.filter((item) => item.collectionId === collectionId).length;
}

/** Most recent activity in a collection, as epoch ms (0 when empty). */
function latestActivity(collectionId: string): number {
  return items
    .filter((item) => item.collectionId === collectionId)
    .reduce((latest, item) => Math.max(latest, Date.parse(item.updatedAt)), 0);
}

export const libraryLinks: NavLink[] = [
  { label: "All Items", href: "/dashboard", icon: "Layers" },
  { label: "Favorites", href: "/favorites", icon: "Star" },
  { label: "Pinned", href: "/pinned", icon: "Pin" },
  { label: "Recently Used", href: "/recent", icon: "Clock" },
];

export const typeLinks: NavLink[] = itemTypes.map((type) => ({
  label: type.name,
  href: `/items/${typeSlug(type.name)}`,
  icon: type.icon,
  color: type.color,
  count: items.filter((item) => item.typeId === type.id).length,
}));

export const favoriteCollections: NavLink[] = collections
  .filter((collection) => collection.isFavorite)
  .map((collection) => ({
    label: collection.name,
    href: `/collections/${collection.id}`,
    icon: "Folder",
    count: itemCount(collection.id),
  }));

export const recentCollections: NavLink[] = [...collections]
  .sort((a, b) => latestActivity(b.id) - latestActivity(a.id))
  .slice(0, 5)
  .map((collection) => ({
    label: collection.name,
    href: `/collections/${collection.id}`,
    icon: "Folder",
    count: itemCount(collection.id),
  }));