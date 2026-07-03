"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SidebarUserData {
  name: string | null;
  email: string | null;
  image: string | null;
}

/** Hide labels/text when the desktop rail is collapsed. */
const HIDE_ON_COLLAPSE = "group-data-[collapsed=true]/sidebar:lg:hidden";

/**
 * Footer user area: avatar + name/email that opens a dropdown with a link to
 * the profile and a sign-out action. The whole row is the dropdown trigger.
 */
export function SidebarUser({ user }: { user: SidebarUserData }) {
  const displayName = user.name ?? user.email ?? "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-md p-1 text-left transition-colors",
          "hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          "group-data-[collapsed=true]/sidebar:lg:justify-center",
        )}
      >
        <UserAvatar
          name={user.name}
          email={user.email}
          image={user.image}
          size={36}
        />
        <span
          className={cn(
            "flex min-w-0 flex-col leading-tight",
            HIDE_ON_COLLAPSE,
          )}
        >
          <span className="truncate text-sm font-medium">{displayName}</span>
          {user.email && (
            <span className="truncate text-xs text-sidebar-foreground/60">
              {user.email}
            </span>
          )}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
            {displayName}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
