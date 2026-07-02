import Link from "next/link";
import { Folder } from "lucide-react";

import type { DashboardCollection } from "@/lib/db/collections";
import { ITEM_TYPE_ICONS } from "@/lib/item-type-icons";

/** Compact collection card linking to its detail route. */
export function CollectionCard({
  collection,
}: {
  collection: DashboardCollection;
}) {
  const { accentColor, itemCount, types } = collection;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="block rounded-xl border border-border border-l-4 bg-card p-4 transition-colors hover:bg-muted/40"
      style={accentColor ? { borderLeftColor: accentColor } : undefined}
    >
      <div className="flex items-center gap-2">
        <Folder className="size-4 shrink-0 text-muted-foreground" />
        <h3 className="truncate font-medium">{collection.name}</h3>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {collection.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {collection.description}
        </p>
      )}

      {types.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          {types.map((type) => {
            const Icon = type.icon ? ITEM_TYPE_ICONS[type.icon] : undefined;
            if (!Icon) return null;
            return (
              <span
                key={type.id}
                title={`${type.name} · ${type.count}`}
                className="inline-flex size-6 items-center justify-center rounded-md"
                style={
                  type.color
                    ? { color: type.color, backgroundColor: `${type.color}1a` }
                    : undefined
                }
              >
                <Icon className="size-3.5" />
              </span>
            );
          })}
        </div>
      )}
    </Link>
  );
}