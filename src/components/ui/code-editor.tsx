"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { BeforeMount, OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

import { cn } from "@/lib/utils";

// Monaco touches browser-only APIs, so load it on the client only. The header
// (window dots + language + copy) still renders while this placeholder shows,
// since dynamic only replaces the editor body below it.
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <EditorPlaceholder />,
});

const MIN_HEIGHT = 96;
const MAX_HEIGHT = 400;
const THEME_NAME = "devstash-dark";

// Editor chrome that matches the app's dark theme, incl. a subtle themed
// scrollbar slider (colors set on the custom theme, sizing here).
const BASE_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 13,
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 12, bottom: 12 },
  renderLineHighlight: "none",
  overviewRulerLanes: 0,
  smoothScrolling: true,
  scrollbar: {
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    useShadows: false,
    alwaysConsumeMouseWheel: false,
  },
};

// Common aliases → Monaco language ids. Unknown values fall through unchanged;
// Monaco degrades gracefully to plain text when it doesn't recognize the id.
const LANGUAGE_ALIASES: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  yml: "yaml",
  md: "markdown",
};

function normalizeLanguage(language: string | null | undefined): string {
  const key = (language ?? "").trim().toLowerCase();
  if (!key) return "plaintext";
  return LANGUAGE_ALIASES[key] ?? key;
}

function EditorPlaceholder() {
  return (
    <div
      className="animate-pulse bg-[#181818]"
      style={{ height: MIN_HEIGHT }}
    />
  );
}

/**
 * Monaco-backed code editor with macOS window chrome, a header showing the
 * language + a quick copy button, a dark theme, and a fluid height that grows
 * with the content up to {@link MAX_HEIGHT}px (then scrolls). Works in both
 * edit mode (`onChange` provided) and readonly display mode.
 */
export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  disabled = false,
  className,
}: {
  value: string;
  onChange?: (value: string) => void;
  language?: string | null;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [copied, setCopied] = useState(false);

  const monacoLanguage = normalizeLanguage(language);
  const languageLabel = (language ?? "").trim() || "plaintext";
  const isReadOnly = readOnly || disabled;

  const handleBeforeMount: BeforeMount = (monaco) => {
    // Snippets are out-of-context fragments, so suppress the TS/JS language
    // service's "cannot find module" / undeclared-symbol squiggles that would
    // otherwise flag perfectly valid stored code as an error.
    const diagnostics = { noSemanticValidation: true, noSyntaxValidation: false };
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
      diagnostics,
    );
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
      diagnostics,
    );

    monaco.editor.defineTheme(THEME_NAME, {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#181818",
        "editorGutter.background": "#181818",
        "scrollbarSlider.background": "#ffffff1a",
        "scrollbarSlider.hoverBackground": "#ffffff33",
        "scrollbarSlider.activeBackground": "#ffffff4d",
        "editorLineNumber.foreground": "#ffffff40",
        "editorLineNumber.activeForeground": "#ffffffb3",
      },
    });
  };

  // Grow the editor to fit its content, clamped to [MIN_HEIGHT, MAX_HEIGHT].
  const handleMount: OnMount = (instance) => {
    const applyHeight = () => {
      const next = Math.min(
        MAX_HEIGHT,
        Math.max(MIN_HEIGHT, instance.getContentHeight()),
      );
      setHeight(next);
    };
    instance.onDidContentSizeChange(applyHeight);
    applyHeight();
  };

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context) — ignore.
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-[#181818]",
        className,
      )}
    >
      {/* macOS-style window chrome + language + copy */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1f1f1f] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-white/50">
            {languageLabel}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <MonacoEditor
        height={height}
        language={monacoLanguage}
        value={value}
        onChange={(next) => onChange?.(next ?? "")}
        theme={THEME_NAME}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={{ ...BASE_OPTIONS, readOnly: isReadOnly, domReadOnly: isReadOnly }}
        loading={<EditorPlaceholder />}
      />
    </div>
  );
}
