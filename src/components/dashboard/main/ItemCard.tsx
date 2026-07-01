import {
  Code2,
  File,
  FileText,
  Image,
  Link as LinkIcon,
  Pin,
  Sparkles,
  SquareTerminal,
  Star,
} from "lucide-react";

import type { Item } from "@/lib/mock-data";
import { fileExtension, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import { referenceNow, typeById } from "./dashboard-data";

type IconComponent = React.ComponentType<{ className?: string }>;

/** Resolves item-type icon names (from mock data) to components. */
const TYPE_ICONS: Record<string, IconComponent> = {
  Code2,
  Sparkles,
  FileText,
  SquareTerminal,
  File,
  Image,
  Link: LinkIcon,
};

function Preview({ item }: { item: Item }) {
  let text: string;
  if (item.contentType === "file" && item.fileName) {
    const ext = fileExtension(item.fileName);
    text = [item.fileName, item.fileSize, ext].filter(Boolean).join(" · ");
  } else if (item.url) {
    text = item.url;
  } else if (item.content) {
    text = item.content;
  } else {
    return null;
  }

  return (
    <pre className="mt-3 max-h-24 overflow-hidden rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-xs whitespace-pre-wrap text-muted-foreground">
      {text}
    </pre>
  );
}

/** A single item preview card for the dashboard grids. */
export function ItemCard({ item }: { item: Item }) {
  const type = typeById.get(item.typeId);
  const color = type?.color;
  const TypeIcon = type ? TYPE_ICONS[type.icon] : undefined;

  return (
    <article
      className="flex flex-col rounded-xl border border-border border-l-4 bg-card p-4 transition-colors hover:bg-muted/30"
      style={color ? { borderLeftColor: color } : undefined}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
          style={color ? { color, backgroundColor: `${color}1a` } : undefined}
        >
          {TypeIcon && <TypeIcon className="size-3.5" />}
          {type?.name}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {item.isPinned && (
            <Pin className="size-4 text-muted-foreground" aria-label="Pinned" />
          )}
          {item.isFavorite && (
            <Star
              className="size-4 fill-amber-400 text-amber-400"
              aria-label="Favorite"
            />
          )}
        </div>
      </div>

      <h3 className="mt-3 font-semibold">{item.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {item.description}
      </p>

      <Preview item={item} />

      <div className="mt-3 flex items-center gap-2 pt-1">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
        <span
          className={cn(
            "ml-auto shrink-0 text-xs text-muted-foreground",
            "whitespace-nowrap",
          )}
        >
          {formatRelativeTime(item.updatedAt, referenceNow)}
        </span>
      </div>
    </article>
  );
}