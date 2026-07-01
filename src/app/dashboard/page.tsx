import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CollectionCard } from "@/components/dashboard/main/CollectionCard";
import {
  pinnedItems,
  recentCollections,
  recentItems,
} from "@/components/dashboard/main/dashboard-data";
import { ItemCard } from "@/components/dashboard/main/ItemCard";
import { SectionHeader } from "@/components/dashboard/main/SectionHeader";
import { StatsCards } from "@/components/dashboard/main/StatsCards";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <StatsCards />

      {pinnedItems.length > 0 && (
        <section>
          <SectionHeader title="Pinned Items" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pinnedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Recent Collections" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recentCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Recent Items"
          action={
            <Button size="sm" variant="outline">
              <Plus />
              Add item
            </Button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}