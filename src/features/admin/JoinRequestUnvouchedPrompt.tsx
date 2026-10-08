import { FiInfo } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./JoinRequestFollowUp.module.css";

/**
 * A quiet nudge on a card whose applicant has nobody here vouching for them:
 * what to look at before deciding. Styled as a note so it never reads as one
 * of the amber triage flags.
 */
export function JoinRequestUnvouchedPrompt({
  applicantName,
  hasApplicantName,
  hasSocialProfile,
}: {
  applicantName: string;
  hasApplicantName: boolean;
  hasSocialProfile: boolean;
}) {
  const { t } = useTranslation();
  const keySuffix = hasApplicantName ? "" : "NoName";
  return (
    <p className={styles.prompt}>
      <FiInfo aria-hidden className={styles.promptIcon} />
      <span>
        {t(
          hasSocialProfile
            ? `admin:members.verify.unvouched.withSocial${keySuffix}`
            : `admin:members.verify.unvouched.withoutSocial${keySuffix}`,
          { name: applicantName },
        )}
      </span>
    </p>
  );
}
