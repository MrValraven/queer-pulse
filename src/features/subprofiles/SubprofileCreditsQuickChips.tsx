import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CREDITS_QUICK_CHIPS,
  type CreditsQuickChipFilter,
} from "./subprofileCreditsQuickChips.data";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileCreditsHero.module.css";

interface SubprofileCreditsQuickChipsProps {
  filters: SubprofileDirectoryFilters;
  /** Called on every chip toggle, so a page showing another tab can switch
   *  to the one the chips narrow. */
  onRefine: () => void;
}

/**
 * One-tap filters under the hero search. Each is a toggle button over the
 * same state the sidebar edits: the two availability chips pick (or clear)
 * the single availability choice, so pressing one releases the other, and
 * the profession chips toggle their kind in the kinds filter. On a phone the
 * row scrolls sideways instead of wrapping.
 */
export function SubprofileCreditsQuickChips({
  filters,
  onRefine,
}: SubprofileCreditsQuickChipsProps) {
  const { t } = useTranslation();
  const { availability, setAvailability, kinds, onToggleKind } = filters;

  const isPressed = (filter: CreditsQuickChipFilter) =>
    filter.type === "availability"
      ? availability === filter.value
      : kinds.includes(filter.value);

  const onToggle = (filter: CreditsQuickChipFilter) => {
    onRefine();
    if (filter.type === "availability") {
      setAvailability(availability === filter.value ? null : filter.value);
      return;
    }
    onToggleKind(filter.value);
  };

  return (
    <div
      className={styles.chips}
      role="group"
      aria-label={t("subprofiles:directory.hero.quickFiltersLabel")}
    >
      {CREDITS_QUICK_CHIPS.map((chip) => (
        <button
          key={chip.id}
          type="button"
          className={styles.chip}
          aria-pressed={isPressed(chip.filter)}
          onClick={() => onToggle(chip.filter)}
        >
          {chip.hasLiveDot ? (
            <span aria-hidden className={styles.chipDot} />
          ) : null}
          {t(chip.labelKey)}
        </button>
      ))}
    </div>
  );
}
