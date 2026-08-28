import { useId } from "react";
import { FiClock, FiShield } from "react-icons/fi";
import { RefineGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./LocalFilterBar.module.css";

/**
 * The two one-tap narrowings, side by side: is it open right now, and has it
 * been verified as a safe space. Each chip names itself, so the group only
 * needs a name for the set as a whole.
 */
export function LocalQuickFilters({
  openNow,
  onToggleOpenNow,
  safeOnly,
  onToggleSafeOnly,
}: {
  openNow: boolean;
  onToggleOpenNow: () => void;
  safeOnly: boolean;
  onToggleSafeOnly: () => void;
}) {
  const { t } = useTranslation();
  const quickLabelId = useId();

  return (
    <RefineGroup
      label={t("marketing:local.filter.quickFiltersLabel")}
      labelId={quickLabelId}
      role="group"
      aria-labelledby={quickLabelId}
    >
      <div className={s.safeRow}>
        <button
          type="button"
          aria-pressed={openNow}
          className={[s.chip, openNow && s.chipOn].filter(Boolean).join(" ")}
          onClick={onToggleOpenNow}
        >
          <FiClock aria-hidden />
          {t("marketing:local.filter.openNow")}
        </button>
        <button
          type="button"
          aria-pressed={safeOnly}
          className={[s.chip, safeOnly && s.chipOn].filter(Boolean).join(" ")}
          onClick={onToggleSafeOnly}
        >
          <FiShield aria-hidden />
          {t("marketing:local.filter.verifiedSafeSpaces")}
        </button>
      </div>
    </RefineGroup>
  );
}
