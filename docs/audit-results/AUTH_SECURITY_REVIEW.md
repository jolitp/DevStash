# Auth Security Review

**Last audited:** 2026-07-04
**Auditor:** auth-auditor (run inline — custom agent not yet registered)
**Scope:** Password handling · Token security (email verification + password reset) · Rate limiting · Profile/account mutations
**Out of scope (NextAuth-handled):** CSRF, cookie flags, OAuth state/PKCE, JWT signing, session rotation

## Summary
- Critical: 0
- High: 1
- Medium: 1
- Low: 2

## Findings

### [High] No rate limiting on any custom auth route
- **File:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/resend-verification/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/change-password/route.ts` (and the Credentials sign-in via NextAuth)
- **Area:** Rate limiting
- **Issue:** None of the custom auth endpoints throttle requests. There is no rate-limit layer anywhere in the stack (no Upstash/middleware limiter). Confirmed by reading each route: they go straight from Zod parse → DB/bcrypt/email work with no per-IP or per-account counter.
- **Impact:** (1) Online brute force of passwords against sign-in and reset-token guessing against `reset-password`; (2) email bombing — `forgot-password` and `resend-verification` will send a Resend email on every request for a known address; (3) enumeration amplification and general resource abuse (each register/reset call runs a bcrypt hash). Tokens are 256-bit so guessing is infeasible, but password brute force and mail flooding are the real exposure.
- **Fix:** Add a shared rate-limit utility (e.g. `@upstash/ratelimit` + Upstash Redis, or an in-memory limiter for single-instance dev) and apply it at the top of each route keyed by IP (and by email where available). Suggested budgets: sign-in/reset-password ~5/min/IP, forgot-password/resend-verification ~3/hour/email + per-IP cap, register ~5/hour/IP. Return `429` with the existing `{ success, error }` shape.

### [Medium] Registration reveals whether an email is already in use (account enumeration)
- **File:** `src/app/api/auth/register/route.ts:33-39`
- **Area:** Password handling / enumeration
- **Issue:** On a duplicate email the route returns `409` with `"An account with this email already exists"`. This is a direct enumeration oracle — the rest of the auth surface (`forgot-password`, `resend-verification`) is deliberately generic, so this endpoint is the odd one out and undermines that effort.
- **Impact:** An attacker can confirm which emails have DevStash accounts by attempting registration, then target them for password brute force or phishing. Amplified by the missing rate limit above.
- **Fix:** Return a generic success-style response regardless of whether the email exists, and email the existing user a "you already have an account / reset your password" notice instead of signalling the collision to the caller. If a distinct in-UI message is required for UX, gate it behind rate limiting to raise the cost of enumeration. (Note: this is an inherent tension with a good signup UX; documenting the accepted trade-off is also a valid resolution.)

### [Low] User-enumeration timing side-channel in the Credentials `authorize()`
- **File:** `src/auth.ts:29-33`
- **Area:** Password handling
- **Issue:** `authorize()` returns `null` immediately when the user doesn't exist or has no password (`if (!user?.password) return null`), and only runs `bcrypt.compare` when a hashed password is present. A non-existent account therefore responds measurably faster than an existing one, since the ~cost-12 bcrypt work is skipped.
- **Impact:** Response-timing analysis can distinguish "email exists" from "email unknown" — the same enumeration signal as the register 409, via a different channel. Defense-in-depth; over real network jitter the signal is noisy.
- **Fix:** Perform a dummy `bcrypt.compare` against a constant dummy hash when the user/password is absent so both paths do equivalent work before returning `null`. Keep the generic `null` return unchanged.

### [Low] Verification and reset tokens are stored un-hashed at rest
- **File:** `src/lib/auth/verification.ts:27-33`, `src/lib/auth/password-reset.ts:21-31`
- **Area:** Token security
- **Issue:** Both flows persist the raw `randomBytes(32)` hex token directly in the DB (`EmailVerificationToken.token` / `VerificationToken.token`). Anyone with read access to those rows (DB dump, backup, log of a query, SQL injection elsewhere) obtains a live, usable token until it expires or is consumed.
- **Impact:** Low — requires DB read access, and TTLs are short (24h verify / 1h reset). But un-hashed secrets at rest are avoidable.
- **Fix:** Store `sha256(token)` and look up by the hash; keep the raw token only in the emailed URL. This is a defense-in-depth hardening, not an active exploit.

## Passed Checks
- Passwords hashed with **bcrypt cost 12 consistently** across every write path — register (`register/route.ts:42`), reset (`password-reset.ts:113`), and change (`change-password.ts:31`) — matching the seed.
- Password verification uses `bcrypt.compare` (constant-time), never `===` on hashes — `auth.ts:32`, `change-password.ts:28`.
- The password hash is **never returned to the client**: register uses `select: { id, name, email }` (`register/route.ts:52`); `getProfileAccount` selects `password` only to derive a `hasPassword` boolean and never returns the hash (`profile.ts:49-67`).
- Minimum password length (8) enforced by Zod at **every** entry point — sign-in, register, reset, and change all reuse the shared `password` schema (`validations/auth.ts:5-7`, used in `signInSchema`/`registerSchema`/`resetPasswordSchema`/`changePasswordSchema`).
- Credentials sign-in returns a **generic** result (`return null`) for unknown user, OAuth-only account, and wrong password alike — `auth.ts:30-33`.
- Verification and reset tokens use **`crypto.randomBytes(32)` (256-bit)** — `verification.ts:27`, `password-reset.ts:22`. No `Math.random`/`Date.now()`/incremental IDs used for token material (grep-confirmed).
- Token **expiry is enforced on use**, not just stored: verify rejects+consumes expired tokens (`verification.ts:95-98`), reset rejects+consumes expired tokens (`password-reset.ts:94-99`), and the non-destructive `checkResetToken` also checks expiry (`password-reset.ts:73`).
- Tokens are **single-use**: consumed via `deleteMany` on success (`verification.ts:119-121`, `password-reset.ts:124-126`), and prior tokens are invalidated when a new one is issued — one active token per email (`verification.ts:30`, `password-reset.ts:25`).
- **Anti-enumeration** on `forgot-password` and `resend-verification`: both always return a generic 200, and the underlying helpers silently no-op for unknown emails and OAuth-only accounts (`password-reset.ts:39-41`, `verification.ts:130-136`).
- `change-password` **re-verifies the current password** with `bcrypt.compare` before writing the new hash — `change-password.ts:28-29`.
- Account mutations scope to **`session.user.id` from the server session**, never a client-supplied id — `change-password/route.ts:37`, `delete-account/route.ts:18`. No IDOR: neither endpoint reads a user id from the body/query.
- No **mass assignment**: `reset-password` extracts `token` separately and only writes the validated `password`; `change-password` writes only the rehashed password; `register` writes only whitelisted `name`/`email`/`password`/`emailVerified`. No `data: { ...body }` into Prisma anywhere.
- Protected surfaces validate the session server-side: `proxy.ts` redirects unauthenticated `/dashboard*` and `/profile*` to `/sign-in`, and `profile/page.tsx:22-27` independently re-checks `auth()` and the user row, redirecting if either is missing.
- `delete-account` deletes in FK-safe order inside a `$transaction`, every step scoped to the one `userId`; system (owner-less) item types are untouched — `delete-account.ts:16-26`.
- No secrets logged: all `console.error` calls log the caught error object only (send failures / DB errors), never a token or password (grep-confirmed across `src/lib/auth`, `src/lib/email`, `src/app/api/auth`).
- Email verification gate is correctly wired: `authorize()` only throws `EmailNotVerifiedError` when `isEmailVerificationEnabled()` is true (`auth.ts:37`), and register marks the account verified up-front when the flag is off (`register/route.ts:50`) — no bypass in either mode.

## Notes / Confirmations
- **bcrypt cost 12** exceeds the current OWASP minimum (bcrypt work factor ≥ 10); no change needed there.
- **No rate-limit layer exists in the stack yet.** The High finding is the one control worth adding before this ships publicly; recommend Upstash Ratelimit (works on Vercel/edge) or a lightweight in-memory limiter for single-instance deployments.
- Confirmed *not* flagged (correctly handled by NextAuth or a documented project decision): CSRF on the sign-in POST, session cookie flags, GitHub OAuth `state`/PKCE, JWT signing, and `allowDangerousEmailAccountLinking` (documented as safe because GitHub returns only verified primary emails — `auth.config.ts:11-14`).
- `EMAIL_VERIFICATION_ENABLED` disabling the verification gate is by design (Resend has no verified domain yet); the default is secure (enabled) — `email-verification.ts:12-16`.
- The Medium (register enumeration) and Low (timing) findings are two channels of the same underlying issue: account existence is discoverable. Adding rate limiting mitigates the practical exploitability of both even if the messages/timing stay as-is.
