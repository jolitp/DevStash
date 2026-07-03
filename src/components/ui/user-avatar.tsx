import Image from "next/image";

import { avatarColor, getInitials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

/**
 * Reusable avatar: shows the user's image when present, otherwise a coloured
 * circle with initials derived from their name (or email). `size` is the
 * pixel diameter.
 */
export function UserAvatar({
  name,
  email,
  image,
  size = 36,
  className,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  const dimension = { width: size, height: size };

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "User avatar"}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{ ...dimension, backgroundColor: avatarColor(name || email || "?") }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-medium text-white",
        className,
      )}
    >
      <span style={{ fontSize: Math.round(size * 0.4) }}>
        {getInitials(name, email)}
      </span>
    </span>
  );
}
