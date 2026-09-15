import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { hasPreviewContent } from "./api/useLinkPreview";
import type { LinkPreviewResponse } from "../../shared/contracts/contracts";
import styles from "./LinkPreview.module.css";

interface LinkPreviewProps {
  /** The first http(s) URL detected in the message body (already normalized) —
   *  the card's own href, and the fallback accessible-name source. */
  url: string;
  /** The resolved unfurl card for `url`, or `undefined` while it's still
   *  loading (see `isLoading`) or hasn't been requested. Resolution now lives
   *  with the caller (`TextBubble`'s `useLinkPreview(previewUrl)`), since the
   *  caller also needs to know whether a preview resolved to decide whether to
   *  keep showing the message text. */
  data: LinkPreviewResponse | undefined;
  /** True while the parent's `useLinkPreview` query is in flight. */
  isLoading: boolean;
  /** True on the current user's own outgoing (plum) bubble — recolors the
   *  panel's accent so it reads under plum vs. paper, mirroring the
   *  reply-quote pattern. */
  isSent: boolean;
}

/**
 * A compact unfurl panel rendered INSIDE a message bubble for the first link in
 * its body — an inner panel styled off the same vocabulary as the reply-quote
 * block, not a detached card. Purely presentational: resolution, caching and
 * dual-mode all live in the caller's `useLinkPreview`. Graceful states:
 *  - loading  → a slim full-width skeleton (no layout jump when it resolves);
 *  - empty / error / un-previewable URL → renders NOTHING (never a broken panel).
 */
export function LinkPreview({
  url,
  data,
  isLoading,
  isSent,
}: LinkPreviewProps) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);

  // Slim placeholder while the unfurl is in flight (live mode only — demo
  // resolves synchronously). Kept intentionally minimal so it never dominates.
  if (isLoading) {
    return <div className={styles.skeleton} aria-hidden="true" />;
  }

  if (!hasPreviewContent(data)) return null;

  const { title, description, siteName, imageUrl } = data;
  const showImage = !!imageUrl && !imageFailed;
  const accessibleName = title
    ? t("messages:linkPreview.aria", { title })
    : t("messages:linkPreview.ariaGeneric", { site: siteName ?? url });

  return (
    <a
      className={[
        styles.card,
        isSent ? styles.cardSent : styles.cardReceived,
      ].join(" ")}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleName}
    >
      {showImage && (
        <img
          className={styles.thumb}
          src={imageUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      )}
      <span className={styles.body}>
        {siteName && <span className={styles.site}>{siteName}</span>}
        {title && <span className={styles.title}>{title}</span>}
        {description && <span className={styles.desc}>{description}</span>}
      </span>
    </a>
  );
}
