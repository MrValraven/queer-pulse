// src/features/messages/useNewIncomingAnnouncement.ts
import { useEffect, useRef, useState } from "react";
import type { TFunction } from "../../shared/i18n/types";
import { attachmentCaption } from "./messageCopy";
import type { ChatMessage } from "./data";
import { systemMessageText } from "./systemMessageText";

/** Stable identity of a message for continuity tracking: the server id, the
 *  client id of an id-less optimistic send, or the ISO timestamp as a last
 *  fallback. A message with none of them is unannounceable (undefined). */
function messageKey(message: ChatMessage): string | undefined {
  return message.id ?? message.localId ?? message.at;
}

/** Whether `message` is the one a tracked `key` was taken from. Matches every
 *  identity field, so an own optimistic send that gains its server id in the
 *  same patch as an inbound arrival still reads as a continuation. */
function matchesKey(message: ChatMessage, key: string): boolean {
  return message.id === key || message.localId === key || message.at === key;
}

/** One announcement: `key` is the announced message's identity, so the
 *  rendered node is replaced (and re-read) even when two consecutive messages
 *  produce the same sentence. */
export interface LiveAnnouncement {
  key: string;
  text: string;
}

/** The kind label a media message is announced with, in the READER's language
 *  (the raw `text` fallback is in the sender's). Undefined for text messages. */
function mediaKindLabel(
  message: ChatMessage,
  t: TFunction,
): string | undefined {
  switch (message.kind) {
    case "image":
      return t("messages:attachments.fallbackText");
    case "gif":
      return t("messages:viewer.gifBadge");
    case "document":
      return t("messages:attachments.documentFallbackText");
    case "sticker":
      return t("messages:sticker.attachmentLabel");
    default:
      return undefined;
  }
}

/** The sentence read out for a new inbound `message`, or undefined when there
 *  is nothing meaningful to say. A system event reads exactly as its pill does;
 *  a group message names its sender; a DM names the counterpart. */
function announcementText(
  message: ChatMessage,
  isGroup: boolean,
  counterpartName: string,
  t: TFunction,
): string | undefined {
  if (message.kind === "system") {
    return message.systemEvent
      ? systemMessageText(message.systemEvent, t)
      : undefined;
  }
  const name = isGroup
    ? message.senderName ||
      t("messages:conversation.announcementSenderFallback")
    : counterpartName;
  const kindLabel = mediaKindLabel(message, t);
  // `attachmentCaption` (`messageCopy.ts`) already excludes the sticker
  // shape, which carries no caption at all, rather than reading
  // `message.attachment?.caption` directly here.
  const caption = attachmentCaption(message)?.trim();
  const snippet = kindLabel
    ? caption
      ? t("messages:conversation.announcementMediaWithCaption", {
          kind: kindLabel,
          caption,
        })
      : kindLabel
    : message.text.trim();
  return t("messages:conversation.newMessageAnnouncement", {
    name,
    snippet: snippet.slice(0, 120),
  });
}

/** The newest loaded message, found from the end without flattening. */
function findTail(
  messageGroups: { day: string; items: ChatMessage[] }[],
): ChatMessage | undefined {
  for (
    let groupIndex = messageGroups.length - 1;
    groupIndex >= 0;
    groupIndex -= 1
  ) {
    const items = messageGroups[groupIndex]!.items;
    if (items.length > 0) return items[items.length - 1];
  }
  return undefined;
}

/** Whether a message with `key` is still loaded. Scans from the NEWEST end
 *  because the key it is asked about is the previous tail: on an ordinary
 *  arrival it sits a message or two from the end, so the scan stops almost
 *  immediately; only a thread switch (key absent) walks the whole list. */
function containsKeyFromEnd(
  messageGroups: { day: string; items: ChatMessage[] }[],
  key: string,
): boolean {
  for (
    let groupIndex = messageGroups.length - 1;
    groupIndex >= 0;
    groupIndex -= 1
  ) {
    const items = messageGroups[groupIndex]!.items;
    for (let itemIndex = items.length - 1; itemIndex >= 0; itemIndex -= 1) {
      if (matchesKey(items[itemIndex]!, key)) return true;
    }
  }
  return false;
}

/**
 * Announces ONLY genuinely-new inbound messages to a polite live region: never
 * history loads (the tail message is unchanged when older pages prepend above)
 * and never thread switches (the previously-tracked tail message is absent from
 * the freshly-loaded list, so we re-seed silently instead of reading it out).
 * The signed-in member's own sends (and own system events, which arrive as
 * `from: "me"`) are never announced. A system event from someone else that
 * lands live reads out as its pill's text; a history system message never does.
 * Returns the keyed announcement to render inside the sr-only region; null
 * until the first real arrival.
 *
 * Incremental: it used to flatten every loaded message and build a Set of every
 * key on each cache patch. The tail is now read from the end in O(1), a patch
 * that leaves the tail alone (a reaction, a receipt, an older page) returns
 * before any scan, and the continuity check scans backwards from the end.
 */
export function useNewIncomingAnnouncement(
  messageGroups: { day: string; items: ChatMessage[] }[],
  isGroup: boolean,
  counterpartName: string,
  t: TFunction,
): LiveAnnouncement | null {
  const [announcement, setAnnouncement] = useState<LiveAnnouncement | null>(
    null,
  );
  const lastTailKeyRef = useRef<string | undefined>(undefined);
  const initializedRef = useRef(false);

  useEffect(() => {
    const tail = findTail(messageGroups);
    const tailKey = tail ? messageKey(tail) : undefined;
    const previousTailKey = lastTailKeyRef.current;

    // Tail unchanged (older history prepended above, or an unrelated re-render)
    // means nothing arrived at the bottom, so there is nothing new to announce.
    if (initializedRef.current && tailKey === previousTailKey) return;

    // Continuity check: is the message we last tracked as the tail still present
    // in this list? If so, messages were appended to the SAME thread. If it's
    // gone, the whole list was replaced (thread switch), so re-seed silently.
    const isContinuation =
      initializedRef.current &&
      previousTailKey !== undefined &&
      containsKeyFromEnd(messageGroups, previousTailKey);

    lastTailKeyRef.current = tailKey;
    initializedRef.current = true;

    if (
      isContinuation &&
      tail &&
      tail.from === "them" &&
      tailKey !== undefined &&
      !tail.deletedAt
    ) {
      const text = announcementText(tail, isGroup, counterpartName, t);
      if (text) setAnnouncement({ key: tailKey, text });
    }
  }, [messageGroups, isGroup, counterpartName, t]);

  return announcement;
}
