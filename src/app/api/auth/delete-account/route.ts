import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { deleteAccount } from "@/lib/auth/delete-account";

// POST /api/auth/delete-account — permanently delete the signed-in user's
// account and all of their content. The client signs the user out afterwards.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "You must be signed in" },
      { status: 401 },
    );
  }

  try {
    await deleteAccount(session.user.id);
    return NextResponse.json({
      success: true,
      data: { message: "Your account has been deleted." },
    });
  } catch (error) {
    console.error("Delete account failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
