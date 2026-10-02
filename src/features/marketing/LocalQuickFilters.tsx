import { useId } from "react";
import { m } from "motion/react";
import { FiClock, FiShield } from "react-icons/fi";
import { RefineGroup, useRefineGlide } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
}: {
  /** Off on the Online tab, where no business keeps opening hours. */
  showOpenNow?: boolean;
  openNow: boolean;
  onToggleOpenNow: () => void;
  safeOnly: boolean;
  onToggleSafeOnly: () => void;
}) {
  const { t } = useTranslation();
  const quickLabelId = useId();
  // Inside the Refine drawer the chips glide to their new places as the
  // drawer's content shifts; in the mobile sheet the glide stays still.
  const glide = useRefineGlide();

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
