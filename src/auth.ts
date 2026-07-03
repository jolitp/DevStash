import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";

// Full (Node-runtime) auth instance: edge-safe config from auth.config.ts plus
// the Prisma adapter. JWT strategy is required by the split-config pattern so
// the edge proxy can read the session from the cookie without a DB round-trip.
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
