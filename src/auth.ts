import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validations/auth";

// Real Credentials implementation (Node runtime only): validates the shape with
// Zod, looks the user up by email, and compares the password with bcrypt. Users
// created via OAuth have no password, so they can't sign in this way. Returns
// null on any failure to keep the error generic ("invalid credentials").
const credentialsProvider = Credentials({
  credentials: { email: {}, password: {} },
  authorize: async (credentials) => {
    const parsed = signInSchema.safeParse(credentials);
    if (!parsed.success) return null;

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password) return null;

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  },
});

// Full (Node-runtime) auth instance: edge-safe config from auth.config.ts plus
// the Prisma adapter. JWT strategy is required by the split-config pattern so
// the edge proxy can read the session from the cookie without a DB round-trip.
// The edge-safe Credentials placeholder is swapped for the real implementation
// above; every other provider (e.g. GitHub) is passed through untouched.
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: authConfig.providers.map((provider) =>
    typeof provider !== "function" && provider.id === "credentials"
      ? credentialsProvider
      : provider,
  ),
});
