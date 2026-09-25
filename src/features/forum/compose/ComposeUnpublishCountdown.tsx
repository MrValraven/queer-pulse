import { FiRotateCcw } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ComposeSuccessPanel.module.css";

/** The Unpublish pill and the window draining behind it. When the window
 *  lapses it folds away, and the rows below glide up to close the gap. */
export function ComposeUnpublishCountdown({
  isOpen,
  secondsLeft,
  totalSeconds,
  onUnpublish,
}: {
  isOpen: boolean;
  secondsLeft: number;
  totalSeconds: number;
  onUnpublish: () => void;
}) {
  const { t } = useTranslation();
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const remainingRatio = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  return (
    <Collapse isOpen={isOpen}>
      <button type="button" className={styles.unpublish} onClick={onUnpublish}>
        <FiRotateCcw aria-hidden />
        {t("forum:composePage.success.unpublish")}
        <i aria-hidden>{`${minutes}:${seconds}`}</i>
        <span
          className={styles.unpublishTrack}
          style={{ transform: `scaleX(${remainingRatio})` }}
          aria-hidden
        />
      </button>
    </Collapse>
  );
}
