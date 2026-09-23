import { useId } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StickerPublishProgress } from "./useStickerPublish";
import styles from "./stickerBuilder.module.css";

/** The publish button, its progress line, and the failure notice naming any
 *  flags that did not land. Split out of the page so the page's own component
 *  stays under the 200-line cap. */
export function StickerPublishPanel({
  isPackSelected,
  hasSelectedFlags,
  isPublishing,
  progress,
  failedFlagIds,
  onPublish,
}: {
  isPackSelected: boolean;
  hasSelectedFlags: boolean;
  isPublishing: boolean;
  progress: StickerPublishProgress | null;
  failedFlagIds: string[];
  onPublish: () => void;
}) {
  const { t } = useTranslation();
  const blockedReasonId = useId();
  // Say out loud why the button is off, so nobody has to hover to find out.
  const blockedReason = isPublishing
    ? null
    : !isPackSelected
      ? t("admin:stickerPacks.publish.needsPack")
      : !hasSelectedFlags
        ? t("admin:stickerPacks.publish.needsFlags")
        : null;

  return (
    <>
      <div className={styles.publishRow}>
        <Button
          variant="primary"
          disabled={!isPackSelected || !hasSelectedFlags || isPublishing}
          aria-describedby={blockedReason ? blockedReasonId : undefined}
          onClick={onPublish}
        >
          {isPublishing
            ? t("admin:stickerPacks.publish.publishing")
            : t("admin:stickerPacks.publish.publishCta")}
        </Button>
        {progress && (
          <p className={styles.progressNote} role="status">
            {t("admin:stickerPacks.publish.progress", {
              done: progress.done,
              total: progress.total,
            })}
          </p>
        )}
      </div>

      {blockedReason && (
        <p id={blockedReasonId} className={styles.blockedNote}>
          {blockedReason}
        </p>
      )}

      {failedFlagIds.length > 0 && (
        <p className={styles.failureNotice} role="alert">
          {t("admin:stickerPacks.publish.failure", {
            flags: failedFlagIds
              .map((flagId) => t(`cards:flag.${flagId}`))
              .join(", "),
          })}
        </p>
      )}
    </>
  );
}
