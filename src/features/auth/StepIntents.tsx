import { useState } from "react";
import { Button, ChipSelect, useChipSet } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUpdateProfile } from "../members/api/useUpdateProfile";
import { INTENTS } from "./onboardingPage.data";
import { type StepProps } from "./OnboardingStepChrome";
import styles from "./OnboardingPage.module.css";

export function StepIntents({ onNext, onBack, stepLabel }: StepProps) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();
  const [error, setError] = useState<string | null>(null);
  const { selected: selectedIntents, toggle: toggleIntent } = useChipSet([
    "Community",
    "Professional connections",
    "Creative collaboration",
  ]);
  // At least one intent is required so we can actually personalize the experience.
  const hasSelection = selectedIntents.size > 0;

  async function handleContinue() {
    setError(null);
    try {
      // Intents have no dedicated backend field; they persist as the profile's
      // free-text `lookingFor` list (PATCH /profiles/me). Demo mode no-ops.
      await updateProfile.mutateAsync({ lookingFor: [...selectedIntents] });
      onNext();
    } catch {
      setError(t("auth:onboarding.stepIntents.saveError"));
    }
  }

  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h} id="onboarding-intents-heading">
        <Translation
          i18nKey="auth:onboarding.stepIntents.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.chipHint}>
        {t("auth:onboarding.stepIntents.hint")}
      </div>
      <ChipSelect
        className={styles.chips}
        labelledBy="onboarding-intents-heading"
        options={INTENTS.map((intent) => ({
          value: intent.value,
          label: t(intent.labelKey),
        }))}
        selected={selectedIntents}
        onToggle={toggleIntent}
      />
      {error && (
        <p className={styles.chipHint} role="alert">
          {error}
        </p>
      )}
      <div className={styles.nav}>
        <Button
          onClick={() => void handleContinue()}
          disabled={!hasSelection || updateProfile.isPending}
        >
          {t("auth:onboarding.stepIntents.continue")}
        </Button>
        <button type="button" className={styles.back} onClick={onBack}>
          {t("auth:onboarding.stepIntents.back")}
        </button>
      </div>
    </>
  );
}
