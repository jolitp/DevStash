"use client";

import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSidebar } from "./sidebar-context";

/** Mobile-only button that opens the off-canvas sidebar drawer. */
export function SidebarTrigger() {
  const { openMobile } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openMobile}
      aria-label="Open sidebar"
      className="lg:hidden"
    >
      <PanelLeft />
    </Button>
  );
}