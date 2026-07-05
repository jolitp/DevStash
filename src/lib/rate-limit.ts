import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Named limiters for the auth endpoints. Windows use @upstash/ratelimit's
// duration syntax ("15 m", "1 h"). The sliding-window algorithm smooths bursts
// across the boundary between windows.
const LIMITER_CONFIG = {
  login: { requests: 5, window: "15 m" }, // IP + email
  register: { requests: 3, window: "1 h" }, // IP
  forgotPassword: { requests: 3, window: "1 h" }, // IP
  resetPassword: { requests: 5, window: "15 m" }, // IP
  resendVerification: { requests: 3, window: "15 m" }, // IP + email
} as const;

export type RateLimiterName = keyof typeof LIMITER_CONFIG;

export interface RateLimitResult {
  success: boolean;
  /** Requests left in the window (Infinity when limiting is disabled). */
  remaining: number;
  /** Unix ms when the window resets (0 when limiting is disabled). */
  reset: number;
}

// Build a single Redis client from the REST env vars, or null when Upstash
// isn't configured (e.g. local dev without an Upstash project). A null client
// means rate limiting is skipped entirely — fail open.
function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

// One Ratelimit instance per named limiter, each with its own key prefix so the
// counters don't collide. `timeout` makes a slow Redis fail open: if the call
// isn't answered within 1s the request is allowed through.
const limiters: Record<RateLimiterName, Ratelimit> | null = redis
  ? (Object.keys(LIMITER_CONFIG) as RateLimiterName[]).reduce(
      (acc, name) => {
        const cfg = LIMITER_CONFIG[name];
        acc[name] = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(cfg.requests, cfg.window),
          prefix: `ratelimit:${name}`,
          analytics: false,
          timeout: 1000,
        });
        return acc;
      },
      {} as Record<RateLimiterName, Ratelimit>,
    )
  : null;

/**
 * Check a request against a named limiter. Fails open (returns success) when
 * Upstash is unconfigured or unreachable, so an outage never locks users out.
 */
export async function checkRateLimit(
  name: RateLimiterName,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = limiters?.[name];
  if (!limiter) {
    return { success: true, remaining: Number.POSITIVE_INFINITY, reset: 0 };
  }

  try {
    const { success, remaining, reset } = await limiter.limit(identifier);
    return { success, remaining, reset };
  } catch (error) {
    console.error(`Rate limit check failed for "${name}":`, error);
    return { success: true, remaining: Number.POSITIVE_INFINITY, reset: 0 };
  }
}

/**
 * Best-effort client IP. On Vercel the real client IP is the first entry of
 * `x-forwarded-for`; fall back to `x-real-ip`, then a constant for local dev.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

/**
 * Standard 429 response: a user-friendly message plus a `Retry-After` header
 * (seconds) derived from the limiter's reset timestamp.
 */
export function tooManyRequestsResponse(reset: number): NextResponse {
  const retryAfterSeconds = reset
    ? Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    : 60;
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));

  return NextResponse.json(
    {
      success: false,
      error: `Too many attempts. Please try again in ${minutes} minute${
        minutes === 1 ? "" : "s"
      }.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}
