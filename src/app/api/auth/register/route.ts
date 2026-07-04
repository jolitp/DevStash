import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getBaseUrl, sendVerificationEmail } from "@/lib/auth/verification";
import { registerSchema } from "@/lib/validations/auth";

// POST /api/auth/register — create an email/password account.
// Body: { name, email, password, confirmPassword }
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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true },
    });

    // Email a verification link. A failed send isn't fatal — the account exists
    // and the user can request a new link from the sign-in / verify pages.
    const { success: emailSent } = await sendVerificationEmail({
      email: user.email,
      name: user.name,
      baseUrl: getBaseUrl(request.url),
    });

    return NextResponse.json(
      { success: true, data: { ...user, emailSent } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
