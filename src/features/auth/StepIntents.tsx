import { useState } from "react";
import { FiArrowLeft, FiEye } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  ChipSelect,
  LoadErrorState,
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

  const shouldLoadOwnIntents = !demoMode && Boolean(ownSlug);

  if (shouldLoadOwnIntents && existingIntents.isPending) {
    return <StepIntentsLoading stepLabel={props.stepLabel} />;
  }

  // A failed load leaves the step unable to say what the member already chose,
  // so it offers a retry in place of the form. Skip and Back stay available so
  // an outage can never trap someone in onboarding.
  if (shouldLoadOwnIntents && existingIntents.isError) {
    return (
      <StepIntentsLoadError
        stepLabel={props.stepLabel}
        onRetry={() => void existingIntents.refetch()}
        onSkip={props.onNext}
        onBack={props.onBack}
      />
    );
  }

  // The member's saved visibility choice is only known once the profile has
  // actually loaded. Demo mode has no stored value to widen (the save no-ops),
  // so it keeps the signed-off "on" default; every other unresolved case starts
  // the toggle private and leaves `lookingForPublic` out of the save entirely,
  // so a load we never completed can never widen who sees the list.
  const hasKnownVisibility = demoMode || existingIntents.isSuccess;

  return (
    <StepIntentsForm
      {...props}
      initialSelection={existingIntents.data?.lookingFor ?? []}
      // A member who already turned this off in Settings keeps it off; everyone
      // else starts on, which is the signed-off onboarding default.
      initialIsPublic={
        hasKnownVisibility
          ? (existingIntents.data?.lookingForPublic ?? true)
          : false
      }
      hasKnownVisibility={hasKnownVisibility}
    />
  );
}

function StepIntentsForm({
  onNext,
  onBack,
  stepLabel,
  initialSelection,
  initialIsPublic,
  hasKnownVisibility,
}: StepProps & {
  initialSelection: readonly string[];
  initialIsPublic: boolean;
  hasKnownVisibility: boolean;
}) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();
  const [saveError, setSaveError] = useState<string | null>(null);
  const { selected: selectedIntents, toggle: toggleIntent } =
    useChipSet(initialSelection);
  const [isLookingForPublic, setIsLookingForPublic] = useState(initialIsPublic);
  // Whether the member moved the toggle during this step. Their own deliberate
  // choice is always worth saving, even when we couldn't read the stored one.
  const [hasChosenVisibility, setHasChosenVisibility] = useState(false);
  // At least one intent is required so we can actually personalize the experience.
  const hasSelection = selectedIntents.size > 0;

  function handleVisibilityChange(nextIsLookingForPublic: boolean) {
    setHasChosenVisibility(true);
    setIsLookingForPublic(nextIsLookingForPublic);
  }

  async function handleContinue() {
    setSaveError(null);
    try {
      // Intents have no dedicated backend field; they persist as the profile's
      // free-text `lookingFor` list (PATCH /profiles/me). Demo mode no-ops.
      // Visibility is the member's own call and is stated on the step: the list
      // can name Dating, Housing or Finding flatmates, so it must never be
      // published on their behalf, and a member who already set it to private
      // must never have it flipped back by a replay of onboarding. When the
      // stored value never loaded and the member left the toggle alone, the
      // field is omitted from the PATCH so the server keeps whatever it holds.
      const shouldSaveVisibility = hasKnownVisibility || hasChosenVisibility;
      await updateProfile.mutateAsync({
        lookingFor: [...selectedIntents],
        ...(shouldSaveVisibility
          ? { lookingForPublic: isLookingForPublic }
          : {}),
      });
      onNext();
    } catch {
      setSaveError(t("auth:onboarding.stepIntents.saveError"));
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
            {isLookingForPublic
              ? t("auth:onboarding.stepIntents.visibility.descPublic")
              : t("auth:onboarding.stepIntents.visibility.descPrivate")}
          </div>
        </div>
        <Toggle
          tone="coral"
          checked={isLookingForPublic}
          onChange={handleVisibilityChange}
          label={t("auth:onboarding.stepIntents.visibility.title")}
        />
      </div>
      {saveError && (
        <p className={styles.chipHint} role="alert">
          {saveError}
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
      <div className={`${styles.chips} ${styles.chipSkeletons}`} aria-hidden>
        <SkeletonLine height={38} width="46%" />
        <SkeletonLine height={38} width="60%" />
        <SkeletonLine height={38} width="52%" />
      </div>
    </>
  );
}

/** Shown when the member's saved intents and their visibility setting fail to
 *  load. Continue is withheld here on purpose: writing `lookingForPublic` from
 *  a guess could publish that someone is looking for Dating or Housing. */
function StepIntentsLoadError({
  stepLabel,
  onRetry,
  onSkip,
  onBack,
}: {
  stepLabel: string;
  onRetry: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
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
      <LoadErrorState
        onRetry={onRetry}
        title={
          <Translation
            i18nKey="auth:onboarding.stepIntents.loadError.title"
            components={{ em: <em /> }}
          />
        }
        description={t("auth:onboarding.stepIntents.loadError.body")}
      />
      <div className={styles.nav}>
        <SkipLink
          onSkip={onSkip}
          label={t("auth:onboarding.stepIntents.skip")}
        />
        <button type="button" className={styles.back} onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("auth:onboarding.stepIntents.back")}
        </button>
      </div>
    </>
  );
}
