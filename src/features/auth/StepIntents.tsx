import { useState } from "react";
import { FiArrowLeft, FiEye } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  ChipSelect,
  SkeletonLine,
  Toggle,
  useChipSet,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useUpdateProfile } from "../members/api/useUpdateProfile";
import { getProfile } from "../members/api/members.api";
import { INTENTS } from "./onboardingPage.data";
import { SkipLink, type StepProps } from "./OnboardingStepChrome";
import styles from "./OnboardingPage.module.css";

export function StepIntents(props: StepProps) {
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const ownSlug = user?.profile.slug;

  // Load the member's EXISTING `lookingFor` (and whether they've already chosen
  // to show it) so a re-run of onboarding pre-selects both rather than starting
  // blank — defense-in-depth alongside the one-time gate. Live only: demo mode
  // has no backend and the save no-ops, so a demo run simply starts blank. The
  // interactive form is gated until this settles so `useChipSet` and the
  // visibility toggle are seeded correctly on their first mount (the initial
  // args are read once and can't be re-seeded later).
  const existingIntents = useQuery({
    queryKey: ["profile", demoMode, ownSlug, "looking-for"],
    enabled: !demoMode && Boolean(ownSlug),
    queryFn: async () => {
      const profile = await getProfile(ownSlug!);
      return {
        lookingFor: profile.lookingFor ?? [],
        lookingForPublic: profile.lookingForPublic,
      };
    },
  });

  if (!demoMode && Boolean(ownSlug) && existingIntents.isPending) {
    return <StepIntentsLoading stepLabel={props.stepLabel} />;
  }

  return (
    <StepIntentsForm
      {...props}
      initialSelection={existingIntents.data?.lookingFor ?? []}
      // A member who already turned this off in Settings keeps it off; everyone
      // else starts on, which is the signed-off onboarding default.
      initialIsPublic={existingIntents.data?.lookingForPublic ?? true}
    />
  );
}

function StepIntentsForm({
  onNext,
  onBack,
  stepLabel,
  initialSelection,
  initialIsPublic,
}: StepProps & {
  initialSelection: readonly string[];
  initialIsPublic: boolean;
}) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();
  const [error, setError] = useState<string | null>(null);
  const { selected: selectedIntents, toggle: toggleIntent } =
    useChipSet(initialSelection);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  // At least one intent is required so we can actually personalize the experience.
  const hasSelection = selectedIntents.size > 0;

  async function handleContinue() {
    setError(null);
    try {
      // Intents have no dedicated backend field; they persist as the profile's
      // free-text `lookingFor` list (PATCH /profiles/me). Demo mode no-ops.
      // Visibility is the member's own call and is stated on the step: the list
      // can name Dating, Housing or Finding flatmates, so it must never be
      // published on their behalf, and a member who already set it to private
      // must never have it flipped back by a replay of onboarding.
      await updateProfile.mutateAsync({
        lookingFor: [...selectedIntents],
        lookingForPublic: isPublic,
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
      <div className={styles.notifyCard}>
        <span className={styles.notifyIcon} aria-hidden>
          <FiEye />
        </span>
        <div className={styles.notifyBody}>
          <div className={styles.notifyTitle}>
            {t("auth:onboarding.stepIntents.visibility.title")}
          </div>
          <div className={styles.notifyDesc}>
            {isPublic
              ? t("auth:onboarding.stepIntents.visibility.descPublic")
              : t("auth:onboarding.stepIntents.visibility.descPrivate")}
          </div>
        </div>
        <Toggle
          tone="coral"
          checked={isPublic}
          onChange={setIsPublic}
          label={t("auth:onboarding.stepIntents.visibility.title")}
        />
      </div>
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
        <SkipLink
          onSkip={onNext}
          label={t("auth:onboarding.stepIntents.skip")}
        />
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
