import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminBanEvasionFlag } from "./AdminBanEvasionFlag";
import { useBanEvasionAssessmentForUser } from "./AdminBanEvasionSignals";
import styles from "./AdminMemberBanEvasionCheck.module.css";
import drawerStyles from "./AdminMembersPage.module.css";

/**
 * "Is this member a returning removed account?", asked on demand from the
 * admin member drawer.
 *
 * The per-member twin of the invite review queue's flag. The queue runs its
 * check before anyone is let in; this one exists for the case the queue cannot
 * cover, where somebody got in and staff are now looking at the account itself.
 * Without it the signal sits in the database with no human able to read it.
 *
 * FETCHED ONLY WHEN ASKED FOR. This is a correlation against removed accounts
 * built from salted identifier hashes, and it is nobody's business by default.
 * Compiling it silently for every member a staff member happens to open would
 * turn a targeted question into routine surveillance of the whole roster, so
 * the query stays disabled until the button below is pressed.
 *
 * A FAILED CHECK IS NOT A CLEAN RESULT. The error state says so in as many
 * words, because "nothing found" and "nothing ran" would otherwise look
 * identical and the second one would quietly clear a known evader.
 *
 * Read-only and advisory, like every other surface on this module. Nothing here
 * bans, holds or restricts anyone: the drawer's own controls do that, and a
 * human decides.
 */
export function AdminMemberBanEvasionCheck({ memberId }: { memberId: string }) {
  const { t } = useTranslation();
  const [hasRequestedCheck, setHasRequestedCheck] = useState(false);
  const {
    data: assessment,
    isLoading,
    isError,
    refetch,
  } = useBanEvasionAssessmentForUser(memberId, hasRequestedCheck);

  // Mirrors what `AdminBanEvasionFlag` will actually render, so exactly one of
  // the two outcomes shows. The panel renders nothing for `tier: "none"`, and a
  // silent section would read as "checked, clear" without ever saying it.
  const hasSignals =
    !!assessment && assessment.tier !== "none" && assessment.signals.length > 0;
  const isClear = !!assessment && !hasSignals;
  const ctaKey = isError
    ? "admin:members.banEvasion.retryCta"
    : hasRequestedCheck && !isLoading
      ? "admin:members.banEvasion.recheckCta"
      : "admin:members.banEvasion.checkCta";

  return (
    <section className={drawerStyles.dSection}>
      <h3 className={drawerStyles.dHeading}>
        {t("admin:members.banEvasion.title")}
      </h3>
      <p className={drawerStyles.dHint}>{t("admin:members.banEvasion.hint")}</p>

      {isError ? (
        <div className={styles.error} role="alert">
          <FiAlertTriangle aria-hidden className={styles.errorIcon} />
          <p className={styles.errorText}>
            {t("admin:members.banEvasion.errorBody")}
          </p>
        </div>
      ) : null}

      {isLoading ? (
        <p className={styles.status} role="status">
          {t("admin:members.banEvasion.checking")}
        </p>
      ) : null}

      {isClear ? (
        <p className={styles.clear}>{t("admin:members.banEvasion.clear")}</p>
      ) : null}

      {hasSignals ? (
        <AdminBanEvasionFlag
          assessment={assessment}
          noteKey="admin:members.banEvasion.note"
        />
      ) : null}

      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="md"
          disabled={isLoading}
          onClick={() => {
            if (hasRequestedCheck) {
              void refetch();
              return;
            }
            setHasRequestedCheck(true);
          }}
        >
          {t(ctaKey)}
        </Button>
      </div>
    </section>
  );
}
