import type { RefObject } from "react";
import { FiUserPlus } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import adminStyles from "./AdminLead.module.css";
import styles from "./LeadAssigneesPanel.module.css";

/**
 * The In charge heading with Assign staff on the same row. The button sits
 * above the empty line and the pills, so the picker it anchors stays in
 * place while pills come, go and wrap. On a narrow screen the button wraps
 * under the heading.
 */
export function LeadAssigneesHeadingRow({
  headingId,
  assignButtonRef,
  isPicking,
  onTogglePicker,
}: {
  headingId: string;
  assignButtonRef: RefObject<HTMLButtonElement | null>;
  isPicking: boolean;
  onTogglePicker: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.headingRow}>
      <h2 id={headingId} className={adminStyles.sectionHeading}>
        {t("admin:leads.assignees.heading")}
      </h2>
      <Button
        ref={assignButtonRef}
        variant="ghost"
        size="sm"
        className={styles.assignButton}
        aria-haspopup="dialog"
        aria-expanded={isPicking}
        onClick={onTogglePicker}
      >
        <FiUserPlus aria-hidden />
        {t("admin:leads.assignees.assignCta")}
      </Button>
    </div>
  );
}
