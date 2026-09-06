// src/features/messages/MessageBubbleBody.tsx
import { FiFile, FiImage } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionText } from "../../shared/mentions/MentionText";
import { isEmojiOnly } from "./messageRuns";
import { renderWithLinks } from "./linkify";
import { MessageMeta, type MetaStatus } from "./MessageSendStatus";
import {
  AttachmentPreviewUnavailable,
  MessageDocumentAttachment,
} from "./MessageDocumentAttachment";
import { isDocumentAttachment } from "../../shared/api/documentAttachment";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

/** The bubble's content: the quoted-reply block (when present), the emoji-only
 *  or text body, and — on a run's last bubble — the time + status-tick meta.
 *  Split out of `MessageBubble` so that component stays under the line cap once
 *  it also owns the touch gestures. */
export function MessageBubbleBody({
  message,
  index,
  lastIndex,
  isSent,
  isLast,
  senderName,
  metaStatus,
  onJumpToMessage,
  playEntrance,
}: {
  message: ChatMessage;
  index: number;
  lastIndex: number;
  isSent: boolean;
  isLast: boolean;
  senderName: string;
  metaStatus: MetaStatus;
  onJumpToMessage?: (messageId: string) => void;
  /** Gates the `msgBubbleIn`/`msgBubbleInSent` entrance — true only for a
   *  genuinely new arrival (see `MessageBubbleImpl`'s `playEntrance` state). */
  playEntrance: boolean;
}) {
  const { t } = useTranslation();
  // A subtle "Forwarded" label above the body (WhatsApp-style) when this message
  // was forwarded — only the body is carried on a forward, never reactions/receipts.
  const forwardedNode = message.forwarded && (
    <span className={styles.forwardedLabel}>
      {t("messages:actions.forwardedLabel")}
    </span>
  );
  // The quoted-reply block. On a normal text bubble it renders *inside* the
  // bubble (WhatsApp-style, tucked under the shared radius); a `sent`/`received`
  // variant recolors the accent so it reads on plum vs. paper. Emoji-only
  // bubbles have no surface to tuck it into, so it sits above them instead.
  const replyQuoteNode = message.replyTo && (
    <button
      type="button"
      className={[
        styles.replyQuote,
        isSent ? styles.replyQuoteSent : styles.replyQuoteReceived,
      ].join(" ")}
      disabled={message.replyTo.deleted}
      onClick={() =>
        !message.replyTo!.deleted && onJumpToMessage?.(message.replyTo!.id)
      }
    >
      <span className={styles.replyQuoteName}>
        {message.replyTo.senderName}
      </span>
      <span className={styles.replyQuoteSnippet}>
        {message.replyTo.deleted ? (
          t("messages:replyDeleted")
        ) : (
          <MentionText text={message.replyTo.snippet} />
        )}
      </span>
    </button>
  );

  // An uploaded document (PRD-226) renders as a file-card, never inline —
  // there are no pixels to preview. Rendered ahead of the gif/image branch for
  // the same "never fall through to text" reason as that branch's own note.
  // A restored outbox entry (page reload) whose local `blob:` preview was
  // stripped before persisting (mirrors the gif/image case below) falls
  // through to the same neutral "unavailable" stand-in.
  if (message.kind === "document") {
    const documentAttachment =
      message.attachment && isDocumentAttachment(message.attachment)
        ? message.attachment
        : null;
    return (
      <>
        {forwardedNode}
        {replyQuoteNode}
        {documentAttachment ? (
          <MessageDocumentAttachment attachment={documentAttachment} />
        ) : (
          <AttachmentPreviewUnavailable
            icon={<FiFile aria-hidden size={20} />}
            label={t("messages:attachments.documentPreviewUnavailable")}
          />
        )}
        {isLast && (
          <MessageMeta
            time={message.time}
            isSent={isSent}
            metaStatus={metaStatus}
            floating={false}
          />
        )}
      </>
    );
  }
  // A GIF or an uploaded image renders as an inline image (no text-bubble
  // chrome, like the emoji-only case) — visually identical either way, only
  // `kind` differs for copy/analytics. Rendered BEFORE the emoji/text branches
  // so neither ever falls through to text. Reply-quote/forwarded labels still
  // apply. The meta sits below (not floating), since neither has a coloured
  // bubble to tuck it into.
  if (
    (message.kind === "gif" || message.kind === "image") &&
    message.attachment &&
    !isDocumentAttachment(message.attachment)
  ) {
    const { url, width, height } = message.attachment;
    // Reserve the bubble's final box BEFORE the image decodes. The provider's
    // (or upload's) per-item dimensions are sometimes missing/zero, in which
    // case a plain 1:1 fallback keeps the jump small and predictable —
    // without it the bubble has no intrinsic height at all until decode,
    // which also nudges the resize-follow scroll (item 4) right after the
    // entrance has already played.
    const aspectRatio = width > 0 && height > 0 ? width / height : 1;
    const imageAlt =
      message.kind === "image"
        ? t("messages:attachments.imageAlt")
        : message.text;
    return (
      <>
        {forwardedNode}
        {replyQuoteNode}
        <img
          className={styles.gifBubble}
          src={url}
          width={width || undefined}
          height={height || undefined}
          style={{ aspectRatio: String(aspectRatio) }}
          loading="lazy"
          alt={imageAlt}
        />
        {isLast && (
          <MessageMeta
            time={message.time}
            isSent={isSent}
            metaStatus={metaStatus}
            floating={false}
          />
        )}
      </>
    );
  }
  // A restored outbox entry (page reload) whose local `blob:` preview was
  // stripped before persisting — see `outbox.ts`'s `stripDeadBlobPreview`.
  // `sendAttachment` still holds the real storage key for replay, but there's
  // nothing fetchable to paint, so render a neutral stand-in instead of an
  // `<img>` pointed at a dead object URL.
  if (
    (message.kind === "gif" || message.kind === "image") &&
    !message.attachment &&
    message.sendAttachment
  ) {
    return (
      <>
        {forwardedNode}
        {replyQuoteNode}
        <AttachmentPreviewUnavailable
          icon={<FiImage aria-hidden size={20} />}
          label={t("messages:attachments.previewUnavailable")}
        />
        {isLast && (
          <MessageMeta
            time={message.time}
            isSent={isSent}
            metaStatus={metaStatus}
            floating={false}
          />
        )}
      </>
    );
  }
  // The meta (time + status tick) rides only on the run's LAST bubble; grouped
  // bubbles above it keep their exact time reachable via each bubble's `title`.
  if (isEmojiOnly(message.text)) {
    return (
      <>
        {forwardedNode}
        {replyQuoteNode}
        <div
          className={[styles.emojiOnly, playEntrance && styles.bubbleEnter]
            .filter(Boolean)
            .join(" ")}
          title={message.time}
          aria-label={`${senderName}: ${message.text}`}
        >
          {message.text}
        </div>
        {isLast && (
          <MessageMeta
            time={message.time}
            isSent={isSent}
            metaStatus={metaStatus}
            floating={false}
          />
        )}
      </>
    );
  }
  return (
    <div
      className={[
        styles.bubble,
        isSent ? styles.sent : styles.received,
        playEntrance && styles.bubbleEnter,
        message.replyTo && styles.bubbleWithReply,
        index > 0 && styles.groupTop,
        index < lastIndex && styles.groupBottom,
        isLast && (isSent ? styles.tailSent : styles.tailReceived),
      ]
        .filter(Boolean)
        .join(" ")}
      title={message.time}
      aria-label={`${senderName}: ${message.text}`}
    >
      {forwardedNode}
      {replyQuoteNode}
      <MentionText text={message.text} renderText={renderWithLinks} />
      {isLast && (
        <MessageMeta
          time={message.time}
          isSent={isSent}
          metaStatus={metaStatus}
          floating
        />
      )}
    </div>
  );
}

/** Small pin/star indicators on a bubble: the SHARED pin (both participants see
 *  it) and the PRIVATE star (owner-only — the server sets `starred` for the
 *  viewer alone). Decorative glyphs with accessible labels. */
export function MessageMarks({
  pinned,
  starred,
}: {
  pinned: boolean;
  starred: boolean;
}) {
  const { t } = useTranslation();
  if (!pinned && !starred) return null;
  return (
    <span className={styles.messageMarks}>
      {pinned && (
        <span
          className={styles.messageMark}
          role="img"
          aria-label={t("messages:pinned.indicator")}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12.5 2.5 17.5 7.5M11 4 4 11l1 4 4 1 7-7M8 12l-4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
      {starred && (
        <span
          className={styles.messageMark}
          role="img"
          aria-label={t("messages:starred.indicator")}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 1.8l2.35 4.76 5.25.76-3.8 3.7.9 5.23L10 13.75l-4.7 2.48.9-5.23-3.8-3.7 5.25-.76z" />
          </svg>
        </span>
      )}
    </span>
  );
}
