import { NextResponse } from "next/server";
import { z } from "zod";

import { getBaseUrl, resendVerificationEmail } from "@/lib/auth/verification";
import {
  checkRateLimit,
  getClientIp,
  tooManyRequestsResponse,
} from "@/lib/rate-limit";

const resendSchema = z.object({ email: z.email() });

// POST /api/auth/resend-verification — re-send a verification link.
// Always responds 200 with a generic message: it never reveals whether the
// email exists or is already verified (prevents account enumeration).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = resendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Enter a valid email address" },
      { status: 400 },
    );
  }

  // Throttle per IP + email so a single address can't be email-bombed.
  const { success, reset } = await checkRateLimit(
    "resendVerification",
    `${getClientIp(request)}:${parsed.data.email}`,
  );
  if (!success) return tooManyRequestsResponse(reset);

  try {
    await resendVerificationEmail(parsed.data.email, getBaseUrl(request.url));
  } catch (error) {
    console.error("Resend verification failed:", error);
    // Still return success to avoid leaking anything to the caller.
  }

  return NextResponse.json({
    success: true,
    data: {
      message:
        "If that email needs verification, we've sent a new link. Check your inbox.",
    },
  });
}
