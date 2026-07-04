import { NextResponse } from "next/server";

import { resetPassword } from "@/lib/auth/password-reset";
import { resetPasswordSchema } from "@/lib/validations/auth";

// POST /api/auth/reset-password — set a new password using a valid reset token.
// Body: { token, password, confirmPassword }
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

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const token =
    body && typeof body === "object" && "token" in body
      ? (body as { token?: unknown }).token
      : undefined;

  try {
    const result = await resetPassword(
      typeof token === "string" ? token : undefined,
      parsed.data.password,
    );

    if (result.status !== "success") {
      const error =
        result.status === "expired"
          ? "This reset link has expired. Request a new one."
          : "This reset link is invalid or has already been used.";
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { message: "Your password has been reset. You can now sign in." },
    });
  } catch (error) {
    console.error("Password reset failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
