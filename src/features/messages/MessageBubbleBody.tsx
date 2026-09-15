// src/features/messages/MessageBubbleBody.tsx
import { useRef, type ReactNode } from "react";
import { FiFile, FiImage } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionText } from "../../shared/mentions/MentionText";
import { isEmojiOnly } from "./messageRuns";
import { firstLinkUrl, renderWithLinks } from "./linkify";
import { hasPreviewContent, useLinkPreview } from "./api/useLinkPreview";
import { LinkPreview } from "./LinkPreview";
import { MessageMeta, type MetaStatus } from "./MessageSendStatus";
import { useBubbleMetaAlign } from "./useBubbleMetaAlign";
import {
  AttachmentPreviewUnavailable,
  MessageDocumentAttachment,
} from "./MessageDocumentAttachment";
import { isDocumentAttachment } from "../../shared/api/documentAttachment";
import { useChatImageViewer } from "./ChatImageViewerContext";
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
}: {
  message: ChatMessage;
  index: number;
  lastIndex: number;
  isSent: boolean;
  isLast: boolean;
  senderName: string;
  metaStatus: MetaStatus;
  onJumpToMessage?: (messageId: string) => void;
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
    return (
      <DocumentBubble
        message={message}
        isSent={isSent}
        metaStatus={metaStatus}
        forwardedNode={forwardedNode}
        replyQuoteNode={replyQuoteNode}
      />
    );
  }
  // A GIF or an uploaded image renders as an inline image (no text-bubble
  // chrome, like the emoji-only case) — visually identical either way, only
  // `kind` differs for copy/analytics. Rendered BEFORE the emoji/text branches
  // so neither ever falls through to text. Reply-quote/forwarded labels still
  // apply. The meta sits below (not floating), since neither has a coloured
  // bubble to tuck it into. Covers both a real attachment to paint AND a
  // restored outbox entry (page reload) whose local `blob:` preview was
  // stripped before persisting — see `outbox.ts`'s `stripDeadBlobPreview` —
  // which `ImageOrGifBubble` itself tells apart.
  if (
    (message.kind === "gif" || message.kind === "image") &&
    ((message.attachment && !isDocumentAttachment(message.attachment)) ||
      (!message.attachment && message.sendAttachment))
  ) {
    return (
      <ImageOrGifBubble
        message={message}
        senderName={senderName}
        isSent={isSent}
        metaStatus={metaStatus}
        forwardedNode={forwardedNode}
        replyQuoteNode={replyQuoteNode}
      />
    );
  }
  // Every bubble carries its own meta (time + status tick) — see the note at
  // `metaStatus` in MessageRun.tsx for why it cannot ride the last one alone.
  if (isEmojiOnly(message.text)) {
    return (
      <>
        {forwardedNode}
        {replyQuoteNode}
        <div
          className={styles.emojiOnly}
          title={message.time}
          aria-label={`${senderName}: ${message.text}`}
        >
          {message.text}
        </div>
        <MessageMeta
          time={message.time}
          isSent={isSent}
          metaStatus={metaStatus}
          floating={false}
        />
      </>
    );
  }
  return (
    <TextBubble
      message={message}
      index={index}
      lastIndex={lastIndex}
      isSent={isSent}
      isLast={isLast}
      senderName={senderName}
      metaStatus={metaStatus}
      forwardedNode={forwardedNode}
      replyQuoteNode={replyQuoteNode}
    />
  );
}

/** The optional caption riding alongside an image/gif or document attachment
 *  (WhatsApp-style: staged with the file in the composer, typed once, sent
 *  as ONE message — see `GifAttachment.caption`/`DocumentAttachment.caption`).
 *  Rendered exactly the way an ordinary text bubble renders its body — the
 *  same `MentionText`/`renderWithLinks` treatment, never a plain string — so
 *  an @mention or a URL in a caption behaves exactly like one anywhere else.
 *  Renders nothing at all when the sender wrote no caption, never an empty
 *  panel. Split out purely to keep `MessageBubbleBody` from growing further;
 *  it owns no state of its own. */
function AttachmentCaption({
  caption,
  isSent,
}: {
  caption: string | undefined;
  isSent: boolean;
}) {
  if (!caption) return null;
  return (
    <div
      className={[
        styles.attachmentCaption,
        isSent
          ? styles.attachmentCaptionSent
          : styles.attachmentCaptionReceived,
      ].join(" ")}
    >
      <MentionText text={caption} renderText={renderWithLinks} />
    </div>
  );
}

/** The `kind:"document"` bubble (PRD-226): the file-card, or — for a restored
 *  outbox entry whose blob was stripped — the neutral "unavailable" stand-in,
 *  plus its optional caption. Split out of `MessageBubbleBody` purely to keep
 *  that function under the line cap; it owns no state of its own. */
function DocumentBubble({
  message,
  isSent,
  metaStatus,
  forwardedNode,
  replyQuoteNode,
}: {
  message: ChatMessage;
  isSent: boolean;
  metaStatus: MetaStatus;
  forwardedNode: ReactNode;
  replyQuoteNode: ReactNode;
}) {
  const { t } = useTranslation();
  const documentAttachment =
    message.attachment && isDocumentAttachment(message.attachment)
      ? message.attachment
      : null;
  // A restored outbox entry keeps `sendAttachment` (the resend payload) even
  // once the blob preview above it is gone, so the caption survives right
  // alongside it — the words are still meaningful when the file card isn't.
  const documentCaption =
    documentAttachment?.caption ??
    (message.sendAttachment && isDocumentAttachment(message.sendAttachment)
      ? message.sendAttachment.caption
      : undefined);
  return (
    <>
      {forwardedNode}
      {replyQuoteNode}
      <div className={styles.attachmentGroup}>
        {documentAttachment ? (
          <MessageDocumentAttachment attachment={documentAttachment} />
        ) : (
          <AttachmentPreviewUnavailable
            icon={<FiFile aria-hidden size={20} />}
            label={t("messages:attachments.documentPreviewUnavailable")}
          />
        )}
        <AttachmentCaption caption={documentCaption} isSent={isSent} />
      </div>
      <MessageMeta
        time={message.time}
        isSent={isSent}
        metaStatus={metaStatus}
        floating={false}
      />
    </>
  );
}

/** The `kind:"gif"`/`kind:"image"` bubble: either the live inline photo (a
 *  real attachment to paint) or, for a restored outbox entry whose local
 *  `blob:` preview was stripped before persisting, the neutral "unavailable"
 *  stand-in — both share the same attachment-group wrapper and caption
 *  treatment, so they live in one component instead of two near-identical
 *  branches. Split out of `MessageBubbleBody` purely to keep that function
 *  under the line cap; it owns no state of its own. */
function ImageOrGifBubble({
  message,
  senderName,
  isSent,
  metaStatus,
  forwardedNode,
  replyQuoteNode,
}: {
  message: ChatMessage;
  senderName: string;
  isSent: boolean;
  metaStatus: MetaStatus;
  forwardedNode: ReactNode;
  replyQuoteNode: ReactNode;
}) {
  const { t } = useTranslation();
  const attachment =
    message.attachment && !isDocumentAttachment(message.attachment)
      ? message.attachment
      : null;
  // A restored outbox entry keeps `sendAttachment` (the resend payload) even
  // once the blob preview above it is gone, so the caption survives right
  // alongside it — the words are still meaningful when the picture isn't.
  const sendAttachment =
    message.sendAttachment && !isDocumentAttachment(message.sendAttachment)
      ? message.sendAttachment
      : null;
  const caption = attachment?.caption ?? sendAttachment?.caption;
  let media: ReactNode;
  if (attachment) {
    const { url, width, height } = attachment;
    // Reserve the bubble's final box BEFORE the image decodes. The provider's
    // (or upload's) per-item dimensions are sometimes missing/zero, in which
    // case a plain 1:1 fallback keeps the jump small and predictable —
    // without it the bubble has no intrinsic height at all until decode,
    // which also nudges the resize-follow scroll right after the entrance
    // has already played.
    const aspectRatio = width > 0 && height > 0 ? width / height : 1;
    const imageAlt =
      message.kind === "image"
        ? t("messages:attachments.imageAlt")
        : message.text;
    media = (
      <PhotoBubbleImage
        message={message}
        senderName={senderName}
        url={url}
        width={width}
        height={height}
        aspectRatio={aspectRatio}
        imageAlt={imageAlt}
      />
    );
  } else {
    media = (
      <AttachmentPreviewUnavailable
        icon={<FiImage aria-hidden size={20} />}
        label={t("messages:attachments.previewUnavailable")}
      />
    );
  }
  return (
    <>
      {forwardedNode}
      {replyQuoteNode}
      <div className={styles.attachmentGroup}>
        {media}
        <AttachmentCaption caption={caption} isSent={isSent} />
      </div>
      <MessageMeta
        time={message.time}
        isSent={isSent}
        metaStatus={metaStatus}
        floating={false}
      />
    </>
  );
}

/** The ordinary text bubble: the coloured surface, the link-unfurl panel (when
 *  the body contains a link), the body text, and — on a run's last bubble —
 *  the meta floated into its bottom-right (or, for a card-only bubble, tucked
 *  below the panel instead — see the `shouldRenderText` gate below).
 *
 *  Its own component (not inlined in `MessageBubbleBody`) because it is the one
 *  body that MEASURES itself: `useBubbleMetaAlign` reads the laid-out line
 *  count to decide whether the time sits centred on a single text line or
 *  tucked flush into a multi-line bubble's corner, and the hook belongs with
 *  the branch that actually mounts the two nodes it reads. It also owns the
 *  unfurl: `useLinkPreview` needs the message text to find a link in, so the
 *  hook call lives here rather than upstream in `MessageBubble`. */
function TextBubble({
  message,
  index,
  lastIndex,
  isSent,
  isLast,
  senderName,
  metaStatus,
  forwardedNode,
  replyQuoteNode,
}: {
  message: ChatMessage;
  index: number;
  lastIndex: number;
  isSent: boolean;
  isLast: boolean;
  senderName: string;
  metaStatus: MetaStatus;
  forwardedNode: ReactNode;
  replyQuoteNode: ReactNode;
}) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const previewUrl = firstLinkUrl(message.text);
  const { data: previewData, isLoading: isPreviewLoading } =
    useLinkPreview(previewUrl);
  // "Link-only": the whole message, trimmed, IS the matched link — nothing
  // else to read. Compared against the raw (un-normalized) text too, since
  // `firstLinkUrl` upgrades a bare `www.` host to an `https://` href and a
  // literal `===` against that normalized form would miss the common
  // "www.example.com" case.
  const trimmedText = message.text.trim();
  const isLinkOnlyMessage =
    !!previewUrl &&
    (trimmedText === previewUrl || `https://${trimmedText}` === previewUrl);
  // Only drop the text once the preview has genuinely resolved to something —
  // never mid-flight (the link would vanish with nothing to replace it yet)
  // and never for an empty/failed unfurl (the link stays the only content).
  const isPreviewResolved = !isPreviewLoading && hasPreviewContent(previewData);
  const shouldRenderText = !(isLinkOnlyMessage && isPreviewResolved);
  const metaAlign = useBubbleMetaAlign({
    bubbleRef,
    textRef,
    enabled: shouldRenderText,
    signal: message.text,
  });
  return (
    <div
      className={[
        styles.bubble,
        isSent ? styles.sent : styles.received,
        message.replyTo && styles.bubbleWithReply,
        index > 0 && styles.groupTop,
        index < lastIndex && styles.groupBottom,
        isLast && (isSent ? styles.tailSent : styles.tailReceived),
      ]
        .filter(Boolean)
        .join(" ")}
      title={message.time}
      aria-label={`${senderName}: ${message.text}`}
      ref={bubbleRef}
    >
      {forwardedNode}
      {replyQuoteNode}
      {previewUrl && (
        <LinkPreview
          url={previewUrl}
          data={previewData}
          isLoading={isPreviewLoading}
          isSent={isSent}
        />
      )}
      {shouldRenderText && (
        // Inline wrapper (no styles of its own) so the body's line boxes are
        // measurable on their own — `getClientRects()` on it is the line count
        // the floating meta's vertical position depends on.
        <span ref={textRef}>
          <MentionText text={message.text} renderText={renderWithLinks} />
        </span>
      )}
      <MessageMeta
        time={message.time}
        isSent={isSent}
        metaStatus={metaStatus}
        floating={shouldRenderText}
        // A text bubble's meta always sits ON the coloured bubble surface —
        // even the card-only case (`shouldRenderText` false, nothing to
        // float into), unlike the page-surface callers below. See
        // `MessageMeta`'s doc for why this is separate from `floating`.
        isOnBubbleSurface
        align={metaAlign}
      />
    </div>
  );
}

/** The tappable image inside a photo/GIF bubble: a keyboard-reachable
 *  `<span role="button">` wrapping the `<img>`. Deliberately a span, not a
 *  `<button>`: a real button is treated as an interactive target by
 *  `isInteractiveTarget` in `useMessageGestures`, which would suppress
 *  long-press, right-click and swipe-to-reply on every photo bubble.
 *
 *  No `onClick` here on purpose. Pointer/touch/mouse activation already flows
 *  through the bubble wrap's `onActivate` (see `MessageBubble`), which is the
 *  path that correctly arbitrates against swipe-to-reply and long-press; a
 *  click handler on this span would fire a SECOND time for the same physical
 *  tap, since nothing on the pointer path calls `preventDefault()` to stop
 *  the synthesized click. Keyboard activation is `onKeyDown` alone, which
 *  never goes through the pointer path, so it stays exactly one call.
 *
 *  Split out of `MessageBubbleBody` purely to keep that function under the
 *  line cap; it owns no state beyond the viewer context it reads. */
function PhotoBubbleImage({
  message,
  senderName,
  url,
  width,
  height,
  aspectRatio,
  imageAlt,
}: {
  message: ChatMessage;
  senderName: string;
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
  imageAlt: string;
}) {
  const { t } = useTranslation();
  const { openImage } = useChatImageViewer();
  return (
    <span
      className={styles.photoOpener}
      role="button"
      tabIndex={0}
      // How the pointer path finds this exact node to animate the viewer out
      // of (see `MessageBubble`). A marker rather than a `querySelector("img")`
      // hop: a bubble can carry other images (a reply preview, a link unfurl
      // card), and picking the wrong one would fly the photo to the wrong box
      // with no type error and nothing failing.
      data-photo-opener=""
      aria-label={t("messages:viewer.open", { sender: senderName })}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        openImage(message, event.currentTarget);
      }}
    >
      <img
        className={styles.gifBubble}
        src={url}
        width={width || undefined}
        height={height || undefined}
        style={{ aspectRatio: String(aspectRatio) }}
        loading="lazy"
        alt={imageAlt}
      />
    </span>
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
