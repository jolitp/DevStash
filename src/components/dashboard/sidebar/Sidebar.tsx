"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Folder, PanelLeft, Terminal, X } from "lucide-react";

import { currentUser } from "@/lib/mock-data";
import { ITEM_TYPE_ICONS } from "@/lib/item-type-icons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useSidebar } from "./sidebar-context";
import { libraryLinks, type NavLink } from "./sidebar-data";

/** Hide when the desktop rail is collapsed; always shown in the mobile drawer. */
const HIDE_ON_COLLAPSE = "group-data-[collapsed=true]/sidebar:lg:hidden";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "px-3 pt-5 pb-1 text-xs font-medium tracking-wider text-sidebar-foreground/50 uppercase",
        HIDE_ON_COLLAPSE,
      )}
    >
      {children}
    </p>
  );
}

function NavItem({ link }: { link: NavLink }) {
  const pathname = usePathname();
  const { closeMobile } = useSidebar();
  const active = pathname === link.href;
  const isDot = link.dotColor !== undefined;
  const Icon = (link.icon ? ITEM_TYPE_ICONS[link.icon] : undefined) ?? Folder;

  return (
    <Link
      href={link.href}
      onClick={closeMobile}
      title={link.label}
      data-active={active}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-foreground",
        "group-data-[collapsed=true]/sidebar:lg:justify-center group-data-[collapsed=true]/sidebar:lg:px-0",
      )}
    >
      {isDot ? (
        <span
          className="size-3 shrink-0 rounded-full bg-muted-foreground"
          {...(link.dotColor
            ? { style: { backgroundColor: link.dotColor } }
            : {})}
        />
      ) : (
        <Icon
          className="size-4 shrink-0"
          {...(link.color ? { style: { color: link.color } } : {})}
        />
      )}
      <span className={cn("flex-1 truncate", HIDE_ON_COLLAPSE)}>
        {link.label}
      </span>
      {link.pro && (
        <Badge
          variant="secondary"
          className={cn(
            "h-4 rounded px-1.5 text-[10px] font-semibold tracking-wider text-sidebar-foreground/60",
            HIDE_ON_COLLAPSE,
          )}
        >
          PRO
        </Badge>
      )}
      {typeof link.count === "number" && (
        <span
          className={cn(
            "text-xs text-sidebar-foreground/50 tabular-nums",
            HIDE_ON_COLLAPSE,
          )}
        >
          {link.count}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({
  typeLinks,
  favoriteCollections,
  recentCollections,
}: {
  typeLinks: NavLink[];
  favoriteCollections: NavLink[];
  recentCollections: NavLink[];
}) {
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } =
    useSidebar();

  const usagePct = Math.min(
    100,
    Math.round((currentUser.itemCount / currentUser.itemLimit) * 100),
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          aria-hidden
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        data-collapsed={isCollapsed}
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
          "transition-transform duration-200 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-auto lg:w-64 lg:translate-x-0",
          "data-[collapsed=true]:lg:w-16",
        )}
      >
        {/* Header: brand + collapse (desktop) / close (mobile) */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-3">
          <Link
            href="/dashboard"
            onClick={closeMobile}
            className={cn("flex min-w-0 items-center gap-2", HIDE_ON_COLLAPSE)}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Terminal className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold">DevStash</span>
              <span className="truncate text-xs text-sidebar-foreground/60">
                Store Smarter
              </span>
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="ml-auto hidden lg:inline-flex group-data-[collapsed=true]/sidebar:lg:mx-auto"
          >
            <PanelLeft />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closeMobile}
            aria-label="Close sidebar"
            className="ml-auto lg:hidden"
          >
            <X />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          <SectionLabel>Library</SectionLabel>
          <ul>
            {libraryLinks.map((link) => (
              <li key={link.href}>
                <NavItem link={link} />
              </li>
            ))}
          </ul>

          <SectionLabel>Types</SectionLabel>
          <ul>
            {typeLinks.map((link) => (
              <li key={link.href}>
                <NavItem link={link} />
              </li>
            ))}
          </ul>

          {favoriteCollections.length > 0 && (
            <>
              <SectionLabel>Favorite Collections</SectionLabel>
              <ul>
                {favoriteCollections.map((link) => (
                  <li key={link.href}>
                    <NavItem link={link} />
                  </li>
                ))}
              </ul>
            </>
          )}

          <SectionLabel>Recent Collections</SectionLabel>
          <ul>
            {recentCollections.map((link) => (
              <li key={link.href}>
                <NavItem link={link} />
              </li>
            ))}
            <li>
              <Link
                href="/collections"
                onClick={closeMobile}
                title="View all collections"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  "group-data-[collapsed=true]/sidebar:lg:justify-center group-data-[collapsed=true]/sidebar:lg:px-0",
                )}
              >
                <ChevronRight className="size-4 shrink-0" />
                <span className={cn("flex-1 truncate", HIDE_ON_COLLAPSE)}>
                  View all collections
                </span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Footer: plan usage + user */}
        <div className="shrink-0 space-y-3 border-t border-sidebar-border p-3">
          {!currentUser.isPro && (
            <div
              className={cn(
                "rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3",
                HIDE_ON_COLLAPSE,
              )}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Free plan</span>
                <span className="text-sidebar-foreground/60 tabular-nums">
                  {currentUser.itemCount} / {currentUser.itemLimit}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sidebar-border">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              <Button size="sm" className="mt-3 w-full">
                Upgrade to Pro
              </Button>
            </div>
          )}

          <div
            className={cn(
              "flex items-center gap-3",
              "group-data-[collapsed=true]/sidebar:lg:justify-center",
            )}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.initials}
            </span>
            <span
              className={cn(
                "flex min-w-0 flex-col leading-tight",
                HIDE_ON_COLLAPSE,
              )}
            >
              <span className="truncate text-sm font-medium">
                {currentUser.name}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/60">
                {currentUser.email}
              </span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}