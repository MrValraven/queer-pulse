import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import { FadeIn } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
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
import {
  clearCommunityDraft,
  readCommunityDraft,
  writeCommunityDraft,
} from "./communityDraftStorage";
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
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div>
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
        </div>

        <StartCommunityPreview draft={form.draft} />
      </div>
    </div>
  );
}

export function StartCommunityPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { createOwned } = useCommunityMembership();
  const create = useCreateCommunity();

  // Nine chapters is a long way to lose. The draft and the chapter the
  // founder was on are mirrored into sessionStorage and read back once, on
  // mount, so a reload or a session refresh that bounces through OAuth comes
  // back where they left off. `useUnsavedChangesGuard` below only ever caught
  // a deliberate navigation.
  const ownerSlug = user?.profile.slug ?? "";
  const [parked] = useState(() => readCommunityDraft(ownerSlug));
  const form = useCommunityForm(parked?.draft);
  const { draft } = form;
  const [step, setStep] = useState(parked?.step ?? 0);
  const [phase, setPhase] = useState<Phase>("form");
  const [created, setCreated] = useState<CreatedCommunity | null>(null);
  /** A handle the server refused as taken, shown inline on chapter 8. */
  const [handleError, setHandleError] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "form") return;
    if (!form.isDirty) return;
    writeCommunityDraft(ownerSlug, { draft, step });
  }, [ownerSlug, draft, step, phase, form.isDirty]);

  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (openTimer.current) clearTimeout(openTimer.current);
    },
    [],
  );

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

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goToStep = (n: number) => {
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
    // `draft.rules` still holds raw preset i18n keys for any covenant rule the
    // founder left untouched (StepTone matches on them to drive its toggle
    // state) — resolve those to real copy now, since what leaves the wizard
    // becomes the community's permanent, plain-text shared values.
    const submitDraft = {
      ...draft,
      rules: resolvePresetRules(draft.rules, t),
    };
    // Live: POST /communities, then land in the new community's hub. Demo keeps
    // the in-page create-it-live success (no network, no navigation).
    if (!demoMode) {
      create.mutate(draftToCreateDto(submitDraft), {
        onSuccess: (dto) => {
          clearCommunityDraft(ownerSlug);
          if (dto) void navigate(`/community/${dto.slug}`);
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
      clearCommunityDraft(ownerSlug);
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
    clearCommunityDraft(ownerSlug);
    setCreated(null);
    setStep(0);
    setHandleError(null);
    setPhase("form");
    scrollUp();
  };

  return (
    <PageShell>
      <StartCommunityHero />

      <div className="wrap">
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
            <StartCommunitySuccess
              community={created}
              onAnother={startAnother}
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
