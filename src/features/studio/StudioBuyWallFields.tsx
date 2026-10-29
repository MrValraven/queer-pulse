import { useId } from "react";
import { Toggle } from "../../shared/components/ui/Controls";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSupporterOptionView } from "./api/studioListening.adapters";
import { StudioSupporterPickerRegion } from "./StudioSupporterIdentityPicker";
import styles from "./StudioBuySheet.module.css";

/** Nothing to save from inside the sheet: each pick reaches the sheet
 *  through `onSelect`, and "I've paid" sends it. */
function ignoreSave() {}

/** "Show me on the supporter wall", off by default, with the identity
 *  picker (the account or one of the buyer's personas, previewed) folding
 *  open under it while the switch is on. */
export function StudioBuyWallFields({
  artistName,
  isOnWall,
  onIsOnWallChange,
  options,
  shownAsSubprofileId,
  onShownAsChange,
}: {
  /** The artist the picker names; the wall sits on their release page. */
  artistName: string;
  isOnWall: boolean;
  onIsOnWallChange: (isOnWall: boolean) => void;
  options: StudioSupporterOptionView[];
  shownAsSubprofileId: string | null;
  onShownAsChange: (shownAsSubprofileId: string | null) => void;
}) {
  const { t } = useTranslation();
  const switchId = useId();
  const bodyId = useId();
  const pickerId = useId();
  return (
    <section className={styles.section}>
      <div className={styles.wallRow}>
        <span className={styles.wallText}>
          <label htmlFor={switchId} className={styles.wallLabel}>
            {t("studio:purchase.wall.toggle")}
          </label>
          <span id={bodyId} className={styles.wallBody}>
            {t("studio:purchase.wall.body")}
          </span>
        </span>
        <Toggle
          id={switchId}
          label={t("studio:purchase.wall.toggle")}
          aria-describedby={bodyId}
          checked={isOnWall}
          onChange={onIsOnWallChange}
        />
      </div>
      <StudioSupporterPickerRegion
        id={pickerId}
        isOpen={isOnWall}
        saveError={null}
        personaName={artistName}
        legend={t("studio:purchase.sheet.wallLegend")}
        options={options}
        initialShownAsSubprofileId={shownAsSubprofileId}
        isSaving={false}
        shouldFocusOnOpen={false}
        shouldShowActions={false}
        onSelect={onShownAsChange}
        onSave={ignoreSave}
        onClose={ignoreSave}
      />
    </section>
  );
}
