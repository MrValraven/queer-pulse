// src/features/messages/AttachmentUploadProgress.tsx
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AttachmentUploadProgress.module.css";

/**
 * A real, labelled `role="progressbar"` for one staged item's in-flight
 * upload (DES-199), shared by the caption screen's big stage view and the
 * compact post-send pending-uploads strip, so both report progress the same
 * accessible way rather than a bare percentage in a `<span>`.
 *
 * `label` (the file name for a document, a generic "Photo"/"GIF" otherwise)
 * is the progress bar's accessible NAME and stays fixed for its whole
 * lifetime; the percent lives only in `aria-valuetext`, which a screen
 * reader announces as a VALUE change on the same control rather than as a
 * newly-appearing element with a different name on every tick.
 */
export function AttachmentUploadProgress({
  percent,
  label,
  compact = false,
}: {
  percent: number;
  label: string;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      className={[styles.track, compact && styles.compact]
        .filter(Boolean)
        .join(" ")}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={t("messages:attachments.uploadingProgress", {
        percent: clamped,
      })}
      aria-label={label}
    >
      <div className={styles.fill} style={{ width: `${clamped}%` }} />
    </div>
  );
}
