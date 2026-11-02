import { FiClock } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import { Collapse } from "./Collapse";
import styles from "./UploadWaitNote.module.css";

interface UploadWaitNoteProps {
  /** True while a photo is preparing or uploading. Flipping it folds the
   *  note in or out. */
  isShown: boolean;
  /** Spacing for the note itself, applied inside the fold so a closed note
   *  takes up no room. */
  className?: string;
}

/**
 * The "photos can take up to a minute, please wait" line shown beside an
 * upload control while a photo is on its way up. The prep step and a slow
 * connection can hold the progress still for a while, and members who saw
 * nothing happen were adding the same photo two or three times. The live
 * region stays mounted so screen readers announce the text when it folds in.
 */
export function UploadWaitNote({ isShown, className }: UploadWaitNoteProps) {
  const { t } = useTranslation();
  return (
    <div role="status">
      <Collapse isOpen={isShown}>
        <div className={[styles.note, className].filter(Boolean).join(" ")}>
          <FiClock className={styles.icon} size={14} aria-hidden />
          <span>{t("shared:upload.waitNote")}</span>
        </div>
      </Collapse>
    </div>
  );
}
