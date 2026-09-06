import { Link } from "react-router-dom";
import { FiKey } from "react-icons/fi";
import { Button, CopyLinkRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { concernStatusLink } from "./api/governance.api";
import styles from "./ConcernStatus.module.css";

/**
 * PRD-261. The reference code, handed over at the one moment it exists.
 *
 * WHY THIS SCREEN REPLACED A TOAST. The form used to answer a submission with
 * "Submitted. We'll be in touch within 48 hours." That was true of nothing: the
 * platform delivers no email and never will, and only a SIGNED-IN submitter
 * gets the in-app bell when the concern reaches an outcome. An anonymous person
 * reporting harm, or appealing a decision that went against them, was left
 * waiting for a confirmation that could not arrive — and silence, to someone in
 * that position, reads as the report having been dropped.
 *
 * The backend keeps only a hash of this code, so this block is the entire
 * delivery mechanism: if the person leaves without it, the outcome of their own
 * report becomes unreachable to them forever. Hence a copy affordance (the
 * shared `CopyLinkRow`, so there is exactly one clipboard implementation in the
 * app), a plain sentence about why it matters, and a direct link that carries
 * the code for them.
 *
 * NOTHING IS WRITTEN TO BROWSER STORAGE, deliberately, and this is where it
 * differs from the join-request confirmation. That page remembers its token in
 * `localStorage` because an invite request is not sensitive and losing the code
 * is the bigger risk. A concern is often about a person the submitter shares a
 * home, a scene or a device with, and a stored "you reported something" is
 * exactly the trace that makes reporting unsafe. The person decides where the
 * code goes.
 *
 * `code` is null when the API answered without one (an older backend, or a
 * demo build with the panel forced open), where the panel says the submission
 * landed and offers no code it does not have.
 */
export function ConcernSubmittedPanel({
  code,
  onSubmitAnother,
}: {
  code: string | null;
  onSubmitAnother: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>
        <FiKey aria-hidden /> {t("governance:concernStatus.submitted.title")}
      </h3>
      <p className={styles.panelBody}>
        {t("governance:concernStatus.submitted.intro")}
      </p>
      {code && (
        <>
          <CopyLinkRow
            tone="paper"
            value={code}
            fieldLabel={t("governance:concernStatus.submitted.fieldLabel")}
            copyLabel={t("governance:concernStatus.submitted.copy")}
            copiedLabel={t("governance:concernStatus.submitted.copied")}
            copiedToast={t("governance:concernStatus.submitted.copiedToast")}
            errorToast={t("governance:concernStatus.submitted.copyErrorToast")}
            className={styles.codeRow}
          />
          <p className={styles.panelBody}>
            {t("governance:concernStatus.submitted.keepIt")}
          </p>
          <Link className={styles.panelLink} to={concernStatusLink(code)}>
            {t("governance:concernStatus.submitted.checkCta")}
          </Link>
        </>
      )}
      <p className={styles.panelBody}>
        {t("governance:concernStatus.submitted.whatHappensNext")}
      </p>
      <Button variant="ghost-dark" size="sm" onClick={onSubmitAnother}>
        {t("governance:concernStatus.submitted.anotherCta")}
      </Button>
    </div>
  );
}
