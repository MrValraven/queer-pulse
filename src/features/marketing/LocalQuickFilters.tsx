import { useId } from "react";
import { m } from "motion/react";
import { FiClock, FiShield } from "react-icons/fi";
import { RefineGroup, useRefineGlide } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LocalChipCounts } from "./useDirectoryFilters";
import s from "./LocalFilterBar.module.css";

/**
 * The two one-tap narrowings, side by side: is it open right now, and has it
 * been verified as a safe space. Each chip names itself, so the group only
 * needs a name for the set as a whole.
 */
export function LocalQuickFilters({
  showOpenNow = true,
  openNow,
  onToggleOpenNow,
  safeOnly,
  onToggleSafeOnly,
  chipCounts,
  isLoadedSetComplete,
}: {
  /** Off on the Online tab, where no business keeps opening hours. */
  showOpenNow?: boolean;
  openNow: boolean;
  onToggleOpenNow: () => void;
  safeOnly: boolean;
  onToggleSafeOnly: () => void;
  /** How many loaded places each chip would leave if turned on. */
  chipCounts: LocalChipCounts;
  /** True once every page of places has loaded, so a zero count is final. */
  isLoadedSetComplete: boolean;
}) {
  const { t } = useTranslation();
  const quickLabelId = useId();
  // Inside the Refine drawer the chips glide to their new places as the
  // drawer's content shifts; in the mobile sheet the glide stays still.
  const glide = useRefineGlide();
  // A chip that would empty the list goes unpickable, once the whole set has
  // loaded and so the zero is final. A chip that is on stays clickable, so it
  // can always be turned back off.
  const isOpenNowDisabled =
    isLoadedSetComplete && !openNow && chipCounts.openNow === 0;
  const isSafeOnlyDisabled =
    isLoadedSetComplete && !safeOnly && chipCounts.safe === 0;

  return (
    <RefineGroup
      label={t("marketing:local.filter.quickFiltersLabel")}
      labelId={quickLabelId}
      role="group"
      aria-labelledby={quickLabelId}
    >
      <m.div {...glide.row} className={s.safeRow}>
        {showOpenNow && (
          <m.button
            {...glide.chip}
            type="button"
            aria-pressed={openNow}
            disabled={isOpenNowDisabled}
            className={[s.chip, openNow && s.chipOn].filter(Boolean).join(" ")}
            onClick={onToggleOpenNow}
          >
            <FiClock aria-hidden />
            {t("marketing:local.filter.openNow")}
          </m.button>
        )}
        <m.button
          {...glide.chip}
          type="button"
          aria-pressed={safeOnly}
          disabled={isSafeOnlyDisabled}
          className={[s.chip, safeOnly && s.chipOn].filter(Boolean).join(" ")}
          onClick={onToggleSafeOnly}
        >
          <FiShield aria-hidden />
          {t("marketing:local.filter.verifiedSafeSpaces")}
        </m.button>
      </m.div>
    </RefineGroup>
  );
}
