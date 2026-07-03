import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

// Edge-compatible slice of the auth configuration: providers + callbacks only,
// no Prisma adapter (Prisma can't run in the edge/proxy runtime). This object
// is spread into the full config in `auth.ts` and used on its own to build the
// edge-safe instance in `proxy.ts`.
//
// GitHub auto-reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET from the environment.
export default {
  providers: [GitHub],
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
