import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  ChipSelect,
  SkeletonLine,
  useChipSet,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useUpdateProfile } from "../members/api/useUpdateProfile";
import { getProfile } from "../members/api/members.api";
import { INTENTS } from "./onboardingPage.data";
import { type StepProps } from "./OnboardingStepChrome";
import styles from "./OnboardingPage.module.css";

/**
 * The warm defaults shown to a member who has never set intents — a friendly
 * starting point so the step is never blank. A member who ALREADY has
 * `lookingFor` (a replay of the wizard) is seeded from that instead, so
 * continuing preserves their choices rather than wiping them.
 */
const PRESET_INTENTS = [
  "Community",
  "Professional connections",
  "Creative collaboration",
];

export function StepIntents(props: StepProps) {
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const ownSlug = user?.profile.slug;

  // Load the member's EXISTING `lookingFor` so a re-run of onboarding pre-selects
  // it rather than overwriting it with the presets — defense-in-depth alongside
  // the one-time gate. Live only: demo mode has no backend and the save no-ops,
  // so a demo run simply uses the presets. The interactive form is gated until
  // this settles so `useChipSet` is seeded with the right initial set on its
  // first mount (its initial arg is read once and can't be re-seeded later).
  const existingLookingFor = useQuery({
    queryKey: ["profile", demoMode, ownSlug, "looking-for"],
    enabled: !demoMode && Boolean(ownSlug),
    queryFn: async () => (await getProfile(ownSlug!)).lookingFor ?? [],
  });

  if (!demoMode && Boolean(ownSlug) && existingLookingFor.isPending) {
    return <StepIntentsLoading stepLabel={props.stepLabel} />;
  }

  const existing = existingLookingFor.data ?? [];
  const initialSelection = existing.length > 0 ? existing : PRESET_INTENTS;

  return <StepIntentsForm {...props} initialSelection={initialSelection} />;
}

function StepIntentsForm({
  onNext,
  onBack,
  stepLabel,
  initialSelection,
}: StepProps & { initialSelection: readonly string[] }) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();
  const [error, setError] = useState<string | null>(null);
  const { selected: selectedIntents, toggle: toggleIntent } =
    useChipSet(initialSelection);
  // At least one intent is required so we can actually personalize the experience.
  const hasSelection = selectedIntents.size > 0;

  async function handleContinue() {
    setError(null);
    try {
      // Intents have no dedicated backend field; they persist as the profile's
      // free-text `lookingFor` list (PATCH /profiles/me). Demo mode no-ops.
      // `lookingForPublic: true` makes the intents visible on the profile by
      // default when set during onboarding (an intentional, signed-off privacy
      // default — the column otherwise defaults to hidden).
      await updateProfile.mutateAsync({
        lookingFor: [...selectedIntents],
        lookingForPublic: true,
      });
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
          <FiArrowLeft aria-hidden /> {t("auth:onboarding.stepIntents.back")}
        </button>
      </div>
    </>
  );
}

/** Holds the step's shape while the member's existing intents load, so the chip
 *  set is seeded correctly on first mount rather than flashing the presets. */
function StepIntentsLoading({ stepLabel }: { stepLabel: string }) {
  const { t } = useTranslation();
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
      <div className={styles.chips} aria-hidden>
        <SkeletonLine height={38} width="46%" style={{ borderRadius: 999 }} />
        <SkeletonLine height={38} width="60%" style={{ borderRadius: 999 }} />
        <SkeletonLine height={38} width="52%" style={{ borderRadius: 999 }} />
      </div>
    </>
  );
}
