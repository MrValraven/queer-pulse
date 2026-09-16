import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { hasPreviewContent } from "./api/useLinkPreview";
import { linkSafetyReasonsLabel } from "./linkSafetyCopy";
import { OpenExternalConfirmDialog } from "./OpenExternalConfirmDialog";
import { useLinkSafetyGuard } from "./useLinkSafetyGuard";
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
  // PRD-371: the whole card is one big anchor, so the guard's click-intercept
  // goes on it directly — same suspicious-link check `linkify.tsx` applies to
  // an inline URL, since an unfurled card is just a richer rendering of the
  // same href.
  const {
    isSuspicious,
    reasons,
    displayHost,
    isConfirmOpen,
    handleAnchorClick,
    openAnyway,
    cancel,
  } = useLinkSafetyGuard(url);

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
    <>
      <a
        className={[
          styles.card,
          isSent ? styles.cardSent : styles.cardReceived,
        ].join(" ")}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={accessibleName}
        onClick={handleAnchorClick}
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
          {isSuspicious && (
            <span className={styles.suspiciousNote}>
              <FiAlertTriangle aria-hidden />
              {linkSafetyReasonsLabel(reasons, t)}
            </span>
          )}
        </span>
      </a>
      {isSuspicious && (
        <OpenExternalConfirmDialog
          open={isConfirmOpen}
          onClose={cancel}
          onConfirm={openAnyway}
          title={t("messages:link.confirmTitle")}
        >
          <p>{t("messages:link.confirmDestination", { host: displayHost })}</p>
          <p>{linkSafetyReasonsLabel(reasons, t)}</p>
        </OpenExternalConfirmDialog>
      )}
    </>
  );
}
