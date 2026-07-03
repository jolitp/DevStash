// Helpers for rendering a user avatar when there's no profile image.

/** "Brad Traversy" → "BT", "madonna" → "M", "" → "?". Falls back to email. */
export function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0]?.trim() || "";
  if (!source) return "?";

  const words = source.split(/\s+/).filter(Boolean);
  const letters =
    words.length >= 2
      ? `${words[0][0]}${words[words.length - 1][0]}`
      : words[0].slice(0, 2);

  return letters.toUpperCase();
}

// A small, pleasant palette; pick deterministically so a given user always
// gets the same colour without storing one.
const AVATAR_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
];

/** Stable hash → colour, keyed off the user's name/email/id. */
export function avatarColor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
