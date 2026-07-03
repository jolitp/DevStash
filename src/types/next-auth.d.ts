import type { DefaultSession } from "next-auth";

// Add the user id to the session type so `session.user.id` is available
// throughout the app (populated by the session callback in auth.config.ts).
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
