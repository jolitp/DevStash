import { NextResponse } from "next/server";

import { getBaseUrl } from "@/lib/auth/verification";
import { sendPasswordResetEmail } from "@/lib/auth/password-reset";
import { requestResetSchema } from "@/lib/validations/auth";

// POST /api/auth/forgot-password — request a password-reset link.
// Always responds 200 with a generic message: it never reveals whether the
// email exists or is resettable (prevents account enumeration).
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

  const parsed = requestResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Enter a valid email address" },
      { status: 400 },
    );
  }

  try {
    await sendPasswordResetEmail(parsed.data.email, getBaseUrl(request.url));
  } catch (error) {
    console.error("Forgot-password request failed:", error);
    // Still return success to avoid leaking anything to the caller.
  }

  return NextResponse.json({
    success: true,
    data: {
      message:
        "If an account exists for that email, we've sent a reset link. Check your inbox.",
    },
  });
}
