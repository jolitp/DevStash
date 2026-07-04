import { z } from "zod";

// Shared credential rules so sign-in and registration stay in lockstep.
const email = z.email("Enter a valid email address");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters");

// Used by the Credentials provider's authorize() in auth.ts.
export const signInSchema = z.object({
  email,
  password,
});

// Used by POST /api/auth/register.
export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// Used by POST /api/auth/forgot-password (request a reset link).
export const requestResetSchema = z.object({ email });

// Used by the reset page form + POST /api/auth/reset-password (the token is
// validated separately from the request body).
export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
