"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { DashboardItem } from "@/lib/db/items";

import { ItemDrawer } from "./ItemDrawer";

interface ItemDrawerContextValue {
  /** The card the drawer opened on — used to render the header instantly. */
  item: DashboardItem | null;
  open: boolean;
  /** Open the drawer for a given item card. */
  openItem: (item: DashboardItem) => void;
  setOpen: (open: boolean) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

/**
 * Holds the item-drawer state (selected card + open flag) so server-rendered
 * pages can render `ItemCard`s that open a single shared drawer on click. The
 * drawer itself is mounted here once, under the provider.
 */
export function ItemDrawerProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = useState<DashboardItem | null>(null);
  const [open, setOpen] = useState(false);

  const openItem = useCallback((next: DashboardItem) => {
    setItem(next);
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ item, open, openItem, setOpen }),
    [item, open, openItem],
  );

  return (
    <ItemDrawerContext value={value}>
      {children}
      <ItemDrawer />
    </ItemDrawerContext>
  );
}

export function useItemDrawer(): ItemDrawerContextValue {
  const context = useContext(ItemDrawerContext);
  if (!context) {
    throw new Error("useItemDrawer must be used within an ItemDrawerProvider");
  }
  return context;
}
