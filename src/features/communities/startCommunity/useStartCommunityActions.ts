import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes, communityPath } from "../../../app/routeMap";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { useCreateCommunity } from "../api/useCommunityMutations";
import { draftToCreateDto } from "../api/communities.adapters";
import { communityErrorText } from "../communityErrors";
import {
  TOTAL_STEPS,
  resolvePresetRules,
  type CreatedCommunity,
} from "./startCommunity.data";
import { createCommunityRecord } from "./createdCommunities.store";
import type { CommunityForm } from "./useCommunityForm";
import type { StartCommunityAutosave } from "./useStartCommunityDraft";
import {
  QUICK_OPEN_STEP,
  isQuickStep,
  quickMissingByStep,
  type QuickStep,
} from "./quickStartCommunity.model";

export type StartCommunityPhase = "form" | "opening" | "done";

/** Chapter 7, the day-one invite picker. `POST /communities` accepts an
 *  `invites` array but stores nothing from it yet, so in live mode the chapter
 *  would gather a guest list, recap it as "Inviting · 4 on day one", and drop
 *  it the moment the community opens. Until the backend persists invites, live
 *  skips the chapter outright with its picker, recap row and promise. Demo mode
 *  keeps it (its founding flow is local and does seed the preview roster). */
export const PEOPLE_STEP = 7;
/** Chapter 8, where the handle lives (the wizard's final step). */
export const CONFIRM_STEP = 8;

/** How long the demo founding shows its opening status before it lands. */
const DEMO_OPENING_DELAY_MS = 1500;

export interface StartCommunityActionsOptions {
  ownerSlug: string;
  form: CommunityForm;
  step: number;
  setStep: (step: number) => void;
  quickStep: QuickStep;
  setQuickStep: (quickStep: QuickStep) => void;
  isQuickLayout: boolean;
  setPhase: (phase: StartCommunityPhase) => void;
  setCreated: (created: CreatedCommunity | null) => void;
  setHandleError: (handleError: string | null) => void;
  isStepSkipped: (step: number) => boolean;
  communityDraft: StartCommunityAutosave;
}

/** The founding flow's moves for both layouts: next (founding the community on
 *  the last chapter or quick step), back, and starting another once one opens.
 *  Split out of `StartCommunityWizard` to keep both under the 200-line limit. */
export function useStartCommunityActions({
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
}: StartCommunityActionsOptions) {
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
  // The founding answers land after the window may have crossed the mobile
  // width, so they read the layout on screen at that moment.
  const isQuickLayoutRef = useRef(isQuickLayout);
  useEffect(() => {
    isQuickLayoutRef.current = isQuickLayout;
  }, [isQuickLayout]);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goToStep = (nextStep: number) => {
    // A chapter move is an edit: the saved draft reopens on the new chapter.
    form.markEdited();
    setStep(nextStep);
    scrollUp();
  };
  const goToQuickStep = (nextQuickStep: QuickStep) => {
    // A quick step move is an edit too, so the saved draft reopens on it.
    form.markEdited();
    setQuickStep(nextQuickStep);
    scrollUp();
  };

  /** Founds the community from the whole draft, for both layouts. */
  const found = () => {
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
    // Live: POST /communities, then land in the new community's hub. The
    // demo wizard keeps the in-page create-it-live success with no network.
    if (!demoMode) {
      create.mutate(draftToCreateDto(submitDraft), {
        onSuccess: (dto) => {
          // The server deleted the draft on POST, so only the cached copy goes.
          communityDraft.forget();
          if (!dto) return;
          if (isQuickLayoutRef.current) {
            showToast(
              t("communities:start.toast.created", { name: dto.name }),
              "success",
            );
          }
          void navigate(communityPath(dto.slug));
        },
        onError: (error) => {
          // A 409 is one specific, fixable thing: the handle is taken. The
          // handle field says so, which gives the founder the one thing to
          // change.
          const isHandleTaken =
            error instanceof ApiError && error.status === 409;
          setPhase("form");
          if (isHandleTaken) {
            setHandleError(t("communities:start.confirm.handleTaken"));
            if (isQuickLayoutRef.current) goToQuickStep(QUICK_OPEN_STEP);
            else goToStep(CONFIRM_STEP);
            return;
          }
          setHandleError(null);
          showToast(communityErrorText(t, error), "error");
        },
      });
      return;
    }
    openTimer.current = setTimeout(() => {
      const record = createCommunityRecord(submitDraft, ownerSlug);
      // Demo has no server to delete it, so this empties the demo store slot.
      communityDraft.forget();
      createOwned(record.slug);
      showToast(
        t("communities:start.toast.created", { name: record.name }),
        "success",
      );
      // The quick flow lands on the new community page, where its setup
      // checklist waits.
      if (isQuickLayoutRef.current) {
        void navigate(communityPath(record.slug));
        return;
      }
      setCreated(record);
      setPhase("done");
      scrollUp();
    }, DEMO_OPENING_DELAY_MS);
  };

  const next = () => {
    if (!form.canAdvance(step)) return;
    if (step < TOTAL_STEPS - 1) {
      const following = step + 1;
      goToStep(isStepSkipped(following) ? following + 1 : following);
      return;
    }
    found();
  };

  const back = () => {
    if (step === 0) {
      void navigate(routes.communities);
      return;
    }
    const previous = step - 1;
    goToStep(isStepSkipped(previous) ? previous - 1 : previous);
  };

  const nextQuick = () => {
    if (quickMissingByStep(draft)[quickStep].length > 0) return;
    const following = quickStep + 1;
    if (isQuickStep(following)) {
      goToQuickStep(following);
      return;
    }
    found();
  };

  const backQuick = () => {
    const previous = quickStep - 1;
    if (isQuickStep(previous)) {
      goToQuickStep(previous);
      return;
    }
    void navigate(routes.communities);
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

  return {
    goToStep,
    next,
    back,
    startAnother,
    goToQuickStep,
    nextQuick,
    backQuick,
  };
}
