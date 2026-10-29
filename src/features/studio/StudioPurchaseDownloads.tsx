import { useState } from "react";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioBuyerPurchaseView,
  StudioPurchaseDownloadTrackView,
} from "./api/studioPurchases.adapters";
import { useStudioPurchaseDownload } from "./api/useStudioPurchaseMutations";
import {
  STUDIO_ERROR_MESSAGE_KEY,
  studioErrorMessageKeyOf,
} from "./studioErrors.data";
import styles from "./StudioPurchaseDownloads.module.css";

interface DownloadRowProps {
  track: StudioPurchaseDownloadTrackView;
  isBusy: boolean;
  onDownload: (trackId: string) => Promise<void>;
}

/** One track: its position, title, length and format, then either the
 *  Download button or the line naming why the file is not available. A
 *  failed download names its reason under this row only. */
function StudioPurchaseDownloadRow({
  track,
  isBusy,
  onDownload,
}: DownloadRowProps) {
  const { t } = useTranslation();
  const [failure, setFailure] = useState<{ messageKey: string } | null>(null);
  const [isFailureShown, setIsFailureShown] = useState(false);
  const start = async () => {
    if (isBusy) return;
    setIsFailureShown(false);
    try {
      await onDownload(track.trackId);
    } catch (error) {
      setFailure({ messageKey: studioErrorMessageKeyOf(error, "save") });
      setIsFailureShown(true);
    }
  };
  const metaParts = [
    track.durationLabel,
    track.format ? t(`studio:purchase.downloads.${track.format}`) : null,
  ].filter((part): part is string => part !== null);
  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        <span className={styles.position}>{track.position}</span>
        <span className={styles.trackText}>
          <span className={styles.title}>{track.title}</span>
          {metaParts.length > 0 && (
            <span className={styles.meta}>
              {metaParts.map((part) => (
                <span key={part}>{part}</span>
              ))}
            </span>
          )}
        </span>
        {track.unavailableReason === null && (
          <span className={styles.action}>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("studio:purchase.downloads.ctaAria", {
                title: track.title,
              })}
              aria-busy={isBusy || undefined}
              aria-disabled={isBusy || undefined}
              onClick={() => void start()}
            >
              {t("studio:purchase.downloads.cta")}
            </Button>
          </span>
        )}
      </div>
      {track.unavailableReason !== null && (
        <p className={styles.refusal}>
          {t(STUDIO_ERROR_MESSAGE_KEY[track.unavailableReason])}
        </p>
      )}
      <Collapse isOpen={isFailureShown}>
        <p role="alert" className={styles.failure}>
          {failure !== null &&
            `${t("studio:purchase.downloads.failed")}. ${t(failure.messageKey)}`}
        </p>
      </Collapse>
    </li>
  );
}

/** The download list of a purchase: the format note, one row per track and
 *  the "nothing yet" line when the server sent no rows. Each unavailable row
 *  names its own reason (withheld, taken down, artist unavailable, no audio
 *  yet, still being prepared after an unlink). */
export function StudioPurchaseDownloads({
  purchase,
  headingLevel = 3,
  isStudioContext = true,
}: {
  purchase: StudioBuyerPurchaseView;
  headingLevel?: 3 | 4;
  /** True inside StudioShell (the default), where the heading follows the
   *  shell's text role; the account page passes false for app-wide tokens. */
  isStudioContext?: boolean;
}) {
  const { t } = useTranslation();
  const { download, busyTrackKeys } = useStudioPurchaseDownload();
  const Heading = headingLevel === 3 ? "h3" : "h4";
  const hasTracks = purchase.downloads.length > 0;
  return (
    <section className={styles.downloads}>
      <Heading
        className={
          isStudioContext
            ? `${styles.heading} ${styles.headingStudio}`
            : styles.heading
        }
      >
        {t("studio:purchase.downloads.heading")}
      </Heading>
      <Collapse isOpen={!hasTracks}>
        <p className={styles.empty}>{t("studio:purchase.downloads.none")}</p>
      </Collapse>
      <Collapse isOpen={hasTracks}>
        <p className={styles.formatNote}>
          {t("studio:purchase.downloads.formatNote")}
        </p>
        <ol
          className={styles.list}
          aria-label={t("studio:purchase.downloads.listLabel", {
            title: purchase.item.title,
          })}
        >
          {purchase.downloads.map((track) => (
            <StudioPurchaseDownloadRow
              key={track.trackId}
              track={track}
              isBusy={busyTrackKeys.has(`${purchase.id}:${track.trackId}`)}
              onDownload={(trackId) => download(purchase.id, trackId)}
            />
          ))}
        </ol>
      </Collapse>
    </section>
  );
}
