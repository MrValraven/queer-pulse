import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ChipToggleGroup } from "../CreateGatheringFields";
import type { GatheringFamily } from "../gatheringCatalog";
import {
  GATHERING_THEME_KEYS,
  hiddenThemeKeysForFamily,
  MAX_GATHERING_THEMES,
  THEME_LABEL_KEYS,
  type GatheringThemeKey,
} from "../gatheringExtras";

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
 */
export function ThemeChips({
  family,
  selectedThemes,
  onToggle,
  labelledBy,
  describedBy,
}: ThemeChipsProps) {
  const { t } = useTranslation();
  return (
    <ChipToggleGroup
      options={GATHERING_THEME_KEYS.map((themeKey) => ({
        key: themeKey,
        label: t(THEME_LABEL_KEYS[themeKey]),
      }))}
      selectedKeys={selectedThemes}
      onToggle={onToggle}
      maxSelected={MAX_GATHERING_THEMES}
      hiddenKeys={hiddenThemeKeysForFamily(family)}
      labelledBy={labelledBy}
      describedBy={describedBy}
    />
  );
}
