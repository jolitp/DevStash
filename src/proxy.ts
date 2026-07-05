import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/auth.config";

// Edge-safe auth instance built from the adapter-free config. Using `auth` as a
// wrapper gives each request its session on `req.auth`.
const { auth } = NextAuth(authConfig);

// Routes that require an authenticated user.
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/items"];

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) =>
      nextUrl.pathname === prefix ||
      nextUrl.pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !isLoggedIn) {
    // Send unauthenticated users to the custom sign-in page, remembering where
    // they were headed.
    const signInUrl = new URL("/sign-in", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except Next internals, the auth API, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
