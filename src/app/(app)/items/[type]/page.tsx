import { notFound } from "next/navigation";

import { ItemCard } from "@/components/dashboard/main/ItemCard";
import { capitalize } from "@/components/dashboard/sidebar/sidebar-data";
import { getItemsByType } from "@/lib/db/items";
import { ITEM_TYPE_ICONS } from "@/lib/item-type-icons";

// Reads live data from the database, so render per-request rather than
// prerendering at build time.
export const dynamic = "force-dynamic";

/**
 * Items list filtered by type: `/items/[type]` (e.g. `/items/snippet`). The
 * `[type]` param is the lowercase `ItemType.name` the sidebar links to; an
 * unknown type renders a 404.
 */
export default async function ItemsByTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: typeParam } = await params;
  const data = await getItemsByType(decodeURIComponent(typeParam));

  if (!data) notFound();

  const { type, items, referenceNow } = data;
  const color = type.color ?? undefined;
  const TypeIcon = type.icon ? ITEM_TYPE_ICONS[type.icon] : undefined;
  const label = capitalize(type.name);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-center gap-3">
        <span
          className="inline-flex size-9 items-center justify-center rounded-lg"
          style={color ? { color, backgroundColor: `${color}1a` } : undefined}
        >
          {TypeIcon && <TypeIcon className="size-5" />}
        </span>
        <div>
          <h1 className="text-xl font-semibold">{label}</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No {label.toLowerCase()} items yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} referenceNow={referenceNow} />
          ))}
        </div>
      )}
    </div>
  );
}
