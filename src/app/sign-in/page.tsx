import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";

/**
 * Keep a post-login redirect target on our own origin so a crafted
 * `?callbackUrl=` can't bounce the user to an external site.
 */
function safeCallbackUrl(raw?: string) {
  if (!raw) return "/dashboard";
  // Protocol-relative ("//evil.com") is an off-site redirect in disguise.
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const url = new URL(raw);
    return `${url.pathname}${url.search}`;
  } catch {
    return "/dashboard";
  }
}

/** Friendly copy for the `?error=` codes NextAuth appends on a failed sign-in. */
function errorMessage(code?: string) {
  if (!code) return null;
  switch (code) {
    case "OAuthAccountNotLinked":
      return "This email is already registered. Sign in with your password instead.";
    case "AccessDenied":
      return "Access was denied. Please try again.";
    case "Configuration":
      return "Sign-in is misconfigured. Please try again later.";
    default:
      return "Something went wrong signing in. Please try again.";
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    registered?: string;
    error?: string;
  }>;
}) {
  if (await auth()) redirect("/dashboard");

  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const error = errorMessage(params.error);

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your DevStash account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {params.registered && !error && (
        <p className="mb-4 rounded-md border border-border bg-muted/50 px-3 py-2 text-center text-sm text-muted-foreground">
          Account created — sign in to continue.
        </p>
      )}
      <SignInForm callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
