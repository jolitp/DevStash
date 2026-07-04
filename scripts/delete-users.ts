/**
 * Delete all users and their content EXCEPT the demo user (demo@devstash.io).
 *
 * Dry run (prints what would be deleted, changes nothing):
 *   pnpm db:purge-users
 * Actually delete:
 *   pnpm db:purge-users -- --yes
 *
 * Targets whichever database DATABASE_URL points at (the Development branch
 * during local dev). This is destructive and irreversible — double-check the
 * host it prints before passing --yes.
 *
 * Deletes in FK-safe order inside a transaction. System item types (which have
 * no owner) are always kept; only custom item types owned by deleted users go.
 */
import "dotenv/config";

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

import { PrismaClient } from "../src/generated/prisma/client";

// Neon's serverless driver needs a WebSocket implementation when running on Node.
neonConfig.webSocketConstructor = ws;

const DEMO_EMAIL = "demo@devstash.io";

function dbHost(connectionString: string) {
  try {
    return new URL(connectionString).host;
  } catch {
    return "(unparseable DATABASE_URL)";
  }
}

async function main() {
  const execute = process.argv.slice(2).some((a) => a === "--yes" || a === "-y");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — add it to .env");
  }

  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log(`🎯 Database: ${dbHost(connectionString)}`);
    console.log(`🛟 Keeping:  ${DEMO_EMAIL} and all of their content\n`);

    const demo = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (!demo) {
      console.log(
        `⚠️  Demo user (${DEMO_EMAIL}) not found — aborting so nothing is deleted.\n` +
          `   Recreate the demo user first, then re-run this script.`,
      );
      return;
    }

    // Everything scoped to users other than the demo user.
    const otherUsers = { userId: { not: demo.id } };
    // Custom item types only (system types have userId = null and are kept).
    const customTypesToDelete = { userId: { not: null, notIn: [demo.id] } };

    const [users, items, collections, tags, customTypes, accounts, sessions] =
      await Promise.all([
        prisma.user.count({ where: { id: { not: demo.id } } }),
        prisma.item.count({ where: otherUsers }),
        prisma.collection.count({ where: otherUsers }),
        prisma.tag.count({ where: otherUsers }),
        prisma.itemType.count({ where: customTypesToDelete }),
        prisma.account.count({ where: otherUsers }),
        prisma.session.count({ where: otherUsers }),
      ]);

    console.log("🧮 Will delete:");
    console.log(`   users:            ${users}`);
    console.log(`   items:            ${items}`);
    console.log(`   collections:      ${collections}`);
    console.log(`   tags:             ${tags}`);
    console.log(`   custom itemTypes: ${customTypes}`);
    console.log(`   accounts:         ${accounts}`);
    console.log(`   sessions:         ${sessions}\n`);

    if (users === 0) {
      console.log("✨ Nothing to delete — only the demo user exists.");
      return;
    }

    if (!execute) {
      console.log("💡 Dry run — nothing was deleted. Re-run with --yes to apply.");
      return;
    }

    // FK-safe order; a transaction so it's all-or-nothing.
    const result = await prisma.$transaction([
      prisma.itemTag.deleteMany({ where: { item: otherUsers } }),
      prisma.item.deleteMany({ where: otherUsers }),
      prisma.tag.deleteMany({ where: otherUsers }),
      prisma.collection.deleteMany({ where: otherUsers }),
      prisma.itemType.deleteMany({ where: customTypesToDelete }),
      prisma.account.deleteMany({ where: otherUsers }),
      prisma.session.deleteMany({ where: otherUsers }),
      prisma.user.deleteMany({ where: { id: { not: demo.id } } }),
    ]);

    const [
      itemTagsDel,
      itemsDel,
      tagsDel,
      collectionsDel,
      typesDel,
      accountsDel,
      sessionsDel,
      usersDel,
    ] = result.map((r) => r.count);

    console.log("✅ Deleted:");
    console.log(`   users:            ${usersDel}`);
    console.log(`   items:            ${itemsDel}`);
    console.log(`   collections:      ${collectionsDel}`);
    console.log(`   tags:             ${tagsDel}`);
    console.log(`   custom itemTypes: ${typesDel}`);
    console.log(`   itemTags:         ${itemTagsDel}`);
    console.log(`   accounts:         ${accountsDel}`);
    console.log(`   sessions:         ${sessionsDel}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ delete-users failed:");
  console.error(error);
  process.exit(1);
});
