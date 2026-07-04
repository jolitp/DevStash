import Link from "next/link";
import { XCircle, MailWarning } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { checkResetToken } from "@/lib/auth/password-reset";

// Reads live token state per request; must not be cached.
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const status = await checkResetToken(token);

  const signInLink = (
    <Link
      href="/sign-in"
      className="font-medium text-foreground underline-offset-4 hover:underline"
    >
      Back to sign in
    </Link>
  );

  if (status === "valid" && token) {
    return (
      <AuthCard
        title="Choose a new password"
        subtitle="Enter a new password for your account"
        footer={signInLink}
      >
        <ResetPasswordForm token={token} />
      </AuthCard>
    );
  }

  if (status === "expired") {
    return (
      <AuthCard
        title="Link expired"
        subtitle="Reset links are valid for 1 hour"
        footer={signInLink}
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-500/10 p-3">
              <MailWarning className="size-6 text-amber-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This password-reset link has expired. Request a new one below.
          </p>
          <Link
            href="/forgot-password"
            className={cn(buttonVariants(), "w-full")}
          >
            Request a new link
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Invalid link"
      subtitle="We couldn't use this reset link"
      footer={signInLink}
    >
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <XCircle className="size-6 text-destructive" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          This password-reset link is invalid or has already been used. Request
          a new one to continue.
        </p>
        <Link
          href="/forgot-password"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Request a new link
        </Link>
      </div>
    </AuthCard>
  );
}
