import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import type { AvatarTint } from "../../shared/components/ui/Avatar";

// "messages" was retired: private-message alerts live only in the message-icon
// unread badge and push notifications, never in the in-app notifications centre.
export type NotifType = "events" | "community" | "platform";

export interface NotifAction {
  label: string;
  variant: "primary" | "ghost";
  href: string;
  /**
   * When set, the action resolves the notification in place (removes it from the
   * list) instead of navigating, showing this confirmation toast.
   */
  resolve?: { toast: string };
  /**
   * When set, the action ANSWERS a connection request from the row itself
   * (PRD-15): `PATCH /connections/:id`, then resolve the row with `toast`.
   *
   * "Someone wants to connect" used to deep-link to a profile and nothing else,
   * so answering meant finding `/account/connections` on your own. This is the
   * same mechanism the persona-credit row proved out, with a mutation behind it
   * rather than a destination.
   *
   * `href` stays required and points at the member's profile, so a row whose
   * mutation cannot run (no connection id) still reaches somewhere real.
   */
  connectionResponse?: {
    connectionId: string;
    memberSlug: string;
    action: "accept" | "decline";
    toast: string;
  };
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
  /**
   * Deep-link to the discussion the notification originated from (a forum
   * thread or a community post), derived from the backend payload's `source`
   * + slug fields. Absent when the payload carries no usable source (e.g. a
   * non-mention row, or a community flat-post/reply payload that has no
   * `communitySlug`) — the row then falls back to just the actor link, same
   * as before this field existed.
   */
  sourceHref?: string;
  text: ReactNode;
  /**
   * How many members beyond the one named in `text` did the same thing to the
   * same subject. `0` (or absent) on an ordinary row; a positive count turns the
   * row into "Ana and 39 others replied", which is one row for one conversation
   * rather than forty rows for forty replies. See the backend's
   * `notification-bundling.ts` for which notifications collapse and which never
   * do.
   */
  otherActorCount?: number;
  meta: string;
  time: string;
  /**
   * Raw ISO creation time behind the display `time` label. The page's
   * "Today & recent" / "Earlier" headers bucket on this; without it they were
   * a positional slice (first seven rows = "recent") that filed today's eighth
   * notification under "Earlier". Absent rows stay in the first bucket rather
   * than being filed under a header nothing justifies.
   */
  createdAtIso?: string;
  actions?: NotifAction[];
}
