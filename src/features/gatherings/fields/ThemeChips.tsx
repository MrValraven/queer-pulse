import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ChipToggleGroup } from "../CreateGatheringFields";
import type { GatheringFamily } from "../gatheringCatalog";
import {
  GATHERING_THEME_GROUPS,
  hiddenThemeKeysForFamily,
  MAX_GATHERING_THEMES,
  THEME_LABEL_KEYS,
  type GatheringThemeKey,
} from "../gatheringExtras";
import styles from "./ThemeChips.module.css";

export interface ThemeChipsProps {
  /** The family the gathering is filed under. A theme its own details
   *  already ask about is left out (ruling R6). */
  family: GatheringFamily | "" | null;
  selectedThemes: readonly GatheringThemeKey[];
  onToggle: (theme: GatheringThemeKey) => void;
  /** The id of the visible label that names the chips. */
  labelledBy: string;
  /** The id of the hint that says how many may be picked. */
  describedBy?: string;
}

/**
 * The theme chips as a value and a toggle, at most three pressed at once.
 *
 * Shared by the create wizard and the edit-details modal. The label and hint
 * stay with each surface (the wizard's v2 `Field`, the modal's uppercase
 * label), so each keeps its own look around the same chips.
 *
 * The chips sit in groups, each under a small sub-label that names its inner
 * group for a screen reader. Every group gets the full selection and the same
 * cap, so the three-theme limit counts across all of them. The outer group
 * carries the field's label and hint, announced once.
 */
export function ThemeChips({
  family,
  selectedThemes,
  onToggle,
  labelledBy,
  describedBy,
}: ThemeChipsProps) {
  const { t } = useTranslation();
  const headingIdPrefix = useId();
  const hiddenThemeKeys = hiddenThemeKeysForFamily(family);
  const visibleGroups = GATHERING_THEME_GROUPS.filter((group) =>
    group.themes.some((themeKey) => !hiddenThemeKeys.includes(themeKey)),
  );
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={styles.groups}
    >
      {visibleGroups.map((group) => {
        const headingId = `${headingIdPrefix}-${group.key}`;
        return (
          <div key={group.key} className={styles.group}>
            <p id={headingId} className={styles.groupHeading}>
              {t(group.labelKey)}
            </p>
            <ChipToggleGroup
              options={group.themes.map((themeKey) => ({
                key: themeKey,
                label: t(THEME_LABEL_KEYS[themeKey]),
              }))}
              selectedKeys={selectedThemes}
              onToggle={onToggle}
              maxSelected={MAX_GATHERING_THEMES}
              hiddenKeys={hiddenThemeKeys}
              labelledBy={headingId}
            />
          </div>
        );
      })}
    </div>
  );
}
