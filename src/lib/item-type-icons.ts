import {
  Clock,
  Code,
  Code2,
  File,
  FileText,
  Folder,
  Image,
  Layers,
  Link as LinkIcon,
  Pin,
  Sparkles,
  SquareTerminal,
  Star,
  StickyNote,
  Terminal,
} from "lucide-react";
import type { ComponentType } from "react";

export type IconComponent = ComponentType<{ className?: string }>;

/**
 * Maps lucide export names (as stored in `ItemType.icon` and the sidebar nav
 * model) to their components. Single source of truth for the dashboard so the
 * item cards, collection cards, and sidebar stay in sync.
 */
export const ITEM_TYPE_ICONS: Record<string, IconComponent> = {
  Layers,
  Star,
  Pin,
  Clock,
  Folder,
  Code,
  Code2,
  Sparkles,
  Terminal,
  SquareTerminal,
  StickyNote,
  FileText,
  File,
  Image,
  Link: LinkIcon,
};
