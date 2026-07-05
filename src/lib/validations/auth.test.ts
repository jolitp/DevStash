import { describe, it, expect } from "vitest";
import {
  signInSchema,
  registerSchema,
  requestResetSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/lib/validations/auth";

describe("signInSchema", () => {
  it("accepts a valid email + password", () => {
    expect(
      signInSchema.safeParse({ email: "a@b.com", password: "supersecret" }).success,
    ).toBe(true);
  });

  it("rejects a bad email or short password", () => {
    expect(signInSchema.safeParse({ email: "nope", password: "supersecret" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    name: "Ada",
    email: "ada@example.com",
    password: "supersecret",
    confirmPassword: "supersecret",
  };

  it("accepts a matching, well-formed registration", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("requires a non-empty name", () => {
    expect(registerSchema.safeParse({ ...base, name: "   " }).success).toBe(false);
  });

  it("rejects mismatched passwords with a confirmPassword path", () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: "different1" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });
});

describe("requestResetSchema", () => {
  it("validates just the email", () => {
    expect(requestResetSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(requestResetSchema.safeParse({ email: "bad" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("requires matching passwords", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "supersecret", confirmPassword: "supersecret" })
        .success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({ password: "supersecret", confirmPassword: "nope12345" })
        .success,
    ).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const base = {
    currentPassword: "oldpassword",
    newPassword: "newpassword",
    confirmPassword: "newpassword",
  };

  it("accepts a valid change", () => {
    expect(changePasswordSchema.safeParse(base).success).toBe(true);
  });

  it("rejects when the new password equals the current one", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "samepassword",
      newPassword: "samepassword",
      confirmPassword: "samepassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["newPassword"]);
    }
  });

  it("rejects when confirmation does not match", () => {
    expect(
      changePasswordSchema.safeParse({ ...base, confirmPassword: "mismatch1" }).success,
    ).toBe(false);
  });
});
