import { FiX } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import styles from "./PoemReaderModal.module.css";

export interface PoemReaderTopBarProps {
  title: string;
  /** True once the h2 has scrolled away, so the bar carries the title. */
  isTitleShown: boolean;
  onClose: () => void;
}

/**
 * The reader's slim top bar. It sits above the scrolling poem, so Close stays
 * in reach however far down the poem is read. The title is a visual echo of
 * the h2 (screen readers already have the h2 and the dialog's name), so it is
 * hidden from assistive tech.
 */
export function PoemReaderTopBar({
  title,
  isTitleShown,
  onClose,
}: PoemReaderTopBarProps) {
  const { t } = useTranslation();
  return (
    <div className={cx(styles.bar, isTitleShown && styles.barScrolled)}>
      <p
        aria-hidden
        className={cx(styles.barTitle, isTitleShown && styles.barTitleShown)}
      >
        {title}
      </p>
      <button
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label={t("shared:modal.close")}
      >
        <FiX aria-hidden />
      </button>
    </div>
  );
}
