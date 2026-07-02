import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

import { PrismaClient } from "@/generated/prisma/client";

// Neon's serverless driver needs a WebSocket implementation when running on
// Node (local dev, migrations, non-edge serverless functions).
neonConfig.webSocketConstructor = ws;

const connectionString = `${process.env.DATABASE_URL}`;

// Reuse a single client across hot-reloads in development to avoid exhausting
// the connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}