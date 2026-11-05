import { useId } from "react";
import { m } from "motion/react";
import { FiClock, FiEye, FiNavigation, FiShield } from "react-icons/fi";
import { RefineGroup, useRefineGlide } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LocalChipCount } from "./LocalChipCount";
import type { LocalChipCounts } from "./directoryFacetCounts";
import s from "./LocalFilterBar.module.css";

/**
 * The one-tap narrowings, side by side: is it open right now, has it been
 * verified as a safe space, is it out and about (List and Map) and, on the Online
 * tab for a signed-in member, Show 18+ shops. Each chip names itself, so the group only needs a name for the
 * set as a whole. The narrowings end with their live count, how many places
 * would show with that chip on; Show 18+ shops adds a separate pool, so it
 * carries none.
 */
export function LocalQuickFilters({
  showOpenNow = true,
  openNow,
  onToggleOpenNow,
  safeOnly,
  onToggleSafeOnly,
  chipCounts,
  showAdult = false,
  isAdultShown,
  onToggleAdult,
  showOutAndAbout = false,
  isOutAndAbout,
  onToggleOutAndAbout,
  sectionTitleId,
}: {
  /** Off on the Online tab, which lists businesses by how they sell online,
   *  so opening hours are no filter there. */
  showOpenNow?: boolean;
  openNow: boolean;
  onToggleOpenNow: () => void;
  safeOnly: boolean;
  onToggleSafeOnly: () => void;
  /** How many places each chip would show if turned on; missing when not
   *  known yet. */
  chipCounts: LocalChipCounts;
  /** Offers "Show 18+ shops": the Online tab, for a signed-in member only. */
  showAdult?: boolean;
  /** Whether "Show 18+ shops" is on. */
  isAdultShown?: boolean;
  onToggleAdult?: () => void;
  /** Offers "Out and about": the List and Map tabs. */
  showOutAndAbout?: boolean;
  isOutAndAbout?: boolean;
  onToggleOutAndAbout?: () => void;
  /** Given inside a desktop sidebar section, whose header names the group:
   *  the band label is left out and the chips are labelled by the header's
   *  title. */
  sectionTitleId?: string;
}) {
  const { t } = useTranslation();
  const quickLabelId = useId();
  // Inside the Refine drawer the chips glide to their new places as the
  // drawer's content shifts; in the mobile sheet the glide stays still.
  const glide = useRefineGlide();
  // A chip whose count is a known 0 would empty the list, so it goes
  // unpickable. A count not known yet keeps it pickable, and a chip that is
  // on stays clickable, so it can always be turned back off.
  const isOpenNowDisabled = !openNow && chipCounts.openNow === 0;
  const isSafeOnlyDisabled = !safeOnly && chipCounts.safe === 0;
  const isOutAndAboutDisabled = !isOutAndAbout && chipCounts.outAndAbout === 0;

  const chipRow = (
    <m.div
      {...glide.row}
      className={[s.safeRow, sectionTitleId && s.flush]
        .filter(Boolean)
        .join(" ")}
      role={sectionTitleId ? "group" : undefined}
      aria-labelledby={sectionTitleId}
    >
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
          <LocalChipCount count={chipCounts.openNow} />
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
        <LocalChipCount count={chipCounts.safe} />
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
          <LocalChipCount count={chipCounts.outAndAbout} />
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
  );
  if (sectionTitleId) return chipRow;

  return (
    <RefineGroup
      label={t("marketing:local.filter.quickFiltersLabel")}
      labelId={quickLabelId}
      role="group"
      aria-labelledby={quickLabelId}
    >
      {chipRow}
    </RefineGroup>
  );
}
