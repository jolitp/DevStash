import { describe, it, expect } from "vitest";
import { getInitials, avatarColor } from "@/lib/avatar";

describe("getInitials", () => {
  it("uses first + last initial for multi-word names", () => {
    expect(getInitials("Brad Traversy")).toBe("BT");
    expect(getInitials("  ada   lovelace  ")).toBe("AL"); // extra whitespace
    expect(getInitials("Mary Jane Watson")).toBe("MW"); // first + last only
  });

  it("uses the first two letters of a single-word name", () => {
    expect(getInitials("madonna")).toBe("MA");
    expect(getInitials("x")).toBe("X");
  });

  it("falls back to the email local-part when name is empty", () => {
    expect(getInitials(null, "demo@devstash.io")).toBe("DE");
    expect(getInitials("", "a@b.com")).toBe("A");
  });

  it("returns '?' when there is nothing to work with", () => {
    expect(getInitials()).toBe("?");
    expect(getInitials("   ", null)).toBe("?");
  });
});

describe("avatarColor", () => {
  it("is deterministic for the same key", () => {
    expect(avatarColor("demo@devstash.io")).toBe(avatarColor("demo@devstash.io"));
  });

  it("always returns a colour from the palette", () => {
    const hex = /^#[0-9a-f]{6}$/;
    for (const key of ["a", "b", "c", "user-123", ""]) {
      expect(avatarColor(key)).toMatch(hex);
    }
  });
});
