import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import type { AvatarTint } from "../../shared/components/ui/Avatar";

export type NotifType = "messages" | "events" | "community" | "platform";

export interface NotifAction {
  label: string;
  variant: "primary" | "ghost";
  href: string;
  /**
   * When set, the action resolves the notification in place (removes it from the
   * list) instead of navigating, showing this confirmation toast.
   */
  resolve?: { toast: string };
}

export interface Notification {
  /**
   * A uuid in live mode, a small number in the demo mock. Opaque either way —
   * only ever compared and used as a React key, never arithmetic.
   */
  id: string | number;
  type: NotifType;
  unread: boolean;
  /** Either an avatar (initials + tint) or an emoji icon with a background. */
  avatar?: { initials: string; tint: AvatarTint };
  icon?: { Glyph: IconType; bg: string };
  text: ReactNode;
  meta: string;
  time: string;
  actions?: NotifAction[];
}
