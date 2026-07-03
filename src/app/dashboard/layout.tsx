import { auth } from "@/auth";
import { Sidebar } from "@/components/dashboard/sidebar/Sidebar";
import { SidebarProvider } from "@/components/dashboard/sidebar/sidebar-context";
import {
  capitalize,
  type NavLink,
} from "@/components/dashboard/sidebar/sidebar-data";
import { TopBar } from "@/components/dashboard/TopBar";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/item-types";

// The sidebar reads live item types and collections from the database.
export const dynamic = "force-dynamic";

/** Item types gated behind the Pro plan (file uploads & images). */
const PRO_TYPES = new Set(["file", "image"]);

/**
 * Dashboard shell: a full-height collapsible sidebar on the left, with the top
 * bar and main workspace stacked to its right. The sidebar becomes an
 * off-canvas drawer on mobile. Types and collections come from the database.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, itemTypes, collections] = await Promise.all([
    auth(),
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  const user = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? null,
    image: session?.user?.image ?? null,
  };

  const typeLinks: NavLink[] = itemTypes.map((type) => ({
    label: capitalize(type.name),
    href: `/items/${type.name}`,
    icon: type.icon ?? "Folder",
    color: type.color,
    count: type.count,
    pro: PRO_TYPES.has(type.name),
  }));

  const favoriteCollections: NavLink[] = collections.favorites.map(
    (collection) => ({
      label: collection.name,
      href: `/collections/${collection.id}`,
      icon: "Star",
      count: collection.itemCount,
    }),
  );

  const recentCollections: NavLink[] = collections.recent.map((collection) => ({
    label: collection.name,
    href: `/collections/${collection.id}`,
    count: collection.itemCount,
    dotColor: collection.accentColor,
  }));

  return (
    <SidebarProvider>
      <div className="flex h-dvh">
        <Sidebar
          user={user}
          typeLinks={typeLinks}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-w-0 flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}