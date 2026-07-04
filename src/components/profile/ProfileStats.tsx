import { Folder, Layers } from "lucide-react";

import type { ProfileStats as ProfileStatsData } from "@/lib/db/profile";
import { ITEM_TYPE_ICONS } from "@/lib/item-type-icons";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Usage summary: total items/collections + a per-type item breakdown. */
export function ProfileStats({ stats }: { stats: ProfileStatsData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm text-muted-foreground">
              Items
            </span>
            <Layers className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {stats.totalItems}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm text-muted-foreground">
              Collections
            </span>
            <Folder className="size-4 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {stats.totalCollections}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Items by type
        </h3>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {stats.breakdown.map((type) => {
            const Icon = type.icon ? ITEM_TYPE_ICONS[type.icon] : undefined;
            return (
              <li
                key={type.id}
                className="flex items-center justify-between gap-3 py-1.5"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {Icon && (
                    <span
                      className="shrink-0"
                      style={type.color ? { color: type.color } : undefined}
                    >
                      <Icon className="size-4" />
                    </span>
                  )}
                  <span className="truncate text-sm">
                    {capitalize(type.name)}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                  {type.count}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
