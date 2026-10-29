import { FiArrowLeft, FiEye } from "react-icons/fi";
import { IconButton } from "../../shared/components/ui/IconButton";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./DirectoryVisitorViewBar.module.css";

/** One bar per page, so a fixed id is safe. */
const LABEL_ID = "directory-visitor-view-bar-label";

/**
 * The slim plum strip shown while a moderator or an owner previews the listing
 * as a visitor. It replaces the moderator and owner bands for as long as the
 * preview lasts, says what the page is showing, and carries the one control
 * that leaves it.
 */
export function DirectoryVisitorViewBar({
  onExitVisitorView,
}: {
  onExitVisitorView: () => void;
}) {
  const { t } = useTranslation();
  const exitLabel = t("marketing:directory.detail.visitorView.exit");
  return (
    <section className={styles.bar} aria-labelledby={LABEL_ID}>
      <div className={styles.inner}>
        <span className={styles.label} id={LABEL_ID}>
          <FiEye className={styles.labelIcon} aria-hidden />
          {t("marketing:directory.detail.visitorView.label")}
        </span>
        <IconButton
          tone="dark"
          size="sm"
          aria-label={exitLabel}
          tooltip
          onClick={onExitVisitorView}
        >
          <FiArrowLeft aria-hidden />
        </IconButton>
      </div>
    </section>
  );
}
