import { describe, it, expect, afterEach } from "vitest";
import { isEmailVerificationEnabled } from "@/lib/auth/email-verification";

describe("isEmailVerificationEnabled", () => {
  const original = process.env.EMAIL_VERIFICATION_ENABLED;

  afterEach(() => {
    if (original === undefined) delete process.env.EMAIL_VERIFICATION_ENABLED;
    else process.env.EMAIL_VERIFICATION_ENABLED = original;
  });

  it("defaults to enabled when unset or empty", () => {
    delete process.env.EMAIL_VERIFICATION_ENABLED;
    expect(isEmailVerificationEnabled()).toBe(true);
    process.env.EMAIL_VERIFICATION_ENABLED = "   ";
    expect(isEmailVerificationEnabled()).toBe(true);
  });

  it("treats false/0/off/no (any case) as disabled", () => {
    for (const value of ["false", "0", "off", "no", "FALSE", "Off"]) {
      process.env.EMAIL_VERIFICATION_ENABLED = value;
      expect(isEmailVerificationEnabled()).toBe(false);
    }
  });

  it("treats any other value as enabled", () => {
    for (const value of ["true", "1", "on", "yes", "anything"]) {
      process.env.EMAIL_VERIFICATION_ENABLED = value;
      expect(isEmailVerificationEnabled()).toBe(true);
    }
  });
});
