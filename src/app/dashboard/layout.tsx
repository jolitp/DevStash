import { TopBar } from "@/components/dashboard/TopBar";

/**
 * Dashboard shell: fixed top bar with the sidebar and main workspace below.
 * The sidebar is a placeholder for phase 1 and gets built out in later phases.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <aside className="w-64 shrink-0 border-r border-border p-4">
          <h2 className="text-lg font-semibold">Sidebar</h2>
        </aside>
        <main className="min-w-0 flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}