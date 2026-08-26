import { useState } from "react";
import { Button, FormField } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SAFE_SPACE_TIERS } from "./adminSafeSpaceGovernance.data";
import { useAdminSafeSpaceNominationAction } from "../safety/api/useAdminSafeSpaceNominations";
import styles from "./AdminSafeSpaceGovernance.module.css";

/**
 * Step three and four of the published six: the review team decides, and a
 * badge is granted or the nomination is declined.
 *
 * The written reason is required on BOTH outcomes and both buttons stay
 * disabled without one. A badge granted with no stated basis is the thing
 * being fixed here, and a decline with no stated basis is a member being told
 * nothing.
 *
 * The three-visit bar is reported above this form and deliberately does not
 * gate the award: a reviewer may have grounds a count cannot see, and the
 * audit row then says plainly that they awarded with fewer.
 */
export function AdminSafeSpaceDecideForm({
  nominationId,
}: {
  nominationId: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const action = useAdminSafeSpaceNominationAction();
  const [reason, setReason] = useState("");
  const [tier, setTier] = useState(2);

  function decide(outcome: "award" | "decline") {
    action.mutate(
      {
        kind: "decide",
        id: nominationId,
        outcome,
        reason: reason.trim(),
        ...(outcome === "award" ? { tier } : {}),
      },
      {
        onSuccess: () => {
          showToast(
            t(
              outcome === "award"
                ? "safety:governance.toast.awarded"
                : "safety:governance.toast.declined",
            ),
            "success",
          );
          setReason("");
        },
        onError: () => showToast(t("safety:governance.toast.failed"), "error"),
      },
    );
  }

  return (
    <>
      <FormField
        label={t("safety:governance.action.reasonLabel")}
        helper={t("safety:governance.action.reasonHelper")}
        required
      >
        <textarea
          className={styles.textarea}
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </FormField>

      <FormField label={t("safety:governance.action.tierLabel")}>
        <select
          className={styles.input}
          value={tier}
          onChange={(event) => setTier(Number(event.target.value))}
        >
          {SAFE_SPACE_TIERS.map((tierValue) => (
            <option key={tierValue} value={tierValue}>
              {t("safety:governance.action.tierOption", { tier: tierValue })}
            </option>
          ))}
        </select>
      </FormField>

      <div className={styles.actionRow}>
        <Button
          variant="jade"
          disabled={!reason.trim() || action.isPending}
          onClick={() => decide("award")}
        >
          {t("safety:governance.action.awardCta")}
        </Button>
        <Button
          variant="ghost"
          disabled={!reason.trim() || action.isPending}
          onClick={() => decide("decline")}
        >
          {t("safety:governance.action.declineCta")}
        </Button>
      </div>
    </>
  );
}

/**
 * Re-open a decided nomination, with the reason on the record. A decision that
 * cannot be revisited is not a review process, and one revisited silently is
 * not an accountable one.
 */
export function AdminSafeSpaceReopenForm({
  nominationId,
}: {
  nominationId: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const action = useAdminSafeSpaceNominationAction();
  const [reason, setReason] = useState("");

  function reopen() {
    action.mutate(
      { kind: "reopen", id: nominationId, reason: reason.trim() },
      {
        onSuccess: () => {
          showToast(t("safety:governance.toast.reopened"), "success");
          setReason("");
        },
        onError: () => showToast(t("safety:governance.toast.failed"), "error"),
      },
    );
  }

  return (
    <>
      <FormField
        label={t("safety:governance.action.reopenLabel")}
        helper={t("safety:governance.action.reopenHelper")}
        required
      >
        <textarea
          className={styles.textarea}
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </FormField>
      <div className={styles.actionRow}>
        <Button
          variant="ghost"
          disabled={!reason.trim() || action.isPending}
          onClick={reopen}
        >
          {t("safety:governance.action.reopenCta")}
        </Button>
      </div>
    </>
  );
}
