import { SegmentedControl } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./PitchTriage.module.css";

export type PitchTriageMode = "card" | "list";

export interface PitchTriageModeSwitchProps {
  mode: PitchTriageMode;
  onModeChange: (mode: PitchTriageMode) => void;
}

/**
 * Switches the overlay between one pitch at a time and the whole inbox as a
 * checklist, for the editor who already knows several answers and would
 * rather tick them off together.
 */
export function PitchTriageModeSwitch({
  mode,
  onModeChange,
}: PitchTriageModeSwitchProps) {
  const { t } = useTranslation();
  return (
    <SegmentedControl
      className={styles.modeSwitch}
      label={t("magazine:desk.triage.viewLabel")}
      options={[
        { value: "card", label: t("magazine:desk.triage.viewOneAtATime") },
        { value: "list", label: t("magazine:desk.triage.viewList") },
      ]}
      value={mode}
      onChange={(value) => onModeChange(value === "list" ? "list" : "card")}
    />
  );
}
