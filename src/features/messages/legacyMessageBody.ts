// src/features/messages/legacyMessageBody.ts
import { detectLanguage } from "../../shared/i18n/locale";
import type { Language, TFunction } from "../../shared/i18n/types";
import type { ChatMessage } from "./data";

/**
 * Read-time guards for two classes of legacy message rows the product chose
 * to keep as stored (no data migration), so every surface that shows a
 * message as plain text repairs them on the way out. The server applies the
 * same guards in English (`legacy-message-body.ts` in the backend); these
 * cover rows it has not mapped yet (a cached response, an older deploy) and
 * put the label in the reader's language.
 *
 * Class 1: an older attach flow stored `t()` output as the body, and when the
 * `messages` namespace had not loaded yet `t()` echoed the key itself, so
 * some photo/GIF/file rows carry one of these raw catalog keys as their body.
 */
export const RAW_ATTACHMENT_FALLBACK_KEYS: readonly string[] = Object.freeze([
  "messages:attachments.documentFallbackText",
  "messages:attachments.fallbackText",
]);

type MessageKind = NonNullable<ChatMessage["kind"]>;
type AttachmentKind = "image" | "gif" | "document";

/** The catalog key naming each attachment kind, the same keys
 *  `messageKindLabel` (`messageInfo.ts`) labels media with. */
const ATTACHMENT_LABEL_KEY: Record<AttachmentKind, string> = {
  image: "messages:attachments.fallbackText",
  gif: "messages:viewer.gifBadge",
  document: "messages:attachments.documentFallbackText",
};

/**
 * The same labels as they stand in the `messages` catalogs, for callers with
 * no translator in scope (the live-patch preview, the chat adapter) and for a
 * translator whose `messages` namespace has not loaded yet (it echoes the
 * key, the very failure that produced these rows). Held here because this
 * module sits in the entry chunk through `messages.adapters.ts`, and the two
 * full `messages` catalogs would add roughly 120 KB to it.
 * `legacyMessageBody.test.ts` pins every entry to the catalogs.
 */
export const ATTACHMENT_LABEL_FALLBACK: Record<
  AttachmentKind,
  Record<Language, string>
> = {
  image: { en: "Photo", pt: "Foto" },
  gif: { en: "GIF", pt: "GIF" },
  document: { en: "File", pt: "Ficheiro" },
};

/** Whether `body` is one of the raw keys a legacy attachment row stored. */
export function isRawAttachmentFallbackKey(body: string): boolean {
  return RAW_ATTACHMENT_FALLBACK_KEYS.includes(body);
}

/** Which attachment label a raw-key body stands for. The message's own kind
 *  decides when known; a caller without one (an older starred hit) reads it
 *  off the key. A text, system or sticker message never qualifies. */
function attachmentKindFor(
  kind: MessageKind | undefined,
  body: string,
): AttachmentKind | undefined {
  if (kind === "image" || kind === "gif" || kind === "document") return kind;
  if (kind !== undefined) return undefined;
  return body === "messages:attachments.documentFallbackText"
    ? "document"
    : "image";
}

export interface ReadableBodyOptions {
  /** A translator, when the caller has one in scope. */
  t?: TFunction;
  /** The reader's language, when the caller already knows it; otherwise the
   *  persisted choice via `detectLanguage`, as the sticker label does. */
  language?: Language;
}

/**
 * The body a photo, GIF or file message shows as plain text: the localized
 * kind label when the stored body is a raw fallback key, the body unchanged
 * otherwise (including the English label the server already mapped). `t` is
 * used when it resolves; a translator that echoes the key falls back to the
 * catalog copy above.
 */
export function readableAttachmentBody(
  kind: MessageKind | undefined,
  body: string,
  options: ReadableBodyOptions = {},
): string {
  if (!isRawAttachmentFallbackKey(body)) return body;
  const attachmentKind = attachmentKindFor(kind, body);
  if (!attachmentKind) return body;
  const labelKey = ATTACHMENT_LABEL_KEY[attachmentKind];
  const translated = options.t?.(labelKey);
  if (translated && translated !== labelKey) return translated;
  return ATTACHMENT_LABEL_FALLBACK[attachmentKind][
    options.language ?? detectLanguage()
  ];
}

/**
 * Class 2: a sticker edited before stickers became uneditable kept the
 * edit's text in its body and an `editedAt` stamp. A sticker has no text to
 * edit, so its bubble never shows or announces the "edited" mark, whatever
 * the row carries.
 */
export function shouldShowEditedMark(
  message: Pick<ChatMessage, "editedAt" | "kind">,
): boolean {
  return !!message.editedAt && message.kind !== "sticker";
}
