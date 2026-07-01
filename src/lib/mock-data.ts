/**
 * Mock data for the dashboard UI.
 *
 * Single source of truth for placeholder content until the database is wired up.
 * Shapes loosely follow the Prisma draft in context/project-overview.md, flattened
 * where convenient for rendering. Items reference an item type and (optionally) a
 * collection by id — components look those up as needed.
 */

export type ContentType = "text" | "file";

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  isPro: boolean;
  itemCount: number;
  itemLimit: number;
  collectionLimit: number;
}

export interface ItemType {
  id: string;
  name: string;
  /** lucide-react icon name */
  icon: string;
  /** hex accent color used for badges and card borders */
  color: string;
  isSystem: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  /** used for text-based types (Snippet, Prompt, Note, Command) */
  content: string | null;
  /** used for file-based types (File, Image) */
  fileName: string | null;
  fileSize: string | null;
  /** used for the URL type */
  url: string | null;
  /** language for syntax highlighting on code snippets */
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  typeId: string;
  collectionId: string | null;
  tags: string[];
  updatedAt: string;
}

export const currentUser: User = {
  id: "user_1",
  name: "Alex Kim",
  email: "demo@devstash.dev",
  initials: "AK",
  avatarColor: "#22c55e",
  isPro: false,
  itemCount: 42,
  itemLimit: 50,
  collectionLimit: 3,
};

export const itemTypes: ItemType[] = [
  { id: "type_snippet", name: "Snippet", icon: "Code2", color: "#22c55e", isSystem: true },
  { id: "type_prompt", name: "Prompt", icon: "Sparkles", color: "#a855f7", isSystem: true },
  { id: "type_note", name: "Note", icon: "FileText", color: "#eab308", isSystem: true },
  { id: "type_command", name: "Command", icon: "SquareTerminal", color: "#38bdf8", isSystem: true },
  { id: "type_file", name: "File", icon: "File", color: "#f43f5e", isSystem: true },
  { id: "type_image", name: "Image", icon: "Image", color: "#c084fc", isSystem: true },
  { id: "type_url", name: "URL", icon: "Link", color: "#2dd4bf", isSystem: true },
];

export const collections: Collection[] = [
  {
    id: "col_react",
    name: "React Patterns",
    description: "Reusable hooks, utilities, and component patterns.",
    isFavorite: true,
  },
  {
    id: "col_ai",
    name: "AI Prompts",
    description: "System prompts and prompt-engineering recipes.",
    isFavorite: false,
  },
  {
    id: "col_shell",
    name: "Shell & DevOps",
    description: "Commands and scripts for local dev and deployment.",
    isFavorite: false,
  },
  {
    id: "col_context",
    name: "Context Files",
    description: "Architecture notes and configs to feed to AI tools.",
    isFavorite: false,
  },
  {
    id: "col_python",
    name: "Python Snippets",
    description: "Handy Python helpers and decorators.",
    isFavorite: false,
  },
  {
    id: "col_design",
    name: "Design References",
    description: "Colors, gradients, and visual inspiration.",
    isFavorite: false,
  },
];

export const items: Item[] = [
  {
    id: "item_1",
    title: "useDebounce hook",
    description: "Debounce any fast-changing value with a configurable delay.",
    contentType: "text",
    content: `import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}`,
    fileName: null,
    fileSize: null,
    url: null,
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    typeId: "type_snippet",
    collectionId: "col_react",
    tags: ["react", "hooks", "performance"],
    updatedAt: "2026-07-01T14:00:00.000Z",
  },
  {
    id: "item_2",
    title: "Senior code reviewer",
    description: "System prompt that reviews diffs like a staff engineer.",
    contentType: "text",
    content: `You are a staff-level engineer reviewing a pull request.
Focus on correctness, edge cases, performance and readability.
Point out risky changes, missing tests, and unclear naming.
Be concise and reference specific lines. Suggest concrete fixes.`,
    fileName: null,
    fileSize: null,
    url: null,
    language: null,
    isFavorite: true,
    isPinned: true,
    typeId: "type_prompt",
    collectionId: "col_ai",
    tags: ["review", "system", "gpt"],
    updatedAt: "2026-07-01T11:00:00.000Z",
  },
  {
    id: "item_3",
    title: "Reset local Postgres",
    description: "Drop and recreate the local dev database in one go.",
    contentType: "text",
    content: `dropdb devstash_dev --if-exists \\
  && createdb devstash_dev \\
  && pnpm prisma migrate deploy \\
  && pnpm prisma db seed`,
    fileName: null,
    fileSize: null,
    url: null,
    language: "bash",
    isFavorite: false,
    isPinned: false,
    typeId: "type_command",
    collectionId: "col_shell",
    tags: ["postgres", "db", "reset"],
    updatedAt: "2026-06-30T16:00:00.000Z",
  },
  {
    id: "item_4",
    title: "Auth flow context",
    description: "Notes on how NextAuth sessions map to Stripe plan status.",
    contentType: "text",
    content: `# Auth → Billing sync

- NextAuth session carries \`userId\` + \`isPro\`.
- Stripe webhook updates \`isPro\` on \`checkout.session.completed\`.
- On sign-in, re-read the user so a stale JWT never gates Pro features.`,
    fileName: null,
    fileSize: null,
    url: null,
    language: "markdown",
    isFavorite: false,
    isPinned: false,
    typeId: "type_note",
    collectionId: "col_context",
    tags: ["auth", "billing", "architecture"],
    updatedAt: "2026-06-30T09:00:00.000Z",
  },
  {
    id: "item_5",
    title: "Python retry decorator",
    description: "Exponential backoff decorator for flaky network calls.",
    contentType: "text",
    content: `import time, functools

def retry(times=3, delay=0.5):
    def wrap(fn):
        @functools.wraps(fn)
        def inner(*args, **kwargs):
            for attempt in range(times):
                try:
                    return fn(*args, **kwargs)
                except Exception:
                    if attempt == times - 1:
                        raise
                    time.sleep(delay * 2 ** attempt)
        return inner
    return wrap`,
    fileName: null,
    fileSize: null,
    url: null,
    language: "python",
    isFavorite: true,
    isPinned: false,
    typeId: "type_snippet",
    collectionId: "col_python",
    tags: ["python", "retry", "network"],
    updatedAt: "2026-06-29T12:00:00.000Z",
  },
  {
    id: "item_6",
    title: "Raycast blurple",
    description: "Reference gradient exported from the Raycast landing page.",
    contentType: "file",
    content: null,
    fileName: "gradient-reference.png",
    fileSize: "1.2 MB",
    url: null,
    language: null,
    isFavorite: false,
    isPinned: false,
    typeId: "type_image",
    collectionId: "col_design",
    tags: ["gradient", "inspiration"],
    updatedAt: "2026-06-28T12:00:00.000Z",
  },
  {
    id: "item_7",
    title: "Tailwind v4 docs",
    description: "The @theme directive reference — bookmarked for tokens.",
    contentType: "text",
    content: null,
    fileName: null,
    fileSize: null,
    url: "https://tailwindcss.com/docs/theme",
    language: null,
    isFavorite: false,
    isPinned: false,
    typeId: "type_url",
    collectionId: "col_react",
    tags: ["tailwind", "css", "docs"],
    updatedAt: "2026-06-27T12:00:00.000Z",
  },
  {
    id: "item_8",
    title: "Prompt optimizer",
    description: "Rewrites a rough prompt into a crisp, structured one.",
    contentType: "text",
    content: `Rewrite the user's prompt to be clear and unambiguous.
Preserve intent. Add explicit constraints, output format, and role.
Return only the improved prompt.`,
    fileName: null,
    fileSize: null,
    url: null,
    language: null,
    isFavorite: false,
    isPinned: false,
    typeId: "type_prompt",
    collectionId: "col_ai",
    tags: ["prompt", "meta", "gpt"],
    updatedAt: "2026-06-26T12:00:00.000Z",
  },
  {
    id: "item_9",
    title: "Dockerfile — Next.js standalone",
    description: "Multi-stage build for a slim production Next.js image.",
    contentType: "file",
    content: null,
    fileName: "Dockerfile",
    fileSize: "1.4 KB",
    url: null,
    language: null,
    isFavorite: false,
    isPinned: false,
    typeId: "type_file",
    collectionId: "col_context",
    tags: ["docker", "nextjs", "deploy"],
    updatedAt: "2026-06-25T12:00:00.000Z",
  },
  {
    id: "item_10",
    title: "cn() utility",
    description: "Merge Tailwind classes with clsx + tailwind-merge.",
    contentType: "text",
    content: `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
    fileName: null,
    fileSize: null,
    url: null,
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    typeId: "type_snippet",
    collectionId: "col_react",
    tags: ["tailwind", "utils", "classnames"],
    updatedAt: "2026-06-24T12:00:00.000Z",
  },
  {
    id: "item_11",
    title: "Kill port 3000",
    description: "Free up the dev port when a process is stuck.",
    contentType: "text",
    content: "lsof -ti:3000 | xargs kill -9",
    fileName: null,
    fileSize: null,
    url: null,
    language: "bash",
    isFavorite: false,
    isPinned: false,
    typeId: "type_command",
    collectionId: "col_shell",
    tags: ["port", "process", "macos"],
    updatedAt: "2026-06-22T12:00:00.000Z",
  },
  {
    id: "item_12",
    title: "Neon connection string",
    description: "Pooled Postgres URL for serverless environments.",
    contentType: "text",
    content: null,
    fileName: null,
    fileSize: null,
    url: "https://neon.tech/docs/connect/connection-pooling",
    language: null,
    isFavorite: false,
    isPinned: false,
    typeId: "type_url",
    collectionId: "col_context",
    tags: ["neon", "postgres", "serverless"],
    updatedAt: "2026-06-20T12:00:00.000Z",
  },
];