import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminModal } from "./ui";
import { AdminRecoveryReasonField } from "./AdminRecoveryReasonField";
import {
  useLiftEmailSuppression,
  useLookupEmailSuppression,
} from "./api/useAdminIdentity";
import type { EmailSuppressionLookupDTO } from "./api/adminIdentity.api";
import styles from "./AdminMembersPage.module.css";

/**
 * The erasure suppression list: look one address up, and lift it.
 *
 * WHAT LIFTING DOES, because the wording is the safeguard. Erasing an account
 * adds the address to a permanent suppression list, which is the promise the
 * delete-account screen makes: signing in again will not quietly re-create what
 * you asked us to delete. Lifting a row restores NOTHING. The account is gone,
 * its content was severed at erasure, and none of it comes back. It only stops
 * the platform refusing a brand-new signup on that address, which is the right
 * remedy for exactly two cases: someone who changed their mind and wants to
 * start over, and an erasure made by mistake.
 *
 * Two steps on purpose. An operator looks the address up first and sees what
 * the list holds before any Lift button exists, so lifting can never be how
 * they find out whether there was anything there.
 *
 * It lives on the members page rather than in the member drawer because a
 * suppression row deliberately outlives the account it protected: there is no
 * member left to open a drawer on.
 */
export function AdminEmailSuppressionModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const lookup = useLookupEmailSuppression();
  const lift = useLiftEmailSuppression();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<EmailSuppressionLookupDTO | null>(null);
  const [isLifted, setIsLifted] = useState(false);

  const runLookup = () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      showToast(t("admin:recovery.suppression.missingEmailToast"), "error");
      return;
    }
    setIsLifted(false);
    lookup.mutate(
      { email: trimmedEmail },
      { onSuccess: (lookupResult) => setResult(lookupResult) },
    );
  };

  const runLift = () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      showToast(t("admin:recovery.missingReasonToast"), "error");
      return;
    }
    if (!result) return;
    lift.mutate(
      { email: result.email, reason: trimmedReason },
      {
        onSuccess: () => {
          setIsLifted(true);
          setResult(null);
          setReason("");
          showToast(t("admin:recovery.suppression.liftedToast"), "success");
        },
      },
    );
  };

  return (
    <AdminModal
      title={t("admin:recovery.suppression.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.close")}
          </Button>
          <Button
            variant="primary"
            disabled={lookup.isPending}
            onClick={runLookup}
          >
            {t("admin:recovery.suppression.lookupCta")}
          </Button>
        </>
      }
    >
      <p className={styles.roleConfirmBody}>
        {t("admin:recovery.suppression.body")}
      </p>

      <label className={styles.fieldLabel} htmlFor="suppression-lookup-email">
        {t("admin:recovery.suppression.emailLabel")}
      </label>
      <input
        id="suppression-lookup-email"
        className={styles.textarea}
        type="email"
        autoComplete="off"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t("admin:recovery.suppression.emailPlaceholder")}
      />

      {isLifted && (
        <p className={styles.dHint}>
          {t("admin:recovery.suppression.liftedBody")}
        </p>
      )}

      {result && (
        <SuppressionResult
          result={result}
          reason={reason}
          onReasonChange={setReason}
          isLiftPending={lift.isPending}
          onLift={runLift}
        />
      )}
    </AdminModal>
  );
}

/** What the list holds for the looked-up address, and the lift when there is a
 *  row to lift. Split out so neither component runs long. */
function SuppressionResult({
  result,
  reason,
  onReasonChange,
  isLiftPending,
  onLift,
}: {
  result: EmailSuppressionLookupDTO;
  reason: string;
  onReasonChange: (next: string) => void;
  isLiftPending: boolean;
  onLift: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  if (!result.isSuppressed) {
    return (
      <p className={styles.dHint}>
        {t("admin:recovery.suppression.notSuppressed", {
          email: result.email,
        })}
      </p>
    );
  }

  return (
    <>
      <p className={styles.dHint}>
        {t("admin:recovery.suppression.found", {
          email: result.email,
          date: result.suppressedAt
            ? fmt.date(new Date(result.suppressedAt))
            : "",
          hash: result.emailHashPrefix,
        })}
      </p>
      <p className={styles.roleConfirmBody}>
        {t("admin:recovery.suppression.liftWarning")}
      </p>
      <AdminRecoveryReasonField
        fieldId="suppression-lift-reason"
        label={t("admin:recovery.reasonLabel")}
        placeholder={t("admin:recovery.suppression.reasonPlaceholder")}
        value={reason}
        onChange={onReasonChange}
      />
      <div className={styles.roleActions}>
        <Button
          variant="danger"
          size="md"
          disabled={isLiftPending}
          onClick={onLift}
        >
          {t("admin:recovery.suppression.liftCta")}
        </Button>
      </div>
    </>
  );
}
