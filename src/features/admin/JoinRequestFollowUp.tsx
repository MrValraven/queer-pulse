import { useState } from "react";
import { FiMail } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { JoinRequestFollowUpEmailModal } from "./JoinRequestFollowUpEmailModal";
import styles from "./JoinRequestFollowUp.module.css";

/**
 * "Email {name} for more details" on a review card, plus the modal it opens.
 * Owns its own open state so no queue-list component needs new props. Passing
 * `onWaitlist` (pending cards only) lets the modal waitlist the applicant in
 * the same breath; a waitlisted card passes none.
 */
export function JoinRequestFollowUp({
  applicantName,
  hasApplicantName,
  applicantEmail,
  isDisabled,
  onWaitlist,
}: {
  applicantName: string;
  hasApplicantName: boolean;
  applicantEmail: string;
  isDisabled: boolean;
  onWaitlist?: () => void;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="md"
        className={styles.action}
        disabled={isDisabled}
        onClick={() => setIsOpen(true)}
      >
        <FiMail aria-hidden />
        {hasApplicantName
          ? t("admin:members.verify.followUp.action", { name: applicantName })
          : t("admin:members.verify.followUp.actionNoName")}
      </Button>
      {isOpen && (
        <JoinRequestFollowUpEmailModal
          applicantName={applicantName}
          hasApplicantName={hasApplicantName}
          applicantEmail={applicantEmail}
          onWaitlist={onWaitlist}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
