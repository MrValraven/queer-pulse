import { FiSliders } from "react-icons/fi";
import { useFormat } from "../../i18n/format";
import { useTranslation } from "../../i18n/useTranslation";
import { AnimatedCountBadge } from "./AnimatedCountBadge";
import styles from "./FilterPage.module.css";

/** The button's flex gap (`.filtersBtn`), which the badge slot swallows
 *  while it is closed. */
const FILTERS_BUTTON_GAP_PX = 8;

interface FiltersToggleButtonProps {
  isMobile: boolean;
  isPanelOpen: boolean;
  /** Desktop: shows or hides the sidebar. */
  onTogglePanel: () => void;
  /** Mobile: opens `FiltersSheet`. */
  onOpenSheet: () => void;
  /** How many filters are applied; a rolling badge shows when > 0. */
  activeCount: number;
}

/** The "Filters" / "Hide filters" button. On desktop it toggles the sidebar
 *  (and reports `aria-expanded`); on mobile it opens the filters sheet. A
 *  page passes it as `FilterResultsTop`'s `filtersButton`, and passes
 *  nothing there while its sidebar is unavailable. */
export function FiltersToggleButton({
  isMobile,
  isPanelOpen,
  onTogglePanel,
  onOpenSheet,
  activeCount,
}: FiltersToggleButtonProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <button
      type="button"
      className={styles.filtersBtn}
      aria-expanded={isMobile ? undefined : isPanelOpen}
      onClick={isMobile ? onOpenSheet : onTogglePanel}
    >
      <FiSliders aria-hidden />
      {!isMobile && isPanelOpen
        ? t("shared:filterPage.hideFiltersCta")
        : t("shared:filterPage.filtersCta")}
      <AnimatedCountBadge
        count={activeCount}
        label={fmt.number(activeCount)}
        slotClassName={styles.filtersBtnCountSlot}
        badgeClassName={styles.filtersBtnCount}
        hostGap={FILTERS_BUTTON_GAP_PX}
      />
    </button>
  );
}
