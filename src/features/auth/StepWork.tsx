import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useUpdateProfile } from "../members/api/useUpdateProfile";
import { getProfile } from "../members/api/members.api";
import { WorkFieldPicker } from "../members/WorkFieldPicker";
import { type WorkFieldSelection } from "../members/workFieldPicker.data";
import { SkipLink, type StepProps } from "./OnboardingStepChrome";
import styles from "./OnboardingPage.module.css";

/**
 * "What do you do?" — the member's field(s) of work and profession(s). These
 * are the values the member directory's "What they do" / "Profession" filters
 * search on, so picking one here is what makes someone findable by their work
 * from day one instead of only after they discover Settings → Interests.
 *
 * Optional, like the photo step: skipping writes nothing. Seeds from the
 * member's existing selection so a re-run of onboarding never blanks a choice
 * they already made (defense-in-depth alongside the one-time gate).
 */
export function StepWork(props: StepProps) {
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const ownSlug = user?.profile.slug;

  // Live only: demo mode has no backend and the save no-ops, so a demo run
  // simply starts blank. The form is gated until this settles so the picker's
  // initial state is seeded correctly on its first mount.
  const existingWork = useQuery({
    queryKey: ["profile", demoMode, ownSlug, "work-field"],
    enabled: !demoMode && Boolean(ownSlug),
    queryFn: async () => {
      const profile = await getProfile(ownSlug!);
      return {
        discipline: profile.discipline ?? [],
        profession: profile.profession ?? [],
      };
    },
  });

  if (!demoMode && Boolean(ownSlug) && existingWork.isPending) {
    return <StepWorkLoading stepLabel={props.stepLabel} />;
  }

  return (
    <StepWorkForm
      {...props}
      initialSelection={existingWork.data ?? { discipline: [], profession: [] }}
    />
  );
}

function StepWorkForm({
  onNext,
  onBack,
  stepLabel,
  initialSelection,
}: StepProps & { initialSelection: WorkFieldSelection }) {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] =
    useState<WorkFieldSelection>(initialSelection);

  async function handleContinue() {
    setError(null);
    try {
      // Persisted as the profile's own `discipline`/`profession` columns
      // (PATCH /profiles/me), the same fields the profile editor and Settings
      // → Interests write. Demo mode no-ops.
      await updateProfile.mutateAsync({
        discipline: selection.discipline,
        profession: selection.profession,
      });
      onNext();
    } catch {
      setError(t("auth:onboarding.stepWork.saveError"));
    }
  }

  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h} id="onboarding-work-heading">
        <Translation
          i18nKey="auth:onboarding.stepWork.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.chipHint}>
        {t("auth:onboarding.stepWork.hint")}
      </div>
      <WorkFieldPicker
        className={styles.chips}
        discipline={selection.discipline}
        profession={selection.profession}
        onChange={setSelection}
      />
      {error && (
        <p className={styles.chipHint} role="alert">
          {error}
        </p>
      )}
      <div className={styles.nav}>
        <Button
          onClick={() => void handleContinue()}
          disabled={updateProfile.isPending}
        >
          {t("auth:onboarding.stepWork.continue")}
        </Button>
        <SkipLink onSkip={onNext} label={t("auth:onboarding.stepWork.skip")} />
        <button type="button" className={styles.back} onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("auth:onboarding.stepWork.back")}
        </button>
      </div>
    </>
  );
}

/** Holds the step's shape while the member's existing selection loads, so the
 *  picker is seeded correctly on first mount rather than flashing empty. */
function StepWorkLoading({ stepLabel }: { stepLabel: string }) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h} id="onboarding-work-heading">
        <Translation
          i18nKey="auth:onboarding.stepWork.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.chipHint}>
        {t("auth:onboarding.stepWork.hint")}
      </div>
      <div className={styles.chips} aria-hidden>
        <SkeletonLine height={38} width="52%" style={{ borderRadius: 999 }} />
        <SkeletonLine height={38} width="44%" style={{ borderRadius: 999 }} />
        <SkeletonLine height={38} width="58%" style={{ borderRadius: 999 }} />
      </div>
    </>
  );
}
