import { useId } from "react";
import { m } from "motion/react";
import { FiClock, FiShield, FiUser } from "react-icons/fi";
import { RefineGroup, useRefineGlide } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./LocalFilterBar.module.css";

/**
 * The one-tap narrowings, side by side: is it open right now, has it been
 * verified as a safe space, and do women own and run it. Each chip names
 * itself, so the group only needs a name for the set as a whole.
 */
export function LocalQuickFilters({
  openNow,
  onToggleOpenNow,
  safeOnly,
  onToggleSafeOnly,
  womenOwnedOnly,
  onToggleWomenOwnedOnly,
}: {
  openNow: boolean;
  onToggleOpenNow: () => void;
  safeOnly: boolean;
  onToggleSafeOnly: () => void;
  womenOwnedOnly: boolean;
  onToggleWomenOwnedOnly: () => void;
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
        <m.button
          {...glide.chip}
          type="button"
          aria-pressed={womenOwnedOnly}
          className={[s.chip, womenOwnedOnly && s.chipOn]
            .filter(Boolean)
            .join(" ")}
          onClick={onToggleWomenOwnedOnly}
        >
          <FiUser aria-hidden />
          {t("marketing:local.filter.womenOwned")}
        </m.button>
      </m.div>
    </RefineGroup>
  );
}
