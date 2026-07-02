/**
 * Database seed — sample data for development and demos.
 *
 * Run with: `pnpm db:seed` (inside `nix develop` on NixOS).
 *
 * Wipes the app tables and inserts a fresh, deterministic dataset: one demo
 * user, the seven system item types, and five collections with their items.
 * Re-running produces the same end state (idempotent by full replacement).
 */
import "dotenv/config";

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import ws from "ws";

import { PrismaClient } from "../src/generated/prisma/client";

// Neon's serverless driver needs a WebSocket implementation on Node.
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — add it to .env");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const SYSTEM_ITEM_TYPES = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
];

const COLLECTIONS = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    isFavorite: true,
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    isFavorite: false,
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    isFavorite: false,
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    isFavorite: false,
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    isFavorite: false,
  },
];

interface SeedItem {
  title: string;
  description: string;
  /** system item type name */
  type: string;
  /** collection name */
  collection: string;
  content?: string;
  url?: string;
  language?: string;
  tags: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
}

const ITEMS: SeedItem[] = [
  // React Patterns — 3 TypeScript snippets
  {
    title: "useDebounce hook",
    description: "Debounce a fast-changing value with a configurable delay.",
    type: "snippet",
    collection: "React Patterns",
    language: "typescript",
    tags: ["react", "hooks", "performance"],
    isFavorite: true,
    isPinned: true,
    content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
  },
  {
    title: "createSafeContext provider",
    description:
      "Typed context factory that throws when used outside its provider.",
    type: "snippet",
    collection: "React Patterns",
    language: "typescript",
    tags: ["react", "context", "typescript"],
    content: `import { createContext, useContext } from "react";

export function createSafeContext<T>(name: string) {
  const Context = createContext<T | null>(null);

  function useSafeContext() {
    const value = useContext(Context);
    if (value === null) {
      throw new Error(name + " must be used within its provider");
    }
    return value;
  }

  return [Context.Provider, useSafeContext] as const;
}`,
  },
  {
    title: "cn() class merger",
    description: "Merge Tailwind classes with clsx + tailwind-merge.",
    type: "snippet",
    collection: "React Patterns",
    language: "typescript",
    tags: ["tailwind", "utils"],
    content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
  },

  // AI Workflows — 3 prompts
  {
    title: "Senior code reviewer",
    description: "Reviews a diff like a staff engineer and suggests fixes.",
    type: "prompt",
    collection: "AI Workflows",
    tags: ["review", "quality"],
    isFavorite: true,
    content: `You are a staff-level engineer reviewing a pull request.
Focus on correctness, edge cases, performance, and readability.
Call out risky changes, missing tests, and unclear naming.
Reference specific lines and propose concrete fixes. Be concise.`,
  },
  {
    title: "Docs generator",
    description: "Turns a function or module into clear documentation.",
    type: "prompt",
    collection: "AI Workflows",
    tags: ["documentation"],
    content: `Given the following code, write documentation that includes:
a one-line summary, parameters and return values, at least one usage
example, and any caveats. Match the project's existing doc style.`,
  },
  {
    title: "Refactoring assistant",
    description: "Proposes safe, incremental refactors with rationale.",
    type: "prompt",
    collection: "AI Workflows",
    tags: ["refactor"],
    content: `Refactor the code below for clarity and maintainability without
changing behavior. Explain each change and why it helps. Preserve the
public API and keep the diff minimal. Flag anything that needs a test.`,
  },

  // DevOps — 1 snippet, 1 command, 2 links
  {
    title: "Next.js standalone Dockerfile",
    description: "Multi-stage build for a slim production Next.js image.",
    type: "snippet",
    collection: "DevOps",
    language: "dockerfile",
    tags: ["docker", "nextjs", "deploy"],
    content: `FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]`,
  },
  {
    title: "Deploy to production",
    description: "Build, run migrations, then start the server.",
    type: "command",
    collection: "DevOps",
    language: "bash",
    tags: ["deploy", "ci"],
    content: `pnpm build && pnpm prisma migrate deploy && pnpm start`,
  },
  {
    title: "Vercel deployment docs",
    description: "How deployments and build settings work on Vercel.",
    type: "link",
    collection: "DevOps",
    url: "https://vercel.com/docs/deployments/overview",
    tags: ["vercel", "docs"],
  },
  {
    title: "Docker build reference",
    description: "Official guide to building images with BuildKit.",
    type: "link",
    collection: "DevOps",
    url: "https://docs.docker.com/build/",
    tags: ["docker", "docs"],
  },

  // Terminal Commands — 4 commands
  {
    title: "Undo last commit (keep changes)",
    description: "Move HEAD back one commit but keep the working tree.",
    type: "command",
    collection: "Terminal Commands",
    language: "bash",
    tags: ["git"],
    content: `git reset --soft HEAD~1`,
  },
  {
    title: "Remove all Docker containers",
    description: "Force-stop and delete every container.",
    type: "command",
    collection: "Terminal Commands",
    language: "bash",
    tags: ["docker"],
    content: `docker rm -f $(docker ps -aq)`,
  },
  {
    title: "Kill process on port 3000",
    description: "Free the dev port when a process is stuck.",
    type: "command",
    collection: "Terminal Commands",
    language: "bash",
    tags: ["process", "ports"],
    content: `lsof -ti:3000 | xargs kill -9`,
  },
  {
    title: "Update all dependencies",
    description: "Upgrade every dependency to its latest version.",
    type: "command",
    collection: "Terminal Commands",
    language: "bash",
    tags: ["pnpm"],
    content: `pnpm up --latest`,
  },

  // Design Resources — 4 links
  {
    title: "Tailwind CSS docs",
    description: "Utility-first CSS framework reference.",
    type: "link",
    collection: "Design Resources",
    url: "https://tailwindcss.com/docs",
    tags: ["css", "tailwind"],
  },
  {
    title: "shadcn/ui",
    description: "Accessible component collection you copy into your app.",
    type: "link",
    collection: "Design Resources",
    url: "https://ui.shadcn.com",
    tags: ["components", "ui"],
  },
  {
    title: "Material Design 3",
    description: "Google's design system guidelines and tokens.",
    type: "link",
    collection: "Design Resources",
    url: "https://m3.material.io",
    tags: ["design-system"],
  },
  {
    title: "Lucide icons",
    description: "Open-source icon library used across the app.",
    type: "link",
    collection: "Design Resources",
    url: "https://lucide.dev/icons",
    tags: ["icons"],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Full replacement for a deterministic dataset (FK-safe order).
  await prisma.itemTag.deleteMany();
  await prisma.item.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.itemType.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.create({
    data: {
      email: "demo@devstash.io",
      name: "Demo User",
      password,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  const typeIds = new Map<string, string>();
  for (const type of SYSTEM_ITEM_TYPES) {
    const created = await prisma.itemType.create({
      data: { ...type, isSystem: true },
    });
    typeIds.set(type.name, created.id);
  }

  const collectionIds = new Map<string, string>();
  for (const collection of COLLECTIONS) {
    const created = await prisma.collection.create({
      data: { ...collection, userId: user.id },
    });
    collectionIds.set(collection.name, created.id);
  }

  for (const item of ITEMS) {
    const typeId = typeIds.get(item.type);
    const collectionId = collectionIds.get(item.collection);
    if (!typeId) throw new Error(`Unknown item type: ${item.type}`);
    if (!collectionId) {
      throw new Error(`Unknown collection: ${item.collection}`);
    }

    await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        contentType: "text",
        content: item.content ?? null,
        url: item.url ?? null,
        language: item.language ?? null,
        isFavorite: item.isFavorite ?? false,
        isPinned: item.isPinned ?? false,
        userId: user.id,
        typeId,
        collectionId,
        tags: {
          create: item.tags.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { userId_name: { userId: user.id, name } },
                create: { name, userId: user.id },
              },
            },
          })),
        },
      },
    });
  }

  console.log(
    `✅ Seeded ${SYSTEM_ITEM_TYPES.length} item types, ` +
      `${COLLECTIONS.length} collections, ${ITEMS.length} items for ${user.email}.`,
  );
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });