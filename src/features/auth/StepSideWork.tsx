import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Button, ChipSelect } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { SIDE_WORK_OPTIONS } from "./onboardingPage.data";
import { SkipLink, type StepProps } from "./OnboardingStepChrome";
import styles from "./OnboardingPage.module.css";

/**
 * Moment 4 — "do you also work as something else?" A single-pick chip
 * question (craft-adjacent options from `SIDE_WORK_OPTIONS`), fully
 * skippable and never persisted: the answer only decides where "Set one up"
 * deep-links (`routes.subprofilesDashboard?create=1[&kind=]`, read by
 * `MySubprofilesPage`). No new profile field for v1 — see Decision §4.
 */
export function StepSideWork({ onNext, onBack, stepLabel }: StepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string | null>(null);

  // Single-select: picking a chip replaces the prior pick; picking the same
  // chip again clears it. `ChipSelect` is Set-backed for multi-select
  // elsewhere, so this step drives a one-item Set by hand rather than reach
  // for `useChipSet` (which toggles independently, i.e. multi-select).
  function handleToggle(value: string) {
    setPicked((current) => (current === value ? null : value));
  }

  function handleSetOneUp() {
    const option = SIDE_WORK_OPTIONS.find((candidate) => candidate.value === picked);
    const query = option?.kind
      ? `?create=1&kind=${option.kind}`
      : "?create=1";
    void navigate(`${routes.subprofilesDashboard}${query}`);
  }

  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h} id="onboarding-sidework-heading">
        <Translation
          i18nKey="auth:onboarding.stepSideWork.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.chipHint}>
        {t("auth:onboarding.stepSideWork.hint")}
      </div>
      <ChipSelect
        className={styles.chips}
        labelledBy="onboarding-sidework-heading"
        options={SIDE_WORK_OPTIONS.map((option) => ({
          value: option.value,
          label: t(option.labelKey),
        }))}
        selected={picked ? new Set([picked]) : new Set()}
        onToggle={handleToggle}
      />
      <div className={styles.nav}>
        <Button onClick={handleSetOneUp} disabled={!picked}>
          {t("auth:onboarding.stepSideWork.cta")}
        </Button>
        <SkipLink onSkip={onNext} label={t("auth:onboarding.stepSideWork.skip")} />
        <button type="button" className={styles.back} onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("auth:onboarding.stepSideWork.back")}
        </button>
      </div>
    </>
  );
}
