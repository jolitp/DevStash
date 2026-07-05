"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

import { updateItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ItemDetail } from "@/lib/db/items";

// Which type-specific fields each item type exposes (lowercase ItemType.name).
const CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPES = new Set(["snippet", "command"]);
const URL_TYPES = new Set(["link"]);

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

/**
 * Inline edit form for the item drawer. Controlled inputs with local state (no
 * form library, per spec). On save it calls the `updateItem` server action,
 * hands the refreshed detail back via `onSaved`, and refreshes the route so the
 * underlying card list reflects the change. Fields not shown for this item type
 * keep their existing values so nothing is wiped.
 */
export function ItemEditForm({
  detail,
  onCancel,
  onSaved,
}: {
  detail: ItemDetail;
  onCancel: () => void;
  onSaved: (updated: ItemDetail) => void;
}) {
  const router = useRouter();
  const typeName = detail.type.name.toLowerCase();
  const showContent = CONTENT_TYPES.has(typeName);
  const showLanguage = LANGUAGE_TYPES.has(typeName);
  const showUrl = URL_TYPES.has(typeName);

  const [title, setTitle] = useState(detail.title);
  const [description, setDescription] = useState(detail.description ?? "");
  const [content, setContent] = useState(detail.content ?? "");
  const [language, setLanguage] = useState(detail.language ?? "");
  const [url, setUrl] = useState(detail.url ?? "");
  const [tags, setTags] = useState(detail.tags.join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleEmpty = title.trim().length === 0;

  async function handleSave() {
    if (titleEmpty || saving) return;
    setSaving(true);
    setError(null);

    const result = await updateItem(detail.id, {
      title,
      description,
      // Keep values for fields this type doesn't edit, so they aren't wiped.
      content: showContent ? content : detail.content,
      language: showLanguage ? language : detail.language,
      url: showUrl ? url : detail.url,
      tags: tags.split(","),
    });

    if (!result.success) {
      setSaving(false);
      setError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("Item updated");
    onSaved(result.data);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Field label="Title" htmlFor="edit-title">
        <Input
          id="edit-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={titleEmpty}
          disabled={saving}
        />
      </Field>

      <Field label="Description" htmlFor="edit-description">
        <Textarea
          id="edit-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          disabled={saving}
        />
      </Field>

      {showContent && (
        <Field label="Content" htmlFor="edit-content">
          {/* Code types (snippet/command) get the Monaco editor; prose types
              (prompt/note) stay on the plain textarea. */}
          {showLanguage ? (
            <CodeEditor
              value={content}
              onChange={setContent}
              language={language}
              disabled={saving}
            />
          ) : (
            <Textarea
              id="edit-content"
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
        <Field label="Language" htmlFor="edit-language">
          <Input
            id="edit-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            disabled={saving}
          />
        </Field>
      )}

      {showUrl && (
        <Field label="URL" htmlFor="edit-url">
          <Input
            id="edit-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={saving}
          />
        </Field>
      )}

      <Field label="Tags" htmlFor="edit-tags">
        <Input
          id="edit-tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="comma, separated, tags"
          disabled={saving}
        />
      </Field>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <Button onClick={handleSave} disabled={titleEmpty || saving} size="sm">
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          <X />
          Cancel
        </Button>
      </div>
    </div>
  );
}
