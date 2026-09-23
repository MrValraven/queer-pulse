import type { IconType } from "react-icons";
import {
  FiArchive,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiRefreshCw,
  FiSkipForward,
} from "react-icons/fi";
import { Button, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { FlagPlanEntry, PackStatus } from "./stickerBuilder.types";
import styles from "./StickerPublishReviewDialog.module.css";

const STATUS_ICON: Record<PackStatus, IconType> = {
  draft: FiEyeOff,
  published: FiEye,
  archived: FiArchive,
};

const STATUS_TONE_CLASS: Record<PackStatus, string | undefined> = {
  draft: styles.toneDraft,
  published: styles.tonePublished,
  archived: styles.toneArchived,
};

/**
 * One line saying who sees the new stickers and when, for the pack's status.
 * Shared by the publish bar and this dialog so both say it the same way.
 */
export function PackStatusNote({ status }: { status: PackStatus }) {
  const { t } = useTranslation();
  const StatusIcon = STATUS_ICON[status];
  return (
    <span className={[styles.statusNote, STATUS_TONE_CLASS[status]].join(" ")}>
      <StatusIcon className={styles.statusIcon} aria-hidden />
      <span>{t(`admin:stickerPacks.publish.statusHelper.${status}`)}</span>
    </span>
  );
}

/**
 * The last look before a run starts: what gets added, replaced and skipped,
 * which pack it lands in and who will see it, and the flags involved. Mount
 * it only while open, like every other `Modal`.
 */
export function StickerPublishReviewDialog({
  packName,
  packStatus,
  plan,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  packName: string;
  packStatus: PackStatus;
  plan: FlagPlanEntry[];
  /** The publish bar's own CTA label, so the button reads the same twice. */
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const addCount = plan.filter((entry) => entry.action === "add").length;
  const replaceCount = plan.filter(
    (entry) => entry.action === "replace",
  ).length;
  const skipCount = plan.filter((entry) => entry.action === "skip").length;
  const affectedEntries = plan.filter((entry) => entry.action !== "skip");
  const statusLabel = t(
    `admin:stickerPacks.status.${packStatus}`,
  ).toLocaleLowerCase();

  return (
    <Modal
      title={t("admin:stickerPacks.review.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("shared:confirmDialog.cancel")}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <ul className={styles.lines}>
        {addCount > 0 && (
          <li className={styles.line}>
            <FiPlus className={styles.lineIcon} aria-hidden />
            <span>
              {t("admin:stickerPacks.review.adding", { count: addCount })}
            </span>
          </li>
        )}
        {replaceCount > 0 && (
          <li className={styles.line}>
            <FiRefreshCw className={styles.lineIcon} aria-hidden />
            <span>
              {t("admin:stickerPacks.review.replacing", {
                count: replaceCount,
              })}{" "}
              <span className={styles.lineNote}>
                {t("admin:stickerPacks.review.replacingNote", {
                  count: replaceCount,
                })}
              </span>
            </span>
          </li>
        )}
        {skipCount > 0 && (
          <li className={[styles.line, styles.lineMuted].join(" ")}>
            <FiSkipForward className={styles.lineIcon} aria-hidden />
            <span>
              {t("admin:stickerPacks.review.skipping", { count: skipCount })}
            </span>
          </li>
        )}
      </ul>

      <div className={styles.target}>
        <p className={styles.targetLine}>
          {t("admin:stickerPacks.review.target", {
            pack: packName,
            status: statusLabel,
          })}
        </p>
        <PackStatusNote status={packStatus} />
      </div>

      <div className={styles.flags}>
        <h4 className={styles.flagsHeading}>
          {t("admin:stickerPacks.controls.flagsLegend")}
        </h4>
        <ul className={styles.flagList}>
          {affectedEntries.map((entry) => (
            <li key={entry.flagId} className={styles.flagChip}>
              {entry.action === "replace" && (
                <FiRefreshCw className={styles.flagChipIcon} aria-hidden />
              )}
              {t(`cards:flag.${entry.flagId}`)}
              {entry.action === "replace" && (
                <span className="visuallyHidden">
                  {" "}
                  {t("admin:stickerPacks.review.replacingTag")}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
