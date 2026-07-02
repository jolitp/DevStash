import { Folder, FolderHeart, Layers, Star } from "lucide-react";

import type { DashboardStats } from "@/lib/db/stats";

type IconComponent = React.ComponentType<{ className?: string }>;

/** Four summary stat cards shown at the top of the dashboard. */
export function StatsCards({ stats }: { stats: DashboardStats }) {
  const CARDS: { label: string; value: number; icon: IconComponent }[] = [
    { label: "Items", value: stats.items, icon: Layers },
    { label: "Collections", value: stats.collections, icon: Folder },
    { label: "Favorite items", value: stats.favoriteItems, icon: Star },
    {
      label: "Favorite collections",
      value: stats.favoriteCollections,
      icon: FolderHeart,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARDS.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm text-muted-foreground">
              {label}
            </span>
            <Icon className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}