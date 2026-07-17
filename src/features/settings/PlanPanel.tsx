import { useMemo, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  buildTiers,
  buildCurrentPlan,
  NEXT_BILLING_DATE,
  type TierKey,
} from "./membership.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import styles from "./MembershipPage.module.css";

export function PlanPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const tiers = useMemo(() => buildTiers(t, fmt), [t, fmt]);
  const currentPlan = useMemo(() => buildCurrentPlan(t, fmt), [t, fmt]);
  const [tierKey, setTierKey] = useState<TierKey>("sustaining");
  const [amount, setAmount] = useState<number | "other">(20);
  const [saving, setSaving] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const tier = tiers.find((candidate) => candidate.key === tierKey)!;
  const renewalDate = fmt.date(NEXT_BILLING_DATE);

  function pickTier(next: TierKey) {
    setTierKey(next);
    const nextTier = tiers.find((candidate) => candidate.key === next)!;
    if (nextTier.defaultAmt !== undefined) setAmount(nextTier.defaultAmt);
  }

  function savePlan() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast(
        t("settings:membership.plan.toast.updated", { date: renewalDate }),
        "success",
      );
    }, 1400);
  }

  function confirmPause() {
    setPauseOpen(false);
    showToast(
      t("settings:membership.plan.toast.paused", { date: renewalDate }),
      "success",
    );
  }

  function confirmCancel() {
    setCancelOpen(false);
    showToast(
      t("settings:membership.plan.toast.cancelled", { date: renewalDate }),
      "info",
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.current}>
        <div className={styles.currEye}>
          {t("settings:membership.current.eyebrow")}
        </div>
        <div className={styles.currTier}>{currentPlan.tier}</div>
        <div className={styles.currAmt}>
          {currentPlan.amount} <span>{currentPlan.cadence}</span>
        </div>
        <div className={styles.currMeta}>{currentPlan.since}</div>
        <div className={styles.currPill}>
          <span className={styles.cpillDot} />
          {t("settings:membership.current.activeBadge")}
        </div>
      </div>

      <div className={styles.sec}>
        {t("settings:membership.plan.switchTier")}
      </div>
      <div className={styles.tierGrid}>
        {tiers.map((candidate) => (
          <button
            type="button"
            key={candidate.key}
            className={`${styles.tierBtn} ${tierKey === candidate.key ? styles.sel : ""}`}
            onClick={() => pickTier(candidate.key)}
          >
            {candidate.name}
            <small>{candidate.sub}</small>
          </button>
        ))}
      </div>
      <div className={styles.tierDesc}>{tier.desc}</div>

      {tier.amounts && (
        <div>
          <div className={styles.amtGrid}>
            {tier.amounts.map((candidateAmount) => (
              <button
                type="button"
                key={candidateAmount}
                className={`${styles.amtBtn} ${amount === candidateAmount ? styles.sel : ""}`}
                onClick={() => setAmount(candidateAmount)}
              >
                {candidateAmount === "other"
                  ? t("settings:membership.tier.amount.other")
                  : fmt.currency(candidateAmount)}
                <small>
                  {candidateAmount === "other"
                    ? t("settings:membership.tier.amount.otherSub")
                    : t("settings:membership.current.cadence")}
                </small>
              </button>
            ))}
          </div>
          {amount === "other" && (
            <input
              className={styles.customIn}
              type="text"
              placeholder={t(
                "settings:membership.tier.customAmountPlaceholder",
                {
                  amount: fmt.currency(35),
                },
              )}
              autoFocus
            />
          )}
        </div>
      )}

      <p className={styles.fineprint}>
        {t("settings:membership.plan.fineprint")}
      </p>
      <Button variant="primary" onClick={savePlan} disabled={saving}>
        {saving
          ? t("settings:membership.plan.saving")
          : t("settings:membership.plan.saveCta")}
      </Button>

      <div className={styles.danger}>
        <button
          type="button"
          className={styles.dngBtn}
          onClick={() => setPauseOpen((open) => !open)}
        >
          {t("settings:membership.plan.pauseCta")}
        </button>
        <button
          type="button"
          className={styles.dngBtn}
          onClick={() => setCancelOpen((open) => !open)}
        >
          {t("settings:membership.plan.cancelCta")}
        </button>
      </div>

      {pauseOpen && (
        <div className={styles.confirmBox}>
          <p className={styles.confirmText}>
            {t("settings:membership.plan.pauseConfirmText", {
              date: renewalDate,
            })}
          </p>
          <div className={styles.confirmRow}>
            <Button variant="ghost" onClick={confirmPause}>
              {t("settings:membership.plan.confirmPause")}
            </Button>
            <Button variant="ghost" onClick={() => setPauseOpen(false)}>
              {t("settings:membership.plan.keepActive")}
            </Button>
          </div>
        </div>
      )}

      {cancelOpen && (
        <div className={styles.confirmBox}>
          <p className={styles.confirmHead}>
            {t("settings:membership.plan.beforeYouGo")}
          </p>
          <p className={styles.confirmText}>
            {t("settings:membership.plan.cancelConfirmText")}
          </p>
          <div className={styles.confirmRow}>
            <Button variant="ghost" onClick={confirmCancel}>
              {t("settings:membership.plan.cancelCta")}
            </Button>
            <Button variant="primary" onClick={() => setCancelOpen(false)}>
              {t("settings:membership.plan.keepMembership")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
