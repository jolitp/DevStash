import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

// Edge-compatible slice of the auth configuration: providers + callbacks only,
// no Prisma adapter (Prisma can't run in the edge/proxy runtime). This object
// is spread into the full config in `auth.ts` and used on its own to build the
// edge-safe instance in `proxy.ts`.
//
// GitHub auto-reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET from the environment.
//
// The Credentials provider here is an edge-safe placeholder: its authorize()
// always returns null so no bcrypt/Prisma code is pulled into the edge runtime.
// `auth.ts` replaces it with the real password-checking implementation.
export default {
  // Custom auth UI replaces NextAuth's built-in pages.
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GitHub,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: () => null,
    }),
  ],
  callbacks: {
    // Persist the user id onto the JWT at sign-in so it survives without DB reads.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Expose the id on the session (available via auth() and in the proxy).
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
