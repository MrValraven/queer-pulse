import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./WorkFieldPicker.module.css";

interface WorkPickerShowAllToggleProps {
  /** Whether the picker shows only the member's own picks right now. */
  isShowingOnlyPicks: boolean;
  /** `id` of the picker body this button folds open and closed. */
  controlsId: string;
  onToggle: () => void;
}

/**
 * The quiet text button under the work picker that opens the full list of
 * fields and roles, and folds it back to the member's picks. The chevron
 * turns over off `aria-expanded`, so the markup and the styling read from one
 * source.
 */
export function WorkPickerShowAllToggle({
  isShowingOnlyPicks,
  controlsId,
  onToggle,
}: WorkPickerShowAllToggleProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={styles.showAllToggle}
      aria-expanded={!isShowingOnlyPicks}
      aria-controls={controlsId}
      onClick={onToggle}
    >
      {isShowingOnlyPicks
        ? t("members:workPicker.showAll")
        : t("members:workPicker.showOnlyPicks")}
      <FiChevronDown aria-hidden />
    </button>
  );
}
