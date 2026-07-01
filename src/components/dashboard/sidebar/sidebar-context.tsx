"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface SidebarContextValue {
  /** Desktop: icon-only rail when true. */
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  /** Mobile: off-canvas drawer open when true. */
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // While the mobile drawer is open, close on Escape and lock body scroll so
  // the page behind the backdrop doesn't scroll or show its own scrollbar.
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
        isMobileOpen,
        openMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}