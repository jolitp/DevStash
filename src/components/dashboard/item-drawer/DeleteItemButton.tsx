"use client";

import { useState } from "react";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { deleteItem } from "@/actions/items";
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
import { Button } from "@/components/ui/button";

/**
 * "Delete item" action guarded by a confirmation dialog. On confirm it calls the
 * `deleteItem` server action, then notifies the parent (which closes the drawer
 * and refreshes the list). A toast reports success or failure.
 */
export function DeleteItemButton({
  itemId,
  title,
  disabled,
  onDeleted,
}: {
  itemId: string;
  title: string;
  disabled?: boolean;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);

    const result = await deleteItem(itemId);
    if (!result.success) {
      toast.error("Couldn't delete item", { description: result.error });
      setPending(false);
      return;
    }

    toast.success("Item deleted");
    onDeleted();
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
          <Button variant="destructive" size="sm" disabled={disabled}>
            <Trash2 />
            Delete
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes{" "}
            <span className="font-medium text-foreground">{title}</span> and its
            tags. This action cannot be undone.
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
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
