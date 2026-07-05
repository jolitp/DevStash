"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { createItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CREATE_ITEM_TYPES,
  type CreateItemType,
} from "@/lib/validations/items";

// Which type-specific fields each item type exposes (mirrors ItemEditForm).
const CONTENT_TYPES = new Set<CreateItemType>([
  "snippet",
  "prompt",
  "command",
  "note",
]);
const LANGUAGE_TYPES = new Set<CreateItemType>(["snippet", "command"]);
const URL_TYPES = new Set<CreateItemType>(["link"]);

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const EMPTY = {
  type: "snippet" as CreateItemType,
  title: "",
  description: "",
  content: "",
  language: "",
  url: "",
  tags: "",
};

/**
 * "New Item" dialog opened from the top bar. A type selector reveals the fields
 * relevant to that type; on submit it calls the `createItem` server action,
 * toasts, closes, resets, and refreshes the route so the new card appears.
 * Controlled inputs with local state (no form library, per the edit-mode pattern).
 */
export function NewItemDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<CreateItemType>(EMPTY.type);
  const [title, setTitle] = useState(EMPTY.title);
  const [description, setDescription] = useState(EMPTY.description);
  const [content, setContent] = useState(EMPTY.content);
  const [language, setLanguage] = useState(EMPTY.language);
  const [url, setUrl] = useState(EMPTY.url);
  const [tags, setTags] = useState(EMPTY.tags);

  const showContent = CONTENT_TYPES.has(type);
  const showLanguage = LANGUAGE_TYPES.has(type);
  const showUrl = URL_TYPES.has(type);

  const titleEmpty = title.trim().length === 0;
  const urlMissing = showUrl && url.trim().length === 0;
  const canSubmit = !saving && !titleEmpty && !urlMissing;

  function reset() {
    setType(EMPTY.type);
    setTitle(EMPTY.title);
    setDescription(EMPTY.description);
    setContent(EMPTY.content);
    setLanguage(EMPTY.language);
    setUrl(EMPTY.url);
    setTags(EMPTY.tags);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (saving) return; // don't close mid-submit
    setOpen(next);
    if (!next) reset();
  }

  async function handleCreate() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);

    const result = await createItem({
      type,
      title,
      description,
      // Only send fields relevant to the chosen type; the rest stay unset.
      content: showContent ? content : undefined,
      language: showLanguage ? language : undefined,
      url: showUrl ? url : undefined,
      tags: tags.split(","),
    });

    if (!result.success) {
      setSaving(false);
      setError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Item created");
    setSaving(false);
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="shrink-0">
            <Plus />
            New Item
          </Button>
        }
      />
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
          <DialogDescription>
            Pick a type, then fill in the details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Field label="Type" htmlFor="new-item-type">
            <div id="new-item-type" className="flex flex-wrap gap-1.5">
              {CREATE_ITEM_TYPES.map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={type === option ? "default" : "outline"}
                  onClick={() => setType(option)}
                  disabled={saving}
                >
                  {capitalize(option)}
                </Button>
              ))}
            </div>
          </Field>

          <Field label="Title" htmlFor="new-title">
            <Input
              id="new-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A short, descriptive title"
              aria-invalid={titleEmpty}
              disabled={saving}
            />
          </Field>

          <Field label="Description" htmlFor="new-description">
            <Textarea
              id="new-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              disabled={saving}
            />
          </Field>

          {showContent && (
            <Field label="Content" htmlFor="new-content">
              {/* Code types (snippet/command) get the Monaco editor; prose
                  types (prompt/note) stay on the plain textarea. */}
              {showLanguage ? (
                <CodeEditor
                  value={content}
                  onChange={setContent}
                  language={language}
                  disabled={saving}
                />
              ) : (
                <Textarea
                  id="new-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={6}
                  className="font-mono text-xs"
                  disabled={saving}
                />
              )}
            </Field>
          )}

          {showLanguage && (
            <Field label="Language" htmlFor="new-language">
              <Input
                id="new-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                placeholder="e.g. typescript"
                disabled={saving}
              />
            </Field>
          )}

          {showUrl && (
            <Field label="URL" htmlFor="new-url">
              <Input
                id="new-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
                aria-invalid={urlMissing}
                disabled={saving}
              />
            </Field>
          )}

          <Field label="Tags" htmlFor="new-tags">
            <Input
              id="new-tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="comma, separated, tags"
              disabled={saving}
            />
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canSubmit} size="sm">
            {saving ? <Loader2 className="animate-spin" /> : <Plus />}
            Create item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
