/**
 * Quick database connectivity check.
 *
 * Run with: `pnpm db:test`
 *
 * Loads DATABASE_URL from `.env` via dotenv, connects through the Neon
 * serverless driver adapter (same setup as src/lib/prisma.ts), and prints row
 * counts for the core tables so you can confirm the schema is reachable.
 */
import "dotenv/config";

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

import { PrismaClient } from "../src/generated/prisma/client";

// Neon's serverless driver needs a WebSocket implementation when running on Node.
neonConfig.webSocketConstructor = ws;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — add it to .env");
  }

  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const [users, itemTypes, items, collections, tags] = await Promise.all([
      prisma.user.count(),
      prisma.itemType.count(),
      prisma.item.count(),
      prisma.collection.count(),
      prisma.tag.count(),
    ]);

    console.log("✅ Connected to the database. Row counts:");
    console.table({ users, itemTypes, items, collections, tags });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Database test failed:");
  console.error(error);
  process.exit(1);
});