import { routes } from "../../app/routeMap";
import type { MessageResponse } from "../../shared/contracts/contracts";
import type { TFunction } from "../../shared/i18n/types";
import type { Conversation } from "../messages/data";
import {
  isMessagesRoute,
  isViewingConversation,
} from "./serviceWorkerBridgeDecision";

/**
 * Pure decisions behind the in-app new-message banner (PRD-332). The server
 * skips web push for a member with a live socket, so while the app is open this
 * is the only thing that tells them a message landed somewhere they are not
 * looking. `useIncomingMessageBanner` wires it to the socket; everything that
 * can be decided without a browser lives here.
 */

/** Longest one-line preview, in characters, before it is cut with an ellipsis. */
export const INCOMING_MESSAGE_PREVIEW_MAX_LENGTH = 100;
/** A burst from one conversation raises one toast in this window. */
export const INCOMING_MESSAGE_TOAST_COOLDOWN_MS = 5_000;
/** Past this many remembered conversations, expired entries are dropped. */
const TOAST_HISTORY_PRUNE_SIZE = 50;
export const INCOMING_MESSAGE_NOTIFICATION_ICON = "/icons/icon-192-v3.png";
export const INCOMING_MESSAGE_NOTIFICATION_BADGE =
  "/icons/badge-monochrome-96.png";
/** The brand name, identical in every language, matching the worker's
 *  `push:preview.hidden.title`. */
export const HIDDEN_PREVIEW_NOTIFICATION_TITLE = "QueerPulse";

export type IncomingMessageBannerAction = "ignore" | "toast" | "notification";

export interface IncomingMessageBannerInput {
  isDemoMode: boolean;
  conversationId: string;
  activeConversationId: string | null;
  pathname: string;
  visibilityState: DocumentVisibilityState;
  notificationPermission: NotificationPermission | "unsupported";
  /**
   * The conversation's inbox row, from the cache or one load of the list
   * (`resolveIncomingConversationRow`). `null` when it is still unknown.
   */
  conversationRow: CachedConversationRow | null;
  now: number;
  messageKind: MessageResponse["kind"];
  isMessageDeleted: boolean;
}

/**
 * Whether a message can raise a banner at all: system events and deleted
 * messages never do. Checked before the inbox lookup too, so an ignorable frame
 * never loads the list.
 */
export function isBannerEligibleMessage(
  message: Pick<MessageResponse, "kind" | "deletedAt">,
): boolean {
  return message.kind !== "system" && message.deletedAt === null;
}

/**
 * First match wins:
 * 1. demo mode, a system event or a deleted message: ignore
 * 2. the inbox row is unknown, or the conversation is muted: ignore (a muted
 *    chat must never raise a banner, and an unknown row cannot rule that out)
 * 3. the member is viewing this thread (visible tab, messages route, thread open): ignore
 * 4. visible tab on the messages route: ignore (the inbox row already shows it)
 * 5. visible tab anywhere else: toast
 * 6. hidden tab with notification permission granted: notification
 * 7. otherwise: ignore
 */
export function decideIncomingMessageBanner(
  input: IncomingMessageBannerInput,
): IncomingMessageBannerAction {
  if (input.isDemoMode) return "ignore";
  if (
    !isBannerEligibleMessage({
      kind: input.messageKind,
      deletedAt: input.isMessageDeleted ? "deleted" : null,
    })
  ) {
    return "ignore";
  }
  if (input.conversationRow === null) return "ignore";
  if (isConversationRowMuted(input.conversationRow, input.now)) return "ignore";
  if (isViewingConversation(input)) return "ignore";
  if (input.visibilityState === "visible") {
    return isMessagesRoute(input.pathname) ? "ignore" : "toast";
  }
  return input.notificationPermission === "granted" ? "notification" : "ignore";
}

export type CachedConversationRow = Pick<
  Conversation,
  "id" | "name" | "isGroup" | "muted" | "mutedUntil"
>;

/** The conversation's row from any cached inbox list, without fetching. */
export function findCachedConversationRow(
  cachedLists: ReadonlyArray<readonly [unknown, unknown]>,
  conversationId: string,
): CachedConversationRow | null {
  for (const [, data] of cachedLists) {
    if (!Array.isArray(data)) continue;
    const row = (data as Array<Conversation | null | undefined>).find(
      (conversation) => conversation?.id === conversationId,
    );
    if (row) return row;
  }
  return null;
}

export interface ConversationRowSources {
  /** Every cached live inbox list, read without fetching. */
  readCachedLists: () => ReadonlyArray<readonly [unknown, unknown]>;
  /** One load of the inbox list (`ensureQueryData` in the hook). */
  loadConversationList: () => Promise<unknown>;
}

/**
 * The conversation's inbox row: the cached one when present, otherwise the row
 * from one load of the list. Resolves `null`, and never rejects, when the load
 * fails or the conversation is not in the list, which the decision treats as
 * "cannot rule out a mute" and ignores.
 */
export async function resolveIncomingConversationRow(
  conversationId: string,
  sources: ConversationRowSources,
): Promise<CachedConversationRow | null> {
  const cachedRow = findCachedConversationRow(
    sources.readCachedLists(),
    conversationId,
  );
  if (cachedRow) return cachedRow;
  try {
    const loadedList = await sources.loadConversationList();
    return findCachedConversationRow([[null, loadedList]], conversationId);
  } catch {
    return null;
  }
}

/**
 * Same reading as the inbox row's mute indicator: a timed mute counts only
 * while `mutedUntil` is in the future, whatever `muted` still says; without a
 * timestamp, `muted` decides.
 */
export function isConversationRowMuted(
  row: Pick<Conversation, "muted" | "mutedUntil"> | null,
  now: number,
): boolean {
  if (!row) return false;
  if (typeof row.mutedUntil === "string") {
    const mutedUntilMs = Date.parse(row.mutedUntil);
    if (Number.isFinite(mutedUntilMs)) return mutedUntilMs > now;
  }
  return row.muted === true;
}

/** Collapse whitespace to one line and cut long text with an ellipsis. */
export function toOneLinePreview(
  text: string,
  maxLength: number = INCOMING_MESSAGE_PREVIEW_MAX_LENGTH,
): string {
  const collapsedText = text.replace(/\s+/g, " ").trim();
  const characters = Array.from(collapsedText);
  if (characters.length <= maxLength) return collapsedText;
  return `${characters
    .slice(0, maxLength - 1)
    .join("")
    .trimEnd()}…`;
}

const ATTACHMENT_KIND_KEYS = {
  image: "messages:attachments.fallbackText",
  gif: "messages:viewer.gifBadge",
  document: "messages:attachments.documentFallbackText",
} as const;

function readAttachmentCaption(
  attachment: MessageResponse["attachment"],
): string | null {
  if (!attachment || !("caption" in attachment)) return null;
  const caption = attachment.caption;
  return typeof caption === "string" && caption.trim() !== "" ? caption : null;
}

/**
 * The one-line preview. An attachment's stored body is only the sender's
 * client placeholder (in the sender's language), so it is replaced by the kind
 * word in the reader's language unless they typed a caption, which travels in
 * `attachment.caption` (the same rule as the push listener).
 */
export function incomingMessagePreviewText(
  message: Pick<MessageResponse, "kind" | "body" | "attachment">,
  t: TFunction,
): string {
  if (
    message.kind === "image" ||
    message.kind === "gif" ||
    message.kind === "document"
  ) {
    const caption = readAttachmentCaption(message.attachment);
    return caption
      ? toOneLinePreview(caption)
      : t(ATTACHMENT_KIND_KEYS[message.kind]);
  }
  return toOneLinePreview(message.body);
}

export interface IncomingMessageCopyInput {
  senderName: string;
  /** The group's title when the cached row is a group, else `null`. */
  groupTitle: string | null;
  previewText: string;
  isHidingPreviews: boolean;
  t: TFunction;
}

export interface IncomingMessageCopy {
  toastMessage: string;
  notificationTitle: string;
  notificationBody: string;
}

/**
 * Toast and notification copy. Hidden previews name nobody and quote nothing:
 * the in-app toast can be read over a shoulder as easily as a lock screen.
 */
export function buildIncomingMessageCopy(
  input: IncomingMessageCopyInput,
): IncomingMessageCopy {
  const senderName = input.senderName.trim();
  if (input.isHidingPreviews || senderName === "") {
    const genericLine = input.t("messages:thread.newMessage");
    return {
      toastMessage: genericLine,
      notificationTitle: HIDDEN_PREVIEW_NOTIFICATION_TITLE,
      notificationBody: genericLine,
    };
  }
  const senderLine = input.t("messages:incomingBanner.message", {
    name: senderName,
    preview: input.previewText,
  });
  if (input.groupTitle) {
    return {
      toastMessage: input.t("messages:incomingBanner.groupMessage", {
        name: senderName,
        group: input.groupTitle,
        preview: input.previewText,
      }),
      notificationTitle: input.groupTitle,
      notificationBody: senderLine,
    };
  }
  return {
    toastMessage: senderLine,
    notificationTitle: senderName,
    notificationBody: input.previewText,
  };
}

/** The deep link `useMessageDeepLinks` opens: `/messages?c=<conversationId>`. */
export function conversationPathFor(conversationId: string): string {
  return `${routes.messages}?c=${encodeURIComponent(conversationId)}`;
}

/**
 * Whether a toast for `conversationId` may show now, recording it if so. The
 * toast system stacks and has no replace-by-key, so a burst of five messages
 * would otherwise stack five toasts.
 */
export function claimToastSlot(
  lastShownAtByConversation: Map<string, number>,
  conversationId: string,
  now: number,
): boolean {
  const lastShownAt = lastShownAtByConversation.get(conversationId);
  if (
    lastShownAt !== undefined &&
    now - lastShownAt < INCOMING_MESSAGE_TOAST_COOLDOWN_MS
  ) {
    return false;
  }
  if (lastShownAtByConversation.size >= TOAST_HISTORY_PRUNE_SIZE) {
    for (const [rememberedId, shownAt] of lastShownAtByConversation) {
      if (now - shownAt >= INCOMING_MESSAGE_TOAST_COOLDOWN_MS) {
        lastShownAtByConversation.delete(rememberedId);
      }
    }
  }
  lastShownAtByConversation.set(conversationId, now);
  return true;
}
