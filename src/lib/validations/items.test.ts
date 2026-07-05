import { describe, expect, it } from "vitest";

import { createItemSchema, updateItemSchema } from "./items";

const base = {
  title: "My Item",
  description: null,
  content: null,
  language: null,
  url: null,
  tags: [] as string[],
};

describe("updateItemSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = updateItemSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("trims the title and rejects an empty/whitespace one", () => {
    const ok = updateItemSchema.safeParse({ ...base, title: "  Hello  " });
    expect(ok.success && ok.data.title).toBe("Hello");

    const empty = updateItemSchema.safeParse({ ...base, title: "   " });
    expect(empty.success).toBe(false);
    if (!empty.success) {
      expect(empty.error.issues[0]?.message).toBe("Title is required");
    }
  });

  it("normalizes empty/whitespace optional text to null", () => {
    const result = updateItemSchema.safeParse({
      ...base,
      description: "   ",
      content: "",
      language: "  ts  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
      expect(result.data.content).toBeNull();
      expect(result.data.language).toBe("ts");
    }
  });

  it("accepts null/undefined for optional text fields", () => {
    const result = updateItemSchema.safeParse({
      title: "t",
      tags: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
      expect(result.data.url).toBeNull();
    }
  });

  it("accepts a valid URL and normalizes empty to null", () => {
    const valid = updateItemSchema.safeParse({
      ...base,
      url: "https://example.com/path",
    });
    expect(valid.success && valid.data.url).toBe("https://example.com/path");

    const blank = updateItemSchema.safeParse({ ...base, url: "  " });
    expect(blank.success && blank.data.url).toBeNull();
  });

  it("rejects an invalid URL", () => {
    const result = updateItemSchema.safeParse({ ...base, url: "not a url" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter a valid URL");
    }
  });

  it("trims, drops empty, and de-duplicates tags", () => {
    const result = updateItemSchema.safeParse({
      ...base,
      tags: [" react ", "react", "", "  ", "hooks"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(["react", "hooks"]);
    }
  });
});

describe("createItemSchema", () => {
  it("accepts a minimal valid snippet payload", () => {
    const result = createItemSchema.safeParse({
      type: "snippet",
      title: "My Snippet",
      tags: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("snippet");
      expect(result.data.description).toBeNull();
      expect(result.data.url).toBeNull();
    }
  });

  it("rejects an unknown type", () => {
    const result = createItemSchema.safeParse({
      type: "file",
      title: "Nope",
      tags: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = createItemSchema.safeParse({
      type: "note",
      title: "   ",
      tags: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Title is required");
    }
  });

  it("requires a URL for the link type", () => {
    const missing = createItemSchema.safeParse({
      type: "link",
      title: "A link",
      tags: [],
    });
    expect(missing.success).toBe(false);
    if (!missing.success) {
      expect(missing.error.issues[0]?.message).toBe(
        "URL is required for links",
      );
      expect(missing.error.issues[0]?.path).toEqual(["url"]);
    }

    const ok = createItemSchema.safeParse({
      type: "link",
      title: "A link",
      url: "https://example.com",
      tags: [],
    });
    expect(ok.success && ok.data.url).toBe("https://example.com");
  });

  it("does not require a URL for non-link types", () => {
    const result = createItemSchema.safeParse({
      type: "prompt",
      title: "A prompt",
      tags: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid URL", () => {
    const result = createItemSchema.safeParse({
      type: "link",
      title: "Bad link",
      url: "not a url",
      tags: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter a valid URL");
    }
  });

  it("trims, drops empty, and de-duplicates tags", () => {
    const result = createItemSchema.safeParse({
      type: "snippet",
      title: "Tagged",
      tags: [" react ", "react", "", "hooks"],
    });
    expect(result.success && result.data.tags).toEqual(["react", "hooks"]);
  });
});
