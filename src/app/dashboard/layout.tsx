import { Sidebar } from "@/components/dashboard/sidebar/Sidebar";
import { SidebarProvider } from "@/components/dashboard/sidebar/sidebar-context";
import { TopBar } from "@/components/dashboard/TopBar";

/**
 * Dashboard shell: a full-height collapsible sidebar on the left, with the top
 * bar and main workspace stacked to its right. The sidebar becomes an
 * off-canvas drawer on mobile. Main content is built out in phase 3.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-w-0 flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}