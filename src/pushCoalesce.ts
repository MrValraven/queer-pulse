/**
 * Pure decision helper for SP5 DM push coalescing — extracted so `sw.ts`'s
 * push handler (which has to call the unmockable `registration.getNotifications()`)
 * stays a thin wrapper around a testable function.
 *
 * WhatsApp/Telegram/Signal all fold a burst of DMs from the same conversation
 * into one calm notification instead of stacking N separate ones. Every DM
 * push is tagged with its conversation id and sets `renotify: true`, so at
 * most one live notification exists per conversation at a time — `sw.ts`
 * looks it up via `registration.getNotifications({ tag })` before deciding
 * how to render the incoming push. This module holds that decision: given
 * whatever existing notification was found (if any), how many messages does
 * the notification now represent, and should it render as the coalesced
 * "{count} new messages from {name}" summary instead of the single message?
 *
 * It also holds the two other pure decisions the push handler makes around
 * that count: the rendered copy (`resolveShownPushCopy`) and the app-badge
 * total (`sumAppBadgeCount`).
 */

import { type PushLang, formatPushCopy } from "./pushMessages";
import type { DirectMessagePush } from "./pushPayload";

/** The shape this module reads off a live `Notification` (or a test double). */
export interface ExistingCoalescedNotification {
  data?: { count?: unknown } | null;
}

export interface CoalesceDecision {
  /** Running count of messages folded into this notification (always >= 1). */
  count: number;
  /** True once there IS a prior notification to fold into — render the
   *  coalesced summary body instead of the single message's own body. */
  coalesced: boolean;
}

/**
 * `existing` is whatever `registration.getNotifications({ tag })` returned
 * for this push's conversation tag — normally 0 or 1 entries, since
 * `renotify: true` replaces rather than stacks a same-tag notification.
 *
 * No prior notification: this is the first message in the burst, count is 1,
 * and the caller should render the single-message copy as usual.
 *
 * A prior notification: reads its `data.count` (defaulting to 1, e.g. if an
 * older un-coalesced notification is still showing) and increments it — the
 * caller should render `push:messages.coalesced` with that new count.
 */
export function decideCoalesce(
  existing: ExistingCoalescedNotification[],
): CoalesceDecision {
  const previous = existing[0];
  if (!previous) return { count: 1, coalesced: false };
  const previousCount = readCount(previous);
  return { count: previousCount + 1, coalesced: true };
}

function readCount(notification: ExistingCoalescedNotification): number {
  return readCountValue(notification.data?.count);
}

function readCountValue(raw: unknown): number {
  return typeof raw === "number" && Number.isFinite(raw) && raw >= 1 ? raw : 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The shape the app-badge sum reads off a live `Notification`. */
export interface BadgeCountedNotification {
  tag?: string;
  data?: unknown;
}

/**
 * PRD-335 worker half: the number the installed app icon should show, given
 * every notification this origin currently has on screen
 * (`registration.getNotifications()`).
 *
 * Only message notifications count (the ones carrying `data.conversationId`);
 * each contributes its coalesced `data.count`, defaulting to 1 when the count
 * is missing or malformed, so a burst of three in one conversation adds 3.
 *
 * `excludedTag` drops the notification that was just tapped. `close()` does
 * not promise that `getNotifications()` stops returning it straight away, and
 * a message notification always has a tag (its conversation id), so matching
 * on the tag is enough to leave it out.
 */
export function sumAppBadgeCount(
  notifications: readonly BadgeCountedNotification[],
  excludedTag?: string,
): number {
  let total = 0;
  for (const notification of notifications) {
    if (excludedTag && notification.tag === excludedTag) continue;
    const data = notification.data;
    if (!isRecord(data)) continue;
    const conversationId = data.conversationId;
    if (typeof conversationId !== "string" || conversationId.length === 0) {
      continue;
    }
    total += readCountValue(data.count);
  }
  return total;
}

/** Everything the rendered title/body of a push depends on. */
export interface ShownPushCopyInput {
  payload: Pick<DirectMessagePush, "title" | "body" | "l10n" | "data">;
  lang: PushLang;
  /** A message push: carries `data.conversationId` and a tag. */
  isDirectMessagePush: boolean;
  decision: CoalesceDecision;
  /** The member's local hide-previews mirror (pushPrivacy.ts). */
  shouldHidePreviews: boolean;
}

const HIDDEN_TITLE = {
  title: "QueerPulse",
  titleKey: "push:preview.hidden.title",
} as const;

/** Every generic body key the server sends to a member who hides previews. */
const HIDDEN_BODY_KEY_PREFIX = "push:preview.hidden";

/**
 * The single place that decides what a push notification says.
 *
 * Hidden previews (ENG-229): a message push keeps the message-specific generic
 * copy, "You have a new message." for one and "{count} new messages." for a
 * burst, so the count this handler just computed still reaches the member.
 * Every other push says "You have a new notification." Nothing identifying
 * survives on either path: the sender's name, the group title and the message
 * text are all dropped.
 *
 * A payload the server already made generic (any `l10n.bodyKey` starting with
 * `push:preview.hidden`, because the member hides previews on the server while
 * this device's mirror has not caught up) is treated exactly like the local
 * hide-previews case. The server keeps `data` intact on that variant, so a
 * group message still carries `data.isGroup` and `data.conversationId`.
 * Without this rule a burst would read "3 new messages in QueerPulse" or
 * "3 new messages from QueerPulse", because the generic title is the only
 * title the payload carries.
 *
 * Visible previews: a coalesced group burst (PRD-333) reads "{count} new
 * messages in {group}" with the group title the server sends as `title`, a DM
 * burst keeps "{count} new messages from {name}", and a single push renders its
 * own l10n block (attachment kinds included) through `formatPushCopy`.
 */
export function resolveShownPushCopy({
  payload,
  lang,
  isDirectMessagePush,
  decision,
  shouldHidePreviews,
}: ShownPushCopyInput): { title: string; body: string } {
  const { count, coalesced } = decision;
  const isServerHiddenCopy =
    payload.l10n?.bodyKey?.startsWith(HIDDEN_BODY_KEY_PREFIX) === true;

  if (shouldHidePreviews || isServerHiddenCopy) {
    if (!isDirectMessagePush) {
      return formatPushCopy(
        {
          title: HIDDEN_TITLE.title,
          body: "You have a new notification.",
          l10n: {
            titleKey: HIDDEN_TITLE.titleKey,
            bodyKey: "push:preview.hidden.body",
          },
        },
        lang,
      );
    }
    return formatPushCopy(
      coalesced
        ? {
            title: HIDDEN_TITLE.title,
            body: `${count} new messages.`,
            l10n: {
              titleKey: HIDDEN_TITLE.titleKey,
              bodyKey: "push:preview.hidden.messages",
              params: { count: String(count) },
            },
          }
        : {
            title: HIDDEN_TITLE.title,
            body: "You have a new message.",
            l10n: {
              titleKey: HIDDEN_TITLE.titleKey,
              bodyKey: "push:preview.hidden.message",
            },
          },
      lang,
    );
  }

  if (isDirectMessagePush && coalesced) {
    const isGroup = payload.data?.isGroup === true;
    return formatPushCopy(
      {
        title: payload.title,
        body: payload.body,
        l10n: {
          titleKey: payload.l10n?.titleKey,
          bodyKey: isGroup
            ? "push:messages.coalescedGroup"
            : "push:messages.coalesced",
          params: isGroup
            ? { count: String(count), group: payload.title }
            : { count: String(count), name: payload.title },
        },
      },
      lang,
    );
  }

  return formatPushCopy(payload, lang);
}
