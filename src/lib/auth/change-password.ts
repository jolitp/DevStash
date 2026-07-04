import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export type ChangePasswordResult =
  | { status: "success" }
  | { status: "invalid-current" }
  | { status: "no-password" }
  | { status: "not-found" };

/**
 * Change a signed-in user's password after verifying their current one.
 *
 * - `not-found`      — user row missing.
 * - `no-password`    — OAuth-only account with no password to change.
 * - `invalid-current`— the supplied current password doesn't match.
 * Hashes with the same cost factor as register/seed/reset (12).
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { status: "not-found" };
  if (!user.password) return { status: "no-password" };

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) return { status: "invalid-current" };

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { status: "success" };
}
