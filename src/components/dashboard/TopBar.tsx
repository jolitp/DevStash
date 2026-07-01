import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/dashboard/sidebar/SidebarTrigger";

/**
 * Dashboard top bar: mobile sidebar trigger, global search, and the "New Item"
 * action. Search stays display only until later phases wire it up; the brand
 * now lives in the sidebar header.
 */
export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-4">
      <SidebarTrigger />

      <div className="relative mx-auto w-full max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search content, tags, titles..."
          className="h-9 pl-8"
          aria-label="Search"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>

      <Button className="shrink-0">
        <Plus />
        New Item
      </Button>
    </header>
  );
}