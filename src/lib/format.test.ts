import { describe, it, expect } from "vitest";
import { formatRelativeTime, fileExtension, formatFileSize } from "@/lib/format";

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-07-04T12:00:00.000Z");
  const ago = (ms: number) => new Date(now - ms).toISOString();

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;

  it("clamps sub-minute and future times to 'just now'", () => {
    expect(formatRelativeTime(ago(0), now)).toBe("just now");
    expect(formatRelativeTime(ago(59 * SECOND), now)).toBe("just now");
    expect(formatRelativeTime(ago(-HOUR), now)).toBe("just now"); // future
  });

  it("formats minutes, hours, days", () => {
    expect(formatRelativeTime(ago(5 * MINUTE), now)).toBe("5m ago");
    expect(formatRelativeTime(ago(3 * HOUR), now)).toBe("3h ago");
    expect(formatRelativeTime(ago(2 * DAY), now)).toBe("2d ago");
  });

  it("formats weeks and months", () => {
    expect(formatRelativeTime(ago(2 * WEEK), now)).toBe("2w ago");
    expect(formatRelativeTime(ago(5 * WEEK), now)).toBe("1mo ago");
  });
});

describe("fileExtension", () => {
  it("returns the uppercased extension", () => {
    expect(fileExtension("photo.png")).toBe("PNG");
    expect(fileExtension("archive.tar.gz")).toBe("GZ");
  });

  it("returns empty string when there is no extension", () => {
    expect(fileExtension("README")).toBe("");
    expect(fileExtension(".gitignore")).toBe(""); // leading dot only
  });
});

describe("formatFileSize", () => {
  it("keeps bytes under 1 KiB", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("scales up to KB/MB/GB", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatFileSize(3 * 1024 * 1024 * 1024)).toBe("3.0 GB");
  });

  it("drops decimals once the value reaches 10", () => {
    expect(formatFileSize(15 * 1024)).toBe("15 KB");
  });
});
