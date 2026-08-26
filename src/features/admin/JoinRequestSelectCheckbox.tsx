import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminMembersPage.module.css";

/**
 * The bulk-selection box on one pending request.
 *
 * Its accessible name carries the applicant, so a screen reader reaching a
 * column of boxes hears whose application each one takes rather than "checkbox,
 * checkbox, checkbox". Extracted from `JoinRequestCard` so that already
 * oversized component did not grow further to carry the cap's disabled state.
 */
export function JoinRequestSelectCheckbox({
  applicantName,
  requestId,
  isSelected,
  isDisabled,
  onToggleSelect,
}: {
  applicantName: string;
  requestId: string;
  isSelected: boolean;
  /** True once the selection is at the bulk cap and this row is outside it. */
  isDisabled: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <input
      type="checkbox"
      checked={isSelected}
      disabled={isDisabled}
      onChange={() => onToggleSelect(requestId)}
      aria-label={t("admin:members.verify.selectAria", { name: applicantName })}
      className={styles.queueSelect}
    />
  );
}
