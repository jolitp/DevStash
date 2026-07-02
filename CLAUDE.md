# Devstash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links, and custom types.

## Context files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Read the docs before writing code

This project uses Next.js **16.2.9** and React **19.2.4** — both newer than most training data. Public APIs, defaults, and file conventions may differ from what you remember. Before writing Next.js code, consult `node_modules/next/dist/docs/` for the guide relevant to what you're touching (routing, caching, data fetching, config, etc.).

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`, `pnpm-workspace.yaml`).

- `pnpm dev` — dev server on http://localhost:3000
- `pnpm build` — production build
- `pnpm start` — serve the production build
- `pnpm lint` — ESLint (flat config, `eslint-config-next` presets)
- `pnpm db:migrate` — create/apply a Prisma migration (dev). Also `db:generate`, `db:deploy`, `db:studio`.

No test framework is configured.

## Database / Prisma on NixOS

This is a **NixOS** machine and Prisma has no `linux-nixos` engine binary to download, so any Prisma CLI command (`generate`, `migrate`, `validate`, `studio`) must run inside the dev shell that provides the engine:

```
nix develop            # sets PRISMA_SCHEMA_ENGINE_BINARY from flake.nix, then run pnpm db:*
```

Prisma 7 runs queries through the Neon driver adapter (no native query engine), so only the `schema-engine` is needed — see `flake.nix`.
