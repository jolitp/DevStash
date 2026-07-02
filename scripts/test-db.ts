/**
 * Quick database check.
 *
 * Run with: `pnpm db:test`
 *
 * Loads DATABASE_URL from `.env` via dotenv, connects through the Neon
 * serverless driver adapter (same setup as src/lib/prisma.ts), and prints the
 * seeded demo data so you can confirm the schema and seed are working.
 */
import "dotenv/config";

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

import { PrismaClient } from "../src/generated/prisma/client";

// Neon's serverless driver needs a WebSocket implementation when running on Node.
neonConfig.webSocketConstructor = ws;

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — add it to .env");
  }

  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
    });

    if (!user) {
      console.log(
        `⚠️  No demo user (${DEMO_EMAIL}) found. Run \`pnpm db:seed\` first.`,
      );
      return;
    }

    const itemTypes = await prisma.itemType.findMany({
      orderBy: { name: "asc" },
    });

    const collections = await prisma.collection.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      include: {
        items: {
          orderBy: { title: "asc" },
          include: {
            type: true,
            tags: { include: { tag: true } },
          },
        },
      },
    });

    console.log("✅ Connected to the database.\n");

    console.log("👤 User");
    console.log(`   ${user.name} <${user.email}>`);
    console.log(
      `   plan: ${user.isPro ? "Pro" : "Free"} · verified: ${
        user.emailVerified ? user.emailVerified.toISOString().slice(0, 10) : "no"
      }\n`,
    );

    console.log(`🏷️  System item types (${itemTypes.length})`);
    console.log(`   ${itemTypes.map((t) => t.name).join(", ")}\n`);

    const itemTotal = collections.reduce((n, c) => n + c.items.length, 0);
    console.log(
      `📚 Collections (${collections.length}) · items (${itemTotal})`,
    );
    for (const collection of collections) {
      const star = collection.isFavorite ? " ⭐" : "";
      console.log(
        `\n   ${collection.name} (${collection.items.length})${star} — ${collection.description ?? ""}`,
      );
      for (const item of collection.items) {
        const flags =
          (item.isPinned ? "📌" : "") + (item.isFavorite ? "⭐" : "");
        const tags = item.tags.map((t) => `#${t.tag.name}`).join(" ");
        const detail = item.url ?? item.language ?? "";
        console.log(
          `     • [${item.type.name}] ${item.title}${flags ? " " + flags : ""}` +
            `${detail ? `  (${detail})` : ""}` +
            `${tags ? `  ${tags}` : ""}`,
        );
      }
    }
    console.log("");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Database test failed:");
  console.error(error);
  process.exit(1);
});