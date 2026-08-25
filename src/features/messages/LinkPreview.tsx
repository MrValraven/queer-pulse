import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { hasPreviewContent, useLinkPreview } from "./api/useLinkPreview";
import styles from "./LinkPreview.module.css";

interface LinkPreviewProps {
  /** The first http(s) URL detected in the message body (already normalized). */
  url: string;
  /** True on the current user's own outgoing (plum) bubble — recolors the card's
   *  accent so it reads under plum vs. paper, mirroring the reply-quote pattern. */
  isSent: boolean;
}

/**
 * A compact unfurl card rendered beneath a message bubble for the first link in
 * its body. The card is itself a real link (opens the URL in a new tab via the
 * app's normal new-tab link handling). Graceful states:
 *  - loading  → a slim skeleton (no layout jump when the card resolves);
 *  - empty / error / un-previewable URL → renders NOTHING (never a broken card).
 * Dual-mode + reduced-motion are owned by `useLinkPreview` and the CSS.
 */
export function LinkPreview({ url, isSent }: LinkPreviewProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useLinkPreview(url);
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
