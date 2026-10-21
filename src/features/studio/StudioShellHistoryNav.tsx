import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useDisplayMode } from "../../app/providers/displayModeContext";
import { IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioHistoryNav } from "./useStudioHistoryNav";
import styles from "./studio.module.css";

/**
 * The topbar's Back and Forward. Each stays focusable and reads
 * `aria-disabled` with nothing to go to, so a member who arrived from a
 * shared link is never sent out of QueerPulse, and the pair never shifts the
 * bar by appearing. At 480px and below the browser's own buttons take
 * over, except in the installed app, which keeps Back.
 */
export function StudioShellHistoryNav() {
  const { t } = useTranslation();
  const { canGoBack, canGoForward, goBack, goForward } = useStudioHistoryNav();
  // An installed app has no browser Back, so the smallest phones keep the
  // in-app Back there (studio.module.css).
  const { isInstalled } = useDisplayMode();
  return (
    <nav
      className={styles.navs}
      aria-label={t("studio:shell.historyLabel")}
      data-standalone={isInstalled || undefined}
    >
      <IconButton
        aria-label={t("studio:shell.back")}
        aria-disabled={!canGoBack || undefined}
        tooltip
        tooltipPlacement="bottom"
        className={styles.navButton}
        onClick={goBack}
      >
        <FiChevronLeft aria-hidden />
      </IconButton>
      <IconButton
        aria-label={t("studio:shell.forward")}
        aria-disabled={!canGoForward || undefined}
        tooltip
        tooltipPlacement="bottom"
        className={`${styles.navButton} ${styles.navForward}`}
        onClick={goForward}
      >
        <FiChevronRight aria-hidden />
      </IconButton>
    </nav>
  );
}
