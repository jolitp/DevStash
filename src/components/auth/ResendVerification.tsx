"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Resend-verification-email button. The email is known from the surrounding
 * flow (just-registered account or a failed unverified sign-in). The server
 * responds generically, so the toast is generic too.
 */
export function ResendVerification({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleResend() {
    setPending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Verification email sent", {
          description: data.data?.message ?? "Check your inbox.",
        });
      } else {
        toast.error(data.error ?? "Could not resend the email.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      disabled={pending}
      onClick={handleResend}
    >
      {pending && <Loader2 className="animate-spin" />}
      Resend verification email
    </Button>
  );
}
