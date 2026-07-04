import Link from "next/link";
import { CheckCircle2, XCircle, MailWarning } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { ResendVerification } from "@/components/auth/ResendVerification";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { verifyEmailToken } from "@/lib/auth/verification";

// Consumes the token and writes emailVerified — must run per request.
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const { status, email } = await verifyEmailToken(token);

  const signInLink = (
    <Link
      href="/sign-in"
      className="font-medium text-foreground underline-offset-4 hover:underline"
    >
      Go to sign in
    </Link>
  );

  if (status === "success" || status === "already-verified") {
    return (
      <AuthCard
        title="Email verified"
        subtitle="Your account is ready to go"
        footer={signInLink}
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-500/10 p-3">
              <CheckCircle2 className="size-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {status === "already-verified"
              ? "This email was already verified. You can sign in anytime."
              : "Thanks for confirming your email. You can now sign in to DevStash."}
          </p>
          <Link href="/sign-in" className={cn(buttonVariants(), "w-full")}>
            Continue to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (status === "expired") {
    return (
      <AuthCard
        title="Link expired"
        subtitle="Verification links are valid for 24 hours"
        footer={signInLink}
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-500/10 p-3">
              <MailWarning className="size-6 text-amber-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This verification link has expired. Request a new one below.
          </p>
          {email && <ResendVerification email={email} className="w-full" />}
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Invalid link"
      subtitle="We couldn't verify this link"
      footer={signInLink}
    >
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <XCircle className="size-6 text-destructive" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          This verification link is invalid or has already been used. Try
          signing in — if your email still needs verifying, you can request a
          new link there.
        </p>
        <Link
          href="/sign-in"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Go to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
