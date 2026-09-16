// src/features/messages/ReplyQuoteContent.tsx
import { useState } from "react";
import { FiFile, FiImage } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionText } from "../../shared/mentions/MentionText";
import type { ReplyQuoteSource } from "./replyQuoteSource";
import styles from "./MessagesPage.module.css";

/** The caller's own rules for the three text nodes: the bubble quote and the
 *  composer preview size and colour them differently. */
export interface ReplyQuoteClassNames {
  /** The column holding the name and snippet lines. Typed as a CSS-module
   *  lookup, which may be undefined. */
  text: string | undefined;
  name: string | undefined;
  snippet: string | undefined;
}

/** The inside of a reply quote, shared by the in-bubble quote and the
 *  composer's reply preview: the sender's name over a kind-aware snippet line
 *  (a photo/GIF kind label, a document's file name, the deleted copy, or the
 *  text with its mentions) and, for a photo or GIF, a small square thumbnail
 *  on the trailing side.
 *
 *  Returned as a fragment (text column, then thumbnail) so each caller keeps
 *  its own wrapper element and row layout. The label is plain text inside the
 *  quote, so a quote button's accessible name reads "sender Photo" or
 *  "sender lease.pdf"; the thumbnail and icons are decorative. */
export function ReplyQuoteContent({
  senderName,
  source,
  classNames,
}: {
  senderName: string;
  source: ReplyQuoteSource;
  classNames: ReplyQuoteClassNames;
}) {
  const { t } = useTranslation();
  const isMedia = source.kind === "image" || source.kind === "gif";
  let snippet;
  if (source.isDeleted) {
    snippet = t("messages:replyDeleted");
  } else if (isMedia) {
    snippet = (
      <>
        <FiImage aria-hidden className={styles.replyQuoteKindIcon} />
        {source.kind === "gif"
          ? t("messages:viewer.gifBadge")
          : t("messages:attachments.fallbackText")}
      </>
    );
  } else if (source.kind === "document") {
    snippet = (
      <>
        <FiFile aria-hidden className={styles.replyQuoteKindIcon} />
        {source.fileName ?? t("messages:attachments.documentFallbackText")}
      </>
    );
  } else {
    snippet = <MentionText text={source.text} />;
  }
  const thumbnailUrl =
    !source.isDeleted && isMedia ? source.thumbnailUrl : null;
  return (
    <>
      <span className={classNames.text}>
        <span className={classNames.name}>{senderName}</span>
        <span className={classNames.snippet}>{snippet}</span>
      </span>
      {thumbnailUrl && (
        // Keyed by URL so a new parent (the composer preview switching reply
        // targets) starts with a fresh error state.
        <ReplyQuoteThumbnail key={thumbnailUrl} url={thumbnailUrl} />
      )}
    </>
  );
}

/** A fixed-size square whose box is painted before the image decodes, so the
 *  quote never reflows when it arrives. A failed load removes the square and
 *  leaves the kind label to identify the parent on its own. */
function ReplyQuoteThumbnail({ url }: { url: string }) {
  const [hasFailed, setHasFailed] = useState(false);
  if (hasFailed) return null;
  return (
    <span className={styles.replyQuoteThumbnail}>
      <img
        src={url}
        alt=""
        decoding="async"
        draggable={false}
        onError={() => setHasFailed(true)}
      />
    </span>
  );
}
