"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MailCheck, Loader2 } from "lucide-react";

import { requestResetSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const parsed = requestResetSchema.safeParse({
      email: formData.get("email"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok) {
        const message = data.error ?? "Something went wrong. Please try again.";
        setError(message);
        if (res.status === 429) toast.error(message);
        setPending(false);
        return;
      }

      // Generic success — the server never reveals whether the email exists.
      setSubmittedEmail(parsed.data.email);
      setPending(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  if (submittedEmail) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <MailCheck className="size-6 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Check your email</p>
          <p className="text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{submittedEmail}</span>
            , we&apos;ve sent a link to reset your password. The link expires in
            1 hour.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          <Link
            href="/sign-in"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        Send reset link
      </Button>
    </form>
  );
}
