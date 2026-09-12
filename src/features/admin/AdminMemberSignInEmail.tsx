import { useState } from "react";
import { FiAlertTriangle, FiCopy, FiEye } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMemberSignInEmail } from "./api/useAdminMembers";
import { type AdminMember } from "./adminMembers.data";
import styles from "./AdminMemberSignInEmail.module.css";
import drawerStyles from "./AdminMembersPage.module.css";

/**
 * "Which address does this member sign in with?", answered in two steps from
 * the admin member drawer.
 *
 * The masked form rides along on the member detail and costs nothing, because
 * the common question is recognition: is this the account the support ticket is
 * about. The whole address is a different kind of read, so it is
 * REVEALED ONLY WHEN ASKED FOR, and the backend writes a `mod_audit_logs` row
 * naming the admin who asked. An address fetched on drawer open would put that
 * name against a read nobody chose to make, and would turn paging through the
 * roster into a trail of PII lookups.
 *
 * A FAILED REVEAL IS NOT AN ABSENT ADDRESS. The error state says so, because
 * "we hold nothing for this member" and "the lookup did not run" would
 * otherwise look identical, and the second one reading as the first would have
 * an operator close a ticket on a false premise.
 *
 * The reveal is keyed to the member it was asked for (`requestedMemberId`
 * rather than a bare boolean) so that selecting the next row in the roster
 * cannot inherit the last one's consent and fetch an address unprompted.
 */
export function AdminMemberSignInEmail({
  member,
  maskedEmail,
}: {
  member: AdminMember;
  /** `MemberDetail.signInEmailMasked`. `null` means the platform holds no
   *  address for this member, which this section says in words. */
  maskedEmail: string | null;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [requestedMemberId, setRequestedMemberId] = useState<string | null>(
    null,
  );
  const isRequested = requestedMemberId === member.id;
  const {
    data: revealedEmail,
    isLoading,
    isError,
    refetch,
  } = useMemberSignInEmail(member, isRequested);

  const handleCopy = async () => {
    if (!revealedEmail) return;
    try {
      await navigator.clipboard.writeText(revealedEmail);
      showToast(t("admin:members.signInEmail.copied"), "success");
    } catch {
      showToast(t("admin:members.signInEmail.copyFailed"), "error");
    }
  };

  return (
    <section className={drawerStyles.dSection}>
      <h3 className={drawerStyles.dHeading}>
        {t("admin:members.signInEmail.title")}
      </h3>
      <p className={drawerStyles.dHint}>
        {t("admin:members.signInEmail.hint")}
      </p>

      {maskedEmail === null ? (
        <p className={styles.status}>
          {t("admin:members.signInEmail.noneHeld")}
        </p>
      ) : (
        <>
          {/* The address swaps in place, so the live region announces the
              revealed value to a screen reader instead of leaving the masked
              one as the last thing read out. */}
          <p className={styles.address} aria-live="polite">
            <span className={styles.addressValue}>
              {revealedEmail ?? maskedEmail}
            </span>
            {revealedEmail ? (
              <span className={styles.recorded}>
                {t("admin:members.signInEmail.recordedNote")}
              </span>
            ) : null}
          </p>

          {isError ? (
            <div className={styles.error} role="alert">
              <FiAlertTriangle aria-hidden className={styles.errorIcon} />
              <p className={styles.errorText}>
                {t("admin:members.signInEmail.errorBody")}
              </p>
            </div>
          ) : null}

          <div className={styles.actions}>
            {revealedEmail ? (
              <Button
                variant="ghost"
                size="md"
                onClick={() => void handleCopy()}
              >
                <FiCopy aria-hidden /> {t("admin:members.signInEmail.copyCta")}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="md"
                disabled={isLoading}
                onClick={() => {
                  if (isError) {
                    void refetch();
                    return;
                  }
                  setRequestedMemberId(member.id);
                }}
              >
                <FiEye aria-hidden />{" "}
                {t(
                  isError
                    ? "admin:members.signInEmail.retryCta"
                    : "admin:members.signInEmail.revealCta",
                )}
              </Button>
            )}
            {isLoading ? (
              <span className={styles.status} role="status">
                {t("admin:members.signInEmail.revealing")}
              </span>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
