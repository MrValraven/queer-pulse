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
  /** Either an avatar (initials + tint, optionally a real photo) or an emoji
   *  icon with a background. */
  avatar?: { initials: string; tint: AvatarTint; src?: string };
  icon?: { Glyph: IconType; background: string };
  /** Member slug of the person named inside `text`, when `text` names one and
   *  that person has a real member account. `text` is a `ReactNode` blob (an
   *  interpolated `<Translation>` or plain string) with no separate name
   *  field, so this is the only handle a staff badge can hang off. Omitted
   *  for org/system/anonymous rows. */
  actorSlug?: string;
  /**
   * The member behind a person-based notification (connection, vouch, intro,
   * event invite), resolved live. When present, the row renders their name as a
   * link and their avatar links to the same profile. `textKey` is the
   * personalized `notifications:type.<kind>.textNamed` copy with a
   * `<profile>{name}</profile>` slot; absent when no personalized copy exists.
   */
  actor?: { name: string; href: string; textKey?: string };
  text: ReactNode;
  meta: string;
  time: string;
  actions?: NotifAction[];
}
