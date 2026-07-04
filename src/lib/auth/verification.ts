import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import { EMAIL_FROM, resend } from "@/lib/email/resend";
import { verificationEmail } from "@/lib/email/verification-email";

// How long a verification link stays valid.
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Absolute base URL for building verification links. Prefers an explicitly
 * configured app URL, then the request origin, then localhost for dev.
 */
export function getBaseUrl(requestUrl?: string) {
  const configured = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (requestUrl) return new URL(requestUrl).origin;
  return "http://localhost:3000";
}

/**
 * Create a fresh verification token for an email, replacing any existing one so
 * only the latest link works.
 */
async function createVerificationToken(email: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.emailVerificationToken.deleteMany({ where: { email } });
  await prisma.emailVerificationToken.create({
    data: { email, token, expires },
  });

  return token;
}

/**
 * Generate a token and email the verification link. Returns whether the send
 * succeeded; the caller decides how to surface a failure (the user can always
 * request a new link).
 */
export async function sendVerificationEmail({
  email,
  name,
  baseUrl,
}: {
  email: string;
  name?: string | null;
  baseUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const token = await createVerificationToken(email);
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
  const { subject, html, text } = verificationEmail({ name, verifyUrl });

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export type VerifyStatus =
  | "success"
  | "already-verified"
  | "expired"
  | "invalid";

export type VerifyResult = { status: VerifyStatus; email?: string };

/**
 * Validate a verification token and mark the user's email verified. Consumes
 * the token (and any siblings) on success or expiry so links are single-use.
 * Returns the associated email (when known) so callers can offer a resend.
 */
export async function verifyEmailToken(
  token: string | undefined,
): Promise<VerifyResult> {
  if (!token) return { status: "invalid" };

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });
  if (!record) return { status: "invalid" };

  if (record.expires < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { token } });
    return { status: "expired", email: record.email };
  }

  const user = await prisma.user.findUnique({ where: { email: record.email } });
  if (!user) {
    await prisma.emailVerificationToken.deleteMany({
      where: { email: record.email },
    });
    return { status: "invalid" };
  }

  if (user.emailVerified) {
    await prisma.emailVerificationToken.deleteMany({
      where: { email: record.email },
    });
    return { status: "already-verified", email: record.email };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });
  await prisma.emailVerificationToken.deleteMany({
    where: { email: record.email },
  });

  return { status: "success", email: record.email };
}

/**
 * Resend a verification link for an unverified account. Always resolves without
 * revealing whether the email exists or is already verified (anti-enumeration).
 */
export async function resendVerificationEmail(email: string, baseUrl: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || user.emailVerified) return;

  await sendVerificationEmail({ email, name: user.name, baseUrl });
}
