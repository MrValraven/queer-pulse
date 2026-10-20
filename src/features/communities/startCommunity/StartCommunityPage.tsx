import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import { PageMeta } from "../../../shared/seo";
import { FadeIn, SkeletonLine } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes, communityPath } from "../../../app/routeMap";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useCreateCommunity } from "../api/useCommunityMutations";
import { draftToCreateDto } from "../api/communities.adapters";
import {
  TOTAL_STEPS,
  resolvePresetRules,
  type CreatedCommunity,
} from "./startCommunity.data";
import { createCommunityRecord } from "./createdCommunities.store";
import { useCommunityForm } from "./useCommunityForm";
import type { StoredCommunityDraft } from "./communityDraftStorage";
import {
  useStartCommunityAutosave,
  useStartCommunityDraftLoad,
  type StartCommunityAutosave,
  type StartCommunityDraftSource,
} from "./useStartCommunityDraft";
import { CreatorDraftConflictStrip } from "../../creatorDrafts/CreatorDraftConflictStrip";
import { CreatorDraftNotice } from "../../creatorDrafts/CreatorDraftNotice";
import { CreatorDraftSaveLine } from "../../creatorDrafts/CreatorDraftSaveLine";
import { ApiError } from "../../../shared/api/client";
import {
  FoundingThread,
  PanelActions,
  ChapterHead,
} from "./StartCommunityChrome";
import { StartCommunityPreview } from "./StartCommunityPreview";
import { StepOpening } from "./StartCommunityOpening";
import { StepWhy, StepWho } from "./StartCommunityIdentity";
import { StepSafety } from "./StartCommunityAccess";
import { StepRunning } from "./StartCommunityRunning";
import { StepTone } from "./StartCommunityTone";
import { StepFeeling } from "./StartCommunityFeeling";
import { StepPeople } from "./StartCommunityPeople";
import { StepConfirm } from "./StartCommunityConfirm";
import { StartCommunitySuccess } from "./StartCommunitySuccess";
import styles from "./StartCommunityPage.module.css";

type Phase = "form" | "opening" | "done";

/** Chapter 7 — the day-one invite picker. `POST /communities` accepts an
 *  `invites` array but stores nothing from it yet, so in live mode the chapter
 *  would gather a guest list, recap it as "Inviting · 4 on day one", and drop
 *  it the moment the community opens. Until the backend persists invites, live
 *  skips the chapter outright: no picker, no recap row, no promise. Demo mode
 *  keeps it (its founding flow is local and does seed the preview roster). */
const PEOPLE_STEP = 7;
/** Chapter 8, where the handle lives (the wizard's final step). */
const CONFIRM_STEP = 8;

const NEXT_LABEL_KEYS = [
  "communities:start.next.begin",
  "communities:start.next.people",
  "communities:start.next.door",
  "communities:start.next.who",
  "communities:start.next.tone",
  "communities:start.next.feeling",
  "communities:start.next.first",
  "communities:start.next.review",
  "communities:start.next.open",
];

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

/** Which chapter panel is on screen. Split out of `StartCommunityPage` so that
 *  component stays under the repo's 200-line limit. */
function StartCommunityChapter({
  step,
  form,
  isInviteStepAvailable,
  onEdit,
  handleError,
  onHandleChange,
}: {
  step: number;
  form: ReturnType<typeof useCommunityForm>;
  isInviteStepAvailable: boolean;
  onEdit: (step: number) => void;
  handleError: string | null;
  onHandleChange: () => void;
}) {
  return (
    <>
      {step > 0 && <ChapterHead index={step} />}
      {step === 0 && (
        <>
          <ChapterHead index={0} />
          <StepOpening />
        </>
      )}
      {step === 1 && <StepWhy form={form} />}
      {step === 2 && <StepWho form={form} />}
      {step === 3 && <StepSafety form={form} />}
      {step === 4 && <StepRunning form={form} />}
      {step === 5 && <StepTone form={form} />}
      {step === 6 && <StepFeeling form={form} />}
      {step === PEOPLE_STEP && isInviteStepAvailable && (
        <StepPeople form={form} />
      )}
      {step === CONFIRM_STEP && (
        <StepConfirm
          form={form}
          onEdit={onEdit}
          handleError={handleError}
          onHandleChange={onHandleChange}
        />
      )}
    </>
  );
}

/** The wizard while it is still being filled in: the chapter rail, the current
 *  chapter, its back/next footer, and the sticky live preview. Split out of
 *  `StartCommunityPage` to keep both components under the 200-line limit. */
function StartCommunityFormPanel({
  step,
  form,
  isInviteStepAvailable,
  isStepSkipped,
  goToStep,
  handleError,
  onHandleChange,
  onBack,
  onNext,
  draftStatus,
  conflict,
  isConflictBusy,
  onLoadNewer,
  onKeepThisVersion,
}: {
  step: number;
  form: ReturnType<typeof useCommunityForm>;
  isInviteStepAvailable: boolean;
  isStepSkipped: (step: number) => boolean;
  goToStep: (step: number) => void;
  handleError: string | null;
  onHandleChange: () => void;
  onBack: () => void;
  onNext: () => void;
  draftStatus: StartCommunityAutosave["status"];
  conflict: StartCommunityAutosave["conflict"];
  isConflictBusy: boolean;
  onLoadNewer: () => void;
  onKeepThisVersion: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div>
          <CreatorDraftConflictStrip
            isOpen={conflict !== null}
            isBusy={isConflictBusy}
            isServerDraftGone={conflict?.revision === null}
            onLoadNewer={onLoadNewer}
            onKeepThisVersion={onKeepThisVersion}
          />
          <FoundingThread
            step={step}
            onJump={goToStep}
            hiddenStep={isInviteStepAvailable ? undefined : PEOPLE_STEP}
          />
          <FadeIn key={step}>
            <div>
              <StartCommunityChapter
                step={step}
                form={form}
                isInviteStepAvailable={isInviteStepAvailable}
                onEdit={goToStep}
                handleError={handleError}
                onHandleChange={onHandleChange}
              />
              <PanelActions
                onBack={onBack}
                backLabel={
                  step === 0 ? (
                    t("communities:start.cancel")
                  ) : (
                    <>
                      <FiArrowLeft aria-hidden /> {t("communities:start.back")}
                    </>
                  )
                }
                onNext={onNext}
                nextLabel={t(
                  NEXT_LABEL_KEYS[isStepSkipped(step + 1) ? step + 1 : step] ??
                    "communities:start.next.fallback",
                )}
                missing={form.missing[step] ?? []}
                flush={step === 0}
              />
            </div>
          </FadeIn>
          <div className={styles.draftStatus}>
            <CreatorDraftSaveLine status={draftStatus} />
            <CreatorDraftNotice messageKey="communities:creatorDraftNote.body" />
          </div>
        </div>

        <StartCommunityPreview
          draft={form.draft}
          avatarPreviewUrl={form.avatarPreviewUrl}
          coverPreviewUrl={form.coverPreviewUrl}
        />
      </div>
    </div>
  );
}

/** The founding flow's moves: next (founding the community on the last
 *  chapter), back, and starting another once one opens. Split out of
 *  `StartCommunityWizard` to keep both under the 200-line limit. */
function useStartCommunityActions({
  ownerSlug,
  form,
  step,
  setStep,
  setPhase,
  setCreated,
  setHandleError,
  isStepSkipped,
  communityDraft,
}: {
  ownerSlug: string;
  form: ReturnType<typeof useCommunityForm>;
  step: number;
  setStep: (step: number) => void;
  setPhase: (phase: Phase) => void;
  setCreated: (created: CreatedCommunity | null) => void;
  setHandleError: (handleError: string | null) => void;
  isStepSkipped: (step: number) => boolean;
  communityDraft: StartCommunityAutosave;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { createOwned } = useCommunityMembership();
  const create = useCreateCommunity();
  const { draft } = form;

  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (openTimer.current) clearTimeout(openTimer.current);
    },
    [],
  );

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goToStep = (n: number) => {
    // A chapter move is an edit: the saved draft reopens on the new chapter.
    form.markEdited();
    setStep(n);
    scrollUp();
  };

  const next = () => {
    if (!form.canAdvance(step)) return;
    if (step < TOTAL_STEPS - 1) {
      const following = step + 1;
      goToStep(isStepSkipped(following) ? following + 1 : following);
      return;
    }
    // final step → found the community
    setPhase("opening");
    scrollUp();
    // `draft.rules` still holds raw library i18n keys for every value the
    // founder left ticked or picked from the browser (StepTone matches on them
    // to drive its toggle state, and they follow a mid-draft language switch).
    // Resolve those to real copy now, since what leaves the wizard becomes the
    // community's permanent, plain-text shared values.
    const submitDraft = {
      ...draft,
      rules: resolvePresetRules(draft.rules, t),
    };
    // Live: POST /communities, then land in the new community's hub. Demo keeps
    // the in-page create-it-live success (no network, no navigation).
    if (!demoMode) {
      create.mutate(draftToCreateDto(submitDraft), {
        onSuccess: (dto) => {
          // The server deleted the draft on POST, so only the cached copy goes.
          communityDraft.forget();
          if (dto) void navigate(communityPath(dto.slug));
        },
        onError: (error) => {
          // A 409 is one specific, fixable thing: the handle is taken. Say so
          // on the field instead of a generic "something went wrong" that
          // leaves the founder with nothing to change.
          const isHandleTaken =
            error instanceof ApiError && error.status === 409;
          setPhase("form");
          if (isHandleTaken) {
            setHandleError(t("communities:start.confirm.handleTaken"));
            goToStep(CONFIRM_STEP);
            return;
          }
          setHandleError(null);
          showToast(t("communities:start.toast.createError"), "error");
        },
      });
      return;
    }
    openTimer.current = setTimeout(() => {
      const record = createCommunityRecord(submitDraft, ownerSlug);
      // Demo has no server to delete it, so this empties the demo store slot.
      communityDraft.forget();
      createOwned(record.slug);
      setCreated(record);
      setPhase("done");
      showToast(
        t("communities:start.toast.created", { name: record.name }),
        "success",
      );
      scrollUp();
    }, 1500);
  };

  const back = () => {
    if (step === 0) {
      void navigate(routes.communities);
      return;
    }
    const previous = step - 1;
    goToStep(isStepSkipped(previous) ? previous - 1 : previous);
  };

  const startAnother = () => {
    form.reset();
    communityDraft.discard().catch(() => {
      showToast(t("communities:start.toast.draftDiscardError"), "error");
    });
    setCreated(null);
    setStep(0);
    setHandleError(null);
    setPhase("form");
    scrollUp();
  };

  return { goToStep, next, back, startAnother };
}

/** The wizard itself, seeded once from the draft the page loaded. */
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
  const form = useCommunityForm(initial?.draft);
  const [step, setStep] = useState(initial?.step ?? 0);
  const [phase, setPhase] = useState<Phase>("form");
  const [created, setCreated] = useState<CreatedCommunity | null>(null);
  /** A handle the server refused as taken, shown inline on chapter 8. */
  const [handleError, setHandleError] = useState<string | null>(null);

  // Nine chapters is a long way to lose, so the founder's words and chapter
  // autosave to the server while the form is open, and a reload, a phone
  // backgrounding the PWA or a session refresh through OAuth comes back where
  // they left off. `useUnsavedChangesGuard` below catches a deliberate exit.
  const communityDraft = useStartCommunityAutosave({
    ownerSlug,
    draft: form.draft,
    step,
    missingByStep: form.missing,
    isDirty: form.isDirty,
    hasEdited: form.hasEdited,
    isEnabled: phase === "form",
    source,
  });

  // Warn before an in-progress community is abandoned. Only while still on the
  // form: once founding begins (phase "opening"/"done") the guard is inactive, so
  // the live-mode redirect into the brand-new community hub navigates freely.
  useUnsavedChangesGuard({
    active: phase === "form" && form.isDirty,
    confirmMessage: t("communities:start.leaveConfirm"),
  });

  const isInviteStepAvailable = demoMode;
  const isStepSkipped = (n: number) =>
    !isInviteStepAvailable && n === PEOPLE_STEP;

  const { goToStep, next, back, startAnother } = useStartCommunityActions({
    ownerSlug,
    form,
    step,
    setStep,
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
    });
  };

  return (
    <>
      {phase === "form" && (
        <StartCommunityFormPanel
          step={step}
          form={form}
          isInviteStepAvailable={isInviteStepAvailable}
          isStepSkipped={isStepSkipped}
          goToStep={goToStep}
          handleError={handleError}
          onHandleChange={() => setHandleError(null)}
          onBack={back}
          onNext={next}
          draftStatus={communityDraft.status}
          conflict={communityDraft.conflict}
          isConflictBusy={communityDraft.isConflictBusy}
          onLoadNewer={loadNewerDraft}
          onKeepThisVersion={communityDraft.keepThisVersion}
        />
      )}

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
          <StartCommunitySuccess community={created} onAnother={startAnother} />
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
      <StartCommunityHero />

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
