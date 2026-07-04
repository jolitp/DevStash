/**
 * Single source of truth for whether email-address verification is required.
 *
 * Controlled by the `EMAIL_VERIFICATION_ENABLED` env var and **enabled by
 * default** (secure default): verification runs unless the var is explicitly set
 * to a falsy value (`false`/`0`/`off`/`no`). Turn it off — e.g. while Resend has
 * no verified domain — with `EMAIL_VERIFICATION_ENABLED=false`.
 *
 * When disabled: registration marks new accounts verified immediately (no email
 * sent) and the credentials sign-in gate no longer blocks unverified users.
 */
export function isEmailVerificationEnabled(): boolean {
  const raw = process.env.EMAIL_VERIFICATION_ENABLED?.trim().toLowerCase();
  if (!raw) return true; // unset/empty → enabled
  return !["false", "0", "off", "no"].includes(raw);
}
