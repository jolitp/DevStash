import { Resend } from "resend";

// Single Resend client for the app. Node runtime only (used from route handlers
// and the credentials flow) — never import this into the edge proxy.
export const resend = new Resend(process.env.RESEND_API_KEY);

// Sender for transactional email. Resend's shared `onboarding@resend.dev` works
// without domain verification but only delivers to your own account email in
// test mode — set EMAIL_FROM to a verified domain sender in production.
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "DevStash <onboarding@resend.dev>";
