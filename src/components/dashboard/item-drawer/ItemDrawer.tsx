"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, FolderOpen, Pencil, Pin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ItemDetail } from "@/lib/db/items";
import { fileExtension, formatFileSize, formatRelativeTime } from "@/lib/format";
import { ITEM_TYPE_ICONS } from "@/lib/item-type-icons";
import { cn } from "@/lib/utils";

import { DeleteItemButton } from "./DeleteItemButton";
import { ItemEditForm } from "./ItemEditForm";
import { useItemDrawer } from "./item-drawer-context";

/** The raw text the Copy button puts on the clipboard for an item. */
function copyableText(detail: ItemDetail): string {
  if (detail.url) return detail.url;
  if (detail.content) return detail.content;
  if (detail.fileName) return detail.fileName;
  return detail.title;
}

function MetaBadge({
  icon: Icon,
  children,
}: {
  icon?: typeof FolderOpen;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
      {Icon && <Icon className="size-3.5" />}
      {children}
    </span>
  );
}

function CopyButton({ detail }: { detail: ItemDetail }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyableText(detail));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context) — ignore.
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="text-emerald-500" /> : <Copy />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

/** The full content preview for a text/file/url item. */
function DetailContent({ detail }: { detail: ItemDetail }) {
  if (detail.contentType === "file" && detail.fileName) {
    const ext = fileExtension(detail.fileName);
    const size = detail.fileSize ? formatFileSize(detail.fileSize) : "";
    return (
      <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
        {[detail.fileName, size, ext].filter(Boolean).join(" · ")}
      </p>
    );
  }

  if (detail.url) {
    return (
      <a
        href={detail.url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-xs break-all text-primary hover:underline"
      >
        {detail.url}
      </a>
    );
  }

  if (detail.content) {
    return (
      <pre className="overflow-x-auto rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-xs whitespace-pre-wrap text-foreground/90">
        {detail.content}
      </pre>
    );
  }

  return (
    <p className="text-sm text-muted-foreground italic">No content.</p>
  );
}

function DrawerSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-2">
        <div className="h-6 w-28 rounded-md bg-muted" />
        <div className="h-6 w-24 rounded-md bg-muted" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded-lg bg-muted" />
        <div className="h-8 w-24 rounded-lg bg-muted" />
        <div className="h-8 w-20 rounded-lg bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-24 w-full rounded-md bg-muted" />
      </div>
    </div>
  );
}

/**
 * Right-side detail drawer for a single item. The header renders instantly from
 * the clicked card's data; the full detail (content, collection, language) is
 * fetched from `/api/items/[id]` on open, with a skeleton while it loads.
 */
interface FetchResult {
  /** Item id this result belongs to (guards against stale responses). */
  id: string;
  detail: ItemDetail | null;
  error: string | null;
  /** Wall-clock time the detail loaded, for stable relative-time rendering. */
  fetchedAt: number;
}

export function ItemDrawer() {
  const router = useRouter();
  const { item, open, setOpen } = useItemDrawer();
  const [result, setResult] = useState<FetchResult | null>(null);
  // Which item is being edited; `editing` derives from this so switching items
  // (itemId changes) automatically leaves edit mode without an effect.
  const [editingId, setEditingId] = useState<string | null>(null);

  const itemId = item?.id;
  const editing = itemId != null && editingId === itemId;

  useEffect(() => {
    if (!open || !itemId) return;

    const controller = new AbortController();

    fetch(`/api/items/${itemId}`, { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.error ?? "Failed to load item");
        }
        setResult({
          id: itemId,
          detail: body.data as ItemDetail,
          error: null,
          fetchedAt: Date.now(),
        });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setResult({
          id: itemId,
          detail: null,
          error: err instanceof Error ? err.message : "Failed to load item",
          fetchedAt: Date.now(),
        });
      });

    return () => controller.abort();
  }, [open, itemId]);

  // Only trust a result that matches the currently open item; otherwise show
  // the skeleton (covers the initial load and switching between cards).
  const current = result && result.id === itemId ? result : null;
  const detail = current?.detail ?? null;
  const error = current?.error ?? null;

  // Refresh the drawer in place with the saved detail, then return to view mode.
  function handleSaved(updated: ItemDetail) {
    setResult({
      id: updated.id,
      detail: updated,
      error: null,
      fetchedAt: Date.now(),
    });
    setEditingId(null);
  }

  const type = item?.type;
  const color = type?.color ?? undefined;
  const TypeIcon = type?.icon ? ITEM_TYPE_ICONS[type.icon] : undefined;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setEditingId(null);
        setOpen(next);
      }}
    >
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg">
        {item && (
          <>
            {/* Header — renders instantly from the clicked card, then prefers
                the fetched/refreshed detail so edits show up here too. */}
            <div className="border-b border-border px-6 pt-6 pb-4 pr-14">
              {type && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium capitalize"
                  style={
                    color
                      ? { color, backgroundColor: `${color}1a` }
                      : undefined
                  }
                >
                  {TypeIcon && <TypeIcon className="size-3.5" />}
                  {type.name}
                </span>
              )}
              <SheetTitle className="mt-3">
                {detail?.title ?? item.title}
              </SheetTitle>
              {(detail ? detail.description : item.description) ? (
                <SheetDescription className="mt-1">
                  {detail ? detail.description : item.description}
                </SheetDescription>
              ) : (
                <SheetDescription className="sr-only">
                  Item detail
                </SheetDescription>
              )}
            </div>

            {/* Body — full detail fetched on open. */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : !detail ? (
                <DrawerSkeleton />
              ) : editing ? (
                <ItemEditForm
                  detail={detail}
                  onCancel={() => setEditingId(null)}
                  onSaved={handleSaved}
                />
              ) : (
                <div className="space-y-6">
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2">
                    {detail.collection && (
                      <MetaBadge icon={FolderOpen}>
                        {detail.collection.name}
                      </MetaBadge>
                    )}
                    {detail.language && (
                      <MetaBadge>{detail.language}</MetaBadge>
                    )}
                    <MetaBadge>
                      Updated{" "}
                      {formatRelativeTime(
                        detail.updatedAt,
                        current?.fetchedAt ?? Date.parse(detail.updatedAt),
                      )}
                    </MetaBadge>
                  </div>

                  {/* Action bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton detail={detail} />
                    <Button
                      variant="outline"
                      size="sm"
                      aria-pressed={detail.isFavorite}
                    >
                      <Star
                        className={cn(
                          detail.isFavorite &&
                            "fill-amber-400 text-amber-400",
                        )}
                      />
                      {detail.isFavorite ? "Favorited" : "Favorite"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-pressed={detail.isPinned}
                    >
                      <Pin
                        className={cn(
                          detail.isPinned && "fill-current text-foreground",
                        )}
                      />
                      {detail.isPinned ? "Pinned" : "Pin"}
                    </Button>
                  </div>

                  {/* Content */}
                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Content
                    </h3>
                    <DetailContent detail={detail} />
                  </section>

                  {/* Tags */}
                  {detail.tags.length > 0 && (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {detail.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions — hidden in edit mode (Save/Cancel live inline). */}
            {!editing && (
              <div className="flex items-center gap-2 border-t border-border px-6 py-4">
                <DeleteItemButton
                  itemId={itemId ?? ""}
                  title={detail?.title ?? item.title}
                  disabled={!detail}
                  onDeleted={() => {
                    setOpen(false);
                    router.refresh();
                  }}
                />
                <Button
                  size="sm"
                  className="ml-auto"
                  disabled={!detail}
                  onClick={() => setEditingId(itemId ?? null)}
                >
                  <Pencil />
                  Edit item
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
