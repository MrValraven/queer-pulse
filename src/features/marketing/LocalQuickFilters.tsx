import { useId } from "react";
import { m } from "motion/react";
import { FiClock, FiEye, FiNavigation, FiShield } from "react-icons/fi";
import { RefineGroup, useRefineGlide } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LocalChipCounts } from "./useDirectoryFilters";
import s from "./LocalFilterBar.module.css";

/**
 * The one-tap narrowings, side by side: is it open right now, has it been
 * verified as a safe space, is it out and about (List and Map) and, on the Online
 * tab for a signed-in member, Show 18+ shops. Each chip names itself, so the group only needs a name for the
 * set as a whole.
 */
export function LocalQuickFilters({
  showOpenNow = true,
  openNow,
  onToggleOpenNow,
  safeOnly,
  onToggleSafeOnly,
  chipCounts,
  isLoadedSetComplete,
  showAdult = false,
  isAdultShown,
  onToggleAdult,
  showOutAndAbout = false,
  isOutAndAbout,
  onToggleOutAndAbout,
}: {
  /** Off on the Online tab, which lists businesses by how they sell online,
   *  so opening hours are no filter there. */
  showOpenNow?: boolean;
  openNow: boolean;
  onToggleOpenNow: () => void;
  safeOnly: boolean;
  onToggleSafeOnly: () => void;
  /** How many loaded places each chip would leave if turned on. */
  chipCounts: LocalChipCounts;
  /** True once every page of places has loaded, so a zero count is final. */
  isLoadedSetComplete: boolean;
  /** Offers "Show 18+ shops": the Online tab, for a signed-in member only. */
  showAdult?: boolean;
  /** Whether "Show 18+ shops" is on. */
  isAdultShown?: boolean;
  onToggleAdult?: () => void;
  /** Offers "Out and about": the List and Map tabs. */
  showOutAndAbout?: boolean;
  isOutAndAbout?: boolean;
  onToggleOutAndAbout?: () => void;
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
  const isOutAndAboutDisabled =
    isLoadedSetComplete &&
    !isOutAndAbout &&
    chipCounts.outAndAbout !== undefined &&
    chipCounts.outAndAbout === 0;

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
        {showOutAndAbout && onToggleOutAndAbout && (
          <m.button
            {...glide.chip}
            type="button"
            aria-pressed={isOutAndAbout === true}
            disabled={isOutAndAboutDisabled}
            className={[s.chip, isOutAndAbout && s.chipOn]
              .filter(Boolean)
              .join(" ")}
            onClick={onToggleOutAndAbout}
          >
            <FiNavigation aria-hidden />
            {t("marketing:local.filter.outAndAbout")}
          </m.button>
        )}
        {showAdult && onToggleAdult && (
          <m.button
            {...glide.chip}
            type="button"
            aria-pressed={isAdultShown === true}
            className={[s.chip, isAdultShown && s.chipOn]
              .filter(Boolean)
              .join(" ")}
            onClick={onToggleAdult}
          >
            <FiEye aria-hidden />
            {t("marketing:local.filter.adult")}
          </m.button>
        )}
      </m.div>
    </RefineGroup>
  );
}
