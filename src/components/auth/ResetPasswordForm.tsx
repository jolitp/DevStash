"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

import { resetPasswordSchema } from "@/lib/validations/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...parsed.data }),
      });
      const data = await res.json();

      if (!res.ok) {
        const message = data.error ?? "Something went wrong. Please try again.";
        setError(message);
        if (res.status === 429) toast.error(message);
        setPending(false);
        return;
      }

      toast.success("Password reset", {
        description: "You can now sign in with your new password.",
      });
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-500/10 p-3">
            <CheckCircle2 className="size-6 text-emerald-500" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Your password has been reset. Sign in with your new password to
          continue.
        </p>
        <Link href="/sign-in" className={cn(buttonVariants(), "w-full")}>
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          New password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm new password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
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
        Reset password
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
