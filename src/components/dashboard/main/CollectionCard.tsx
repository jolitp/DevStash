import Link from "next/link";
import { Folder } from "lucide-react";

import type { CollectionSummary } from "./dashboard-data";

/** Compact collection card linking to its detail route. */
export function CollectionCard({
  collection,
}: {
  collection: CollectionSummary;
}) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center gap-2">
        <Folder className="size-4 shrink-0 text-muted-foreground" />
        <h3 className="truncate font-medium">{collection.name}</h3>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
          {collection.count} {collection.count === 1 ? "item" : "items"}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {collection.description}
      </p>
    </Link>
  );
}