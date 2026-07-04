import { randomBytes } from "crypto";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { EMAIL_FROM, resend } from "@/lib/email/resend";
import { passwordResetEmail } from "@/lib/email/reset-password-email";

// Reset links are short-lived — shorter than verification links, since a
// password reset is a more sensitive action.
const TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

// Reuses NextAuth's VerificationToken table (identifier + token + expires).
// We don't use the Email magic-link provider, so this table is free for our
// own reset tokens. `identifier` holds the email.

/**
 * Create a fresh reset token for an email, replacing any existing one so only
 * the latest link works.
 */
async function createResetToken(email: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  return token;
}

/**
 * Send a password-reset link. Always resolves without revealing whether the
 * email exists or is resettable (anti-enumeration): unknown emails and
 * OAuth-only accounts (no password) silently no-op.
 */
export async function sendPasswordResetEmail(email: string, baseUrl: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return;

  const token = await createResetToken(email);
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const { subject, html, text } = passwordResetEmail({ name: user.name, resetUrl });

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("Failed to send password-reset email:", error);
  }
}

export type ResetTokenStatus = "valid" | "expired" | "invalid";

/**
 * Non-destructive check of a reset token, used by the reset page to decide
 * whether to render the form or an error state. The token is only consumed on a
 * successful reset (see resetPassword).
 */
export async function checkResetToken(
  token: string | undefined,
): Promise<ResetTokenStatus> {
  if (!token) return "invalid";

  const record = await prisma.verificationToken.findFirst({ where: { token } });
  if (!record) return "invalid";
  if (record.expires < new Date()) return "expired";

  return "valid";
}

export type ResetResult = { status: "success" | "expired" | "invalid" };

/**
 * Validate the token and set the user's new (hashed) password. Consumes the
 * token (and any siblings for that email) on success or expiry so links are
 * single-use.
 */
export async function resetPassword(
  token: string | undefined,
  newPassword: string,
): Promise<ResetResult> {
  if (!token) return { status: "invalid" };

  const record = await prisma.verificationToken.findFirst({ where: { token } });
  if (!record) return { status: "invalid" };

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier },
    });
    return { status: "expired" };
  }

  const user = await prisma.user.findUnique({
    where: { email: record.identifier },
  });
  // No user, or an OAuth-only account with no password to reset — consume the
  // token and treat as invalid.
  if (!user || !user.password) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier },
    });
    return { status: "invalid" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    // Owning the reset link proves control of the inbox, so also mark the email
    // verified if it wasn't already — otherwise the user could reset yet still
    // be blocked at sign-in.
    data: {
      password: hashedPassword,
      emailVerified: user.emailVerified ?? new Date(),
    },
  });
  await prisma.verificationToken.deleteMany({
    where: { identifier: record.identifier },
  });

  return { status: "success" };
}
