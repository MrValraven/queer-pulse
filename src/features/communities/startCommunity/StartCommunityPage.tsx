import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import { PageMeta } from "../../../shared/seo";
import { Collapse, FadeIn, SkeletonLine } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import type { CreatedCommunity } from "./startCommunity.data";
import {
  emptyDraft,
  ownerStewardFrom,
  useCommunityForm,
} from "./useCommunityForm";
import type { StoredCommunityDraft } from "./communityDraftStorage";
import {
  useStartCommunityAutosave,
  useStartCommunityDraftLoad,
  type StartCommunityDraftSource,
} from "./useStartCommunityDraft";
import {
  PEOPLE_STEP,
  useStartCommunityActions,
  type StartCommunityPhase,
} from "./useStartCommunityActions";
import { useQuickStartLayout } from "./useQuickStartLayout";
import {
  firstOpenChapter,
  firstOpenQuickStep,
  quickMissingByStep,
  type QuickStep,
} from "./quickStartCommunity.model";
import { StartCommunityFormPanel } from "./StartCommunityFormPanel";
import { QuickStartCommunity } from "./QuickStartCommunity";
import { StartCommunitySuccess } from "./StartCommunitySuccess";
import styles from "./StartCommunityPage.module.css";

/** Page header: back link, eyebrow, and the coral-`<em>` title/lead. */
function StartCommunityHero() {
  const { t } = useTranslation();
  return (
    <header className={styles.hero}>
      <div className={`${styles.heroInner} wrap`}>
        <Link to={routes.communities} className={styles.back}>
          <FiArrowLeft size={14} /> {t("communities:start.hero.back")}
        </Link>
        <div className={styles.eyebrow}>
          {t("communities:start.hero.eyebrow")}
        </div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="communities:start.hero.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="communities:start.hero.lead"
            components={{ strong: <b /> }}
          />
        </p>
      </div>
    </header>
  );
}

/** The quick step a loaded draft opens on. The missing fields are read from
 *  the draft merged over the empty one, the same merge the form seed uses, so
 *  a draft an older build saved without a field still reads. */
function quickStepForStoredDraft(stored: StoredCommunityDraft): QuickStep {
  if (stored.quickStep !== undefined) return stored.quickStep;
  const mergedDraft = {
    ...emptyDraft(ownerStewardFrom(null)),
    ...stored.draft,
  };
  return firstOpenQuickStep(quickMissingByStep(mergedDraft));
}

/** The founding flow itself, seeded once from the draft the page loaded. Under
 *  the mobile width it shows the three-step quick flow, above it the wizard;
 *  both read and write the same form, so the founder's words survive a switch. */
function StartCommunityWizard({
  ownerSlug,
  initial,
  source,
}: {
  ownerSlug: string;
  initial: StoredCommunityDraft | null;
  source: StartCommunityDraftSource;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const isQuickLayout = useQuickStartLayout();
  const form = useCommunityForm(initial?.draft);
  const [step, setStep] = useState(initial?.step ?? 0);
  const [quickStep, setQuickStep] = useState<QuickStep>(
    () =>
      initial?.quickStep ?? firstOpenQuickStep(quickMissingByStep(form.draft)),
  );
  const [phase, setPhase] = useState<StartCommunityPhase>("form");
  const [created, setCreated] = useState<CreatedCommunity | null>(null);
  /** A handle the server refused as taken, shown inline on the handle field. */
  const [handleError, setHandleError] = useState<string | null>(null);

  // Crossing the mobile width opens the other layout on its first step with
  // something missing, so the founder lands where the work is.
  // The count keys the fade between the two layouts, so the panel fades only
  // on a real flip and the first mount keeps the page-level entrance alone.
  const [previousIsQuickLayout, setPreviousIsQuickLayout] =
    useState(isQuickLayout);
  const [layoutFlipCount, setLayoutFlipCount] = useState(0);
  if (previousIsQuickLayout !== isQuickLayout) {
    setPreviousIsQuickLayout(isQuickLayout);
    setLayoutFlipCount((count) => count + 1);
    if (isQuickLayout) {
      setQuickStep(firstOpenQuickStep(quickMissingByStep(form.draft)));
    } else {
      setStep(firstOpenChapter(form.missing));
    }
  }

  // Nine chapters is a long way to lose, so the founder's words and chapter
  // autosave to the server while the form is open, and a reload, a phone
  // backgrounding the PWA or a session refresh through OAuth comes back where
  // they left off. `useUnsavedChangesGuard` below catches a deliberate exit.
  // The quick flow saves its own step beside the first open chapter, so the
  // saved chapter stays a wizard index for the admin draft progress.
  const communityDraft = useStartCommunityAutosave({
    ownerSlug,
    draft: form.draft,
    step: isQuickLayout ? firstOpenChapter(form.missing) : step,
    quickStep: isQuickLayout ? quickStep : undefined,
    missingByStep: form.missing,
    isDirty: form.isDirty,
    hasEdited: form.hasEdited,
    isEnabled: phase === "form",
    source,
  });

  // Warn before an in-progress community is abandoned. Only while still on the
  // form: once founding begins (phase "opening"/"done") the guard is inactive, so
  // the redirect into the brand-new community hub navigates freely.
  useUnsavedChangesGuard({
    active: phase === "form" && form.isDirty,
    confirmMessage: t("communities:start.leaveConfirm"),
  });

  const isInviteStepAvailable = demoMode;
  const isStepSkipped = (chapter: number) =>
    !isInviteStepAvailable && chapter === PEOPLE_STEP;

  const actions = useStartCommunityActions({
    ownerSlug,
    form,
    step,
    setStep,
    quickStep,
    setQuickStep,
    isQuickLayout,
    setPhase,
    setCreated,
    setHandleError,
    isStepSkipped,
    communityDraft,
  });

  // A null answer (the slot emptied elsewhere) keeps the founder's words as typed.
  const loadNewerDraft = () => {
    void communityDraft.loadNewer().then((stored) => {
      if (stored === null) return;
      form.reset(stored.draft);
      // The picked cover belongs to the replaced draft, like the avatar reset clears.
      form.setCoverPreviewUrl(null);
      setStep(stored.step);
      setQuickStep(quickStepForStoredDraft(stored));
    });
  };

  const draftProps = {
    draftStatus: communityDraft.status,
    conflict: communityDraft.conflict,
    isConflictBusy: communityDraft.isConflictBusy,
    onLoadNewer: loadNewerDraft,
    onKeepThisVersion: communityDraft.keepThisVersion,
  };

  const formPanel = isQuickLayout ? (
    <QuickStartCommunity
      quickStep={quickStep}
      form={form}
      missing={quickMissingByStep(form.draft)[quickStep]}
      handleError={handleError}
      onHandleChange={() => setHandleError(null)}
      onBack={actions.backQuick}
      onNext={actions.nextQuick}
      {...draftProps}
    />
  ) : (
    <StartCommunityFormPanel
      step={step}
      form={form}
      isInviteStepAvailable={isInviteStepAvailable}
      isStepSkipped={isStepSkipped}
      goToStep={actions.goToStep}
      handleError={handleError}
      onHandleChange={() => setHandleError(null)}
      onBack={actions.back}
      onNext={actions.next}
      {...draftProps}
    />
  );

  return (
    <>
      {phase === "form" &&
        (layoutFlipCount === 0 ? (
          formPanel
        ) : (
          <FadeIn key={layoutFlipCount}>{formPanel}</FadeIn>
        ))}

      {phase === "opening" && (
        <div className={styles.page}>
          <div className={styles.statusPanel}>
            <div className={styles.ring} />
            <p>{t("communities:start.opening.status")}</p>
          </div>
        </div>
      )}

      {phase === "done" && created && (
        <div className={styles.page}>
          <StartCommunitySuccess
            community={created}
            onAnother={actions.startAnother}
          />
        </div>
      )}
    </>
  );
}

/** Holds the wizard's place while the founder's saved draft loads. */
function StartCommunityWizardLoading() {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.wizardLoading} role="status" aria-busy="true">
        <span className="visuallyHidden">
          {t("communities:common.loading")}
        </span>
        <SkeletonLine height={12} width="40%" />
        <SkeletonLine height={36} width="75%" />
        <SkeletonLine height={16} />
        <SkeletonLine height={16} width="85%" />
        <SkeletonLine height={120} />
      </div>
    </div>
  );
}

/** The id `AuthProvider` gives its demo mock member. */
const DEMO_SESSION_USER_ID = "demo";

/** Loads the founder's draft (the server copy, else the old tab copy), then opens the wizard on it. */
export function StartCommunityPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user, checking } = useAuth();
  const ownerSlug = user?.profile.slug ?? "";
  const draftLoad = useStartCommunityDraftLoad(ownerSlug);
  // The quick flow carries its own compact header on a phone, so the hero
  // folds away there. It is open on a desktop mount with no entrance.
  const isQuickLayout = useQuickStartLayout();
  // Right after a demo switch the session can still hold the other mode's
  // member (demo sets its mock in an effect, live waits for /auth/me). A
  // wizard mounted then would copy that member into the owner steward and
  // save them into this mode's draft, so it waits for the matching session.
  const isSessionForThisMode =
    !checking &&
    (user === null || (user.id === DEMO_SESSION_USER_ID) === demoMode);

  return (
    <PageShell>
      <PageMeta
        title={t("communities:seo.start.title")}
        description={t("communities:seo.start.description")}
      />
      <Collapse isOpen={!isQuickLayout}>
        <StartCommunityHero />
      </Collapse>

      <div className="wrap">
        {draftLoad.isLoading || !isSessionForThisMode ? (
          <StartCommunityWizardLoading />
        ) : (
          // Keyed by mode and owner: a demo switch or another member re-seeds
          // the wizard, so one slot's words never autosave into another's.
          <FadeIn key={`${demoMode ? "demo" : "live"}:${ownerSlug}`}>
            <StartCommunityWizard
              ownerSlug={ownerSlug}
              initial={draftLoad.initial}
              source={draftLoad.source}
            />
          </FadeIn>
        )}
      </div>
    </PageShell>
  );
}
