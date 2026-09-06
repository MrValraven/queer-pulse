import { useState } from "react";
import { Button, FormField } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SAFE_SPACE_TIERS } from "./adminSafeSpaceGovernance.data";
import { useAdminSafeSpaceNominationAction } from "../safety/api/useAdminSafeSpaceNominations";
import type { AdminSafeSpaceNominationDTO } from "../safety/api/safeSpaceGovernance.api";
import { readVisitBarOverrideCounts } from "./api/safeSpaceVisitBarError";
import styles from "./AdminSafeSpaceGovernance.module.css";

/**
 * The backend's `@MinLength(20)` on `belowVisitBarReason`, mirrored so the
 * award button is disabled rather than the server answering with a 400 the
 * reviewer has to decode. Overriding a published guarantee is held to the same
 * floor as a member-facing moderation note.
 */
const MINIMUM_OVERRIDE_REASON_LENGTH = 20;

/**
 * Step three and four of the published six: the review team decides, and a
 * badge is granted or the nomination is declined.
 *
 * The written reason is required on BOTH outcomes and both buttons stay
 * disabled without one. A badge granted with no stated basis is the thing
 * being fixed here, and a decline with no stated basis is a member being told
 * nothing.
 *
 * The three-visit bar now GATES the award. Under three independent visits the
 * service refuses with `SAFE_SPACE_VISIT_BAR_NOT_MET` unless a second, longer
 * reason is written, so this form asks for that reason in place rather than
 * letting the reviewer discover the refusal by hitting it. The override lands
 * on the audit row and forces the public provenance line to state the real
 * count, which is why the helper text says so before it is used.
 */
export function AdminSafeSpaceDecideForm({
  nominationId,
  visits,
}: {
  nominationId: string;
  visits: AdminSafeSpaceNominationDTO["visits"];
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const action = useAdminSafeSpaceNominationAction();
  const [reason, setReason] = useState("");
  const [tier, setTier] = useState(2);
  const [belowVisitBarReason, setBelowVisitBarReason] = useState("");
  // Set only by a 403 from the server, because the form cannot know the
  // caller's account tier from here. The first attempt is what reveals it, so
  // the refusal has to explain itself rather than read as a plain failure.
  const [overrideForbiddenCounts, setOverrideForbiddenCounts] = useState<{
    independentVisitCount: number;
    requiredVisitCount: number;
  } | null>(null);

  // A nomination with no listing tied to it has no tally yet, and the service
  // refuses that award earlier for a different reason. Treat it as "bar not
  // yet in play" so this field never appears asking for an exception to a
  // count nobody has taken.
  const isBelowVisitBar = Boolean(visits) && !visits?.hasMetVisitBar;
  const hasUsableOverrideReason =
    belowVisitBarReason.trim().length >= MINIMUM_OVERRIDE_REASON_LENGTH;
  // Once the server has said the override is not this caller's to use, asking
  // them for a longer reason is asking for something that cannot be accepted.
  // The award stays blocked while the count is short, and declining is
  // unaffected, which is the part of their job the narrowing does not touch.
  const canAward =
    Boolean(reason.trim()) &&
    (!isBelowVisitBar || (hasUsableOverrideReason && !overrideForbiddenCounts));

  function decide(outcome: "award" | "decline") {
    action.mutate(
      {
        kind: "decide",
        id: nominationId,
        outcome,
        reason: reason.trim(),
        ...(outcome === "award" ? { tier } : {}),
        ...(outcome === "award" && isBelowVisitBar
          ? { belowVisitBarReason: belowVisitBarReason.trim() }
          : {}),
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
          setBelowVisitBarReason("");
        },
        onError: (error) => {
          // The platform-staff-only refusal on the override is its own state,
          // never the generic failure. A delegate who reached this endpoint on
          // the `directory_moderator` grant alone may decide this nomination
          // and may award it above the bar; what they may not do is waive a
          // guarantee the platform publishes. Telling them "that failed" would
          // send them back to rewrite a reason that can never be accepted.
          const overrideCounts = readVisitBarOverrideCounts(error);
          if (overrideCounts) {
            setOverrideForbiddenCounts(overrideCounts);
            return;
          }
          showToast(t("safety:governance.toast.failed"), "error");
        },
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

      {overrideForbiddenCounts && (
        <p className={styles.visitNote} role="alert">
          <strong>{t("admin:adminSafeSpaces.underBar.forbiddenTitle")}</strong>{" "}
          {t("admin:adminSafeSpaces.underBar.forbiddenBody", {
            required: overrideForbiddenCounts.requiredVisitCount,
          })}
        </p>
      )}

      {isBelowVisitBar && !overrideForbiddenCounts && (
        <FormField
          label={t("safety:governance.action.belowBarLabel")}
          helper={t("safety:governance.action.belowBarHelper", {
            count: visits?.independentVisitCount ?? 0,
            required: visits?.requiredVisitCount ?? 0,
            min: MINIMUM_OVERRIDE_REASON_LENGTH,
          })}
          required
        >
          <textarea
            className={styles.textarea}
            rows={3}
            value={belowVisitBarReason}
            onChange={(event) => setBelowVisitBarReason(event.target.value)}
          />
        </FormField>
      )}

      <div className={styles.actionRow}>
        <Button
          variant="jade"
          disabled={!canAward || action.isPending}
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
