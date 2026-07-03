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

## Playwright MCP on NixOS

The Playwright MCP can't use its own downloaded browsers on NixOS (generic prebuilt binaries won't run, and its `channel: chrome` default looks for `/opt/google/chrome`). Instead `flake.nix` pins `pkgs.chromium` and exports `PLAYWRIGHT_CHROMIUM_BIN`, which `.mcp.json` passes to the server via `--executable-path`.

Because `.mcp.json` expands `${PLAYWRIGHT_CHROMIUM_BIN}` from the environment, **the editor/CLI must be launched from inside `nix develop`** — otherwise the variable is empty and the browser fails to start. Using the VS Code extension, launch VS Code itself from the dev shell:

```
nix develop            # then, from that same shell:
code .                 # (or `codium .`) — inherits PLAYWRIGHT_CHROMIUM_BIN
```

Reconnect the Playwright MCP server once after launching so it picks up the resolved path. **Always start VS Code this way before using the Playwright MCP.**

## Neon MCP — default target

When using the Neon MCP for this project, ALWAYS default to:

- **Project:** DevStash — `delicate-shadow-52219909`
- **Branch:** Development — `br-mute-frost-acupp6if`

Rules:
- Pass `branchId: "br-mute-frost-acupp6if"` on every Neon query/tool call unless
  I explicitly name a different branch.
- NEVER run any query — read or write — against the **production** branch
  (`br-bold-snow-acimgndx`) unless I explicitly say "production" in that request.
- Approval to use production applies only to the single request where I say so;
  it does not carry over to later calls.
- Never run destructive SQL (DROP, DELETE, TRUNCATE, UPDATE/INSERT without my
  go-ahead), even on Development. Ask first.
