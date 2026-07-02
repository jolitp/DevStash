/** Formatting helpers shared across the dashboard UI. */

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

/**
 * Compact relative time, e.g. "just now", "5m ago", "3h ago", "2d ago".
 *
 * `referenceMs` is the "now" to measure against — the mock data uses fixed
 * timestamps, so callers pass the latest item time to keep output stable and
 * independent of the wall clock. Future values clamp to "just now".
 */
export function formatRelativeTime(iso: string, referenceMs: number): string {
  const seconds = Math.floor((referenceMs - Date.parse(iso)) / 1000);
  if (seconds < MINUTE) return "just now";
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)}m ago`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)}h ago`;
  if (seconds < WEEK) return `${Math.floor(seconds / DAY)}d ago`;
  if (seconds < WEEK * 4) return `${Math.floor(seconds / WEEK)}w ago`;
  return `${Math.floor(seconds / (WEEK * 4))}mo ago`;
}

/** Uppercase file extension from a file name, e.g. "PNG" (empty when none). */
export function fileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(dot + 1).toUpperCase() : "";
}

/** Human-readable byte size, e.g. "1.2 MB" or "512 KB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size < 10 ? size.toFixed(1) : Math.round(size)} ${units[unit]}`;
}