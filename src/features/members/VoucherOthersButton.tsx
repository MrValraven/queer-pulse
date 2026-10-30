import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./VoucherRoster.module.css";

/**
 * "8 others" in the caption: a text button that toggles the voucher roster.
 * The chevron turns over while the roster is open.
 */
export function VoucherOthersButton({
  count,
  isOpen,
  rosterId,
  onToggle,
}: {
  count: number;
  isOpen: boolean;
  /** Id of the roster this button expands. */
  rosterId: string;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={styles.othersButton}
      aria-expanded={isOpen}
      aria-controls={rosterId}
      onClick={onToggle}
    >
      {t("members:hero.vouch.others", { count })}
      <FiChevronDown
        className={isOpen ? styles.chevronOpen : styles.chevron}
        aria-hidden="true"
      />
    </button>
  );
}
