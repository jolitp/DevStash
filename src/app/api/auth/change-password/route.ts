import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { changePassword } from "@/lib/auth/change-password";
import { changePasswordSchema } from "@/lib/validations/auth";

// POST /api/auth/change-password — change the signed-in user's password.
// Body: { currentPassword, newPassword, confirmPassword }
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "You must be signed in" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const result = await changePassword(
      session.user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );

    if (result.status === "invalid-current") {
      return NextResponse.json(
        { success: false, error: "Your current password is incorrect" },
        { status: 400 },
      );
    }
    if (result.status === "no-password") {
      return NextResponse.json(
        {
          success: false,
          error: "Your account uses social sign-in and has no password",
        },
        { status: 400 },
      );
    }
    if (result.status === "not-found") {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Your password has been updated." },
    });
  } catch (error) {
    console.error("Change password failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
