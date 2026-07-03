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

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  if (await auth()) redirect("/dashboard");

  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);

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
      {params.registered && (
        <p className="mb-4 rounded-md border border-border bg-muted/50 px-3 py-2 text-center text-sm text-muted-foreground">
          Account created — sign in to continue.
        </p>
      )}
      <SignInForm callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
