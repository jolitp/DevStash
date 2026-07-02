/**
 * Sidebar navigation model.
 *
 * Static links live here; the Types and Collections sections are built from
 * live database data and passed into the Sidebar as props (see the dashboard
 * layout). Icon names are lucide-react export names the Sidebar resolves to
 * components. Type routes follow /items/[name] per the spec.
 */

export interface NavLink {
  label: string;
  href: string;
  /** lucide-react icon export name (omit when rendering a colored dot) */
  icon?: string;
  /** optional accent color for the icon (hex) */
  color?: string | null;
  /** optional trailing count badge */
  count?: number;
  /** when present (incl. null), render a colored dot instead of an icon */
  dotColor?: string | null;
  /** show a "PRO" badge (Pro-tier types like File and Image) */
  pro?: boolean;
}

/** "snippet" -> "Snippet" for display labels. */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const libraryLinks: NavLink[] = [
  { label: "All Items", href: "/dashboard", icon: "Layers" },
  { label: "Favorites", href: "/favorites", icon: "Star" },
  { label: "Pinned", href: "/pinned", icon: "Pin" },
  { label: "Recently Used", href: "/recent", icon: "Clock" },
];