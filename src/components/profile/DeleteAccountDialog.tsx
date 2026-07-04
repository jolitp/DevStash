"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * "Delete account" action guarded by a confirmation dialog. On confirm it calls
 * the delete endpoint, then signs the (now-deleted) user out to the home page.
 */
export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error("Couldn't delete account", {
          description: data?.error ?? "Please try again.",
        });
        setPending(false);
        return;
      }

      // Account is gone — end the session and leave the app.
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Couldn't delete account", {
        description: "Please try again.",
      });
      setPending(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      // Block closing (backdrop/Escape) while the delete is in flight.
      onOpenChange={(next) => {
        if (!pending) setOpen(next);
      }}
    >
      <AlertDialogTrigger
        render={
          <Button variant="destructive">
            <Trash2 />
            Delete account
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your account and all of your items,
            collections, and tags. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={handleDelete}
          >
            {pending && <Loader2 className="animate-spin" />}
            Delete account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
