import {
  createContext,
  createElement,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import type { QuizshowOpenSessionInput } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  quizshowErrorCodeOf,
  quizshowErrorKeyOf,
  quizshowOpenSessionRefOf,
  quizshowProblemsOf,
} from "../api/quizshowErrors";
import { useOpenQuizshowSession } from "../api/useQuizshowMutations";
import {
  quizshowScopeScreenPath,
  type QuizshowSessionScope,
} from "../quizshowScope";
import type { QuizshowLocalProblem } from "./quizshowValidation";

interface OpenSessionRef {
  sessionId: string;
  joinCode: string;
}

interface OpenLobbyState {
  /** The input waiting for the host to confirm deleting kept results. */
  inputAwaitingReplace: QuizshowOpenSessionInput | null;
  problems: readonly QuizshowLocalProblem[];
  alreadyOpen: OpenSessionRef | null;
  errorKey: string | null;
}

/**
 * What a successful open does next. The default goes to the scope's big
 * screen; the phone remote's rematch (item 38) stays on the remote and closes
 * its dialog, since the remote picks the new session up by itself.
 */
export interface QuizshowAfterOpen {
  /** The page a successful open goes to; the current page is not pushed again. */
  afterOpenPath: (scope: QuizshowSessionScope) => string;
  /** Runs after a successful open, before any navigation. */
  onOpened?: () => void;
  /** A caller's own path replaces the current history entry, so Back skips the dialog's page. */
  shouldReplaceHistory?: boolean;
}

const QuizshowAfterOpenContext = createContext<QuizshowAfterOpen>({
  afterOpenPath: quizshowScopeScreenPath,
});

/** Set by `QuizshowOpenLobbyButton` when its caller passes `afterOpenPath`. */
export const QuizshowAfterOpenProvider = QuizshowAfterOpenContext.Provider;

const CLEAN_STATE: OpenLobbyState = {
  inputAwaitingReplace: null,
  problems: [],
  alreadyOpen: null,
  errorKey: null,
};

/**
 * The input as it goes out: every field named, so `isPractice` and
 * `rematchOfSessionId` always travel. A practice lobby (C6.9) sends no push
 * and never replaces kept results.
 */
function openInputOf(
  input: QuizshowOpenSessionInput,
): QuizshowOpenSessionInput {
  return {
    playMode: input.playMode,
    maxTeamSize: input.maxTeamSize,
    isReviewOn: input.isReviewOn,
    notifyGuests: input.notifyGuests && !input.isPractice,
    shouldReplaceResults: input.shouldReplaceResults && !input.isPractice,
    isPractice: input.isPractice,
    rematchOfSessionId: input.rematchOfSessionId,
  };
}

function stateAfterError(
  error: unknown,
  input: QuizshowOpenSessionInput,
): OpenLobbyState {
  const code = quizshowErrorCodeOf(error);
  // A practice lobby leaves kept results alone, so it never asks to replace them.
  if (code === "quizshow_results_exist" && !input.isPractice) {
    return { ...CLEAN_STATE, inputAwaitingReplace: input };
  }
  if (code === "quizshow_session_already_open") {
    const alreadyOpen = quizshowOpenSessionRefOf(error);
    if (alreadyOpen) return { ...CLEAN_STATE, alreadyOpen };
  }
  if (code === "quizshow_quiz_incomplete") {
    return { ...CLEAN_STATE, problems: quizshowProblemsOf(error) };
  }
  return { ...CLEAN_STATE, errorKey: quizshowErrorKeyOf(code) };
}

export function useQuizshowOpenLobby(scope: QuizshowSessionScope): {
  open: (input: QuizshowOpenSessionInput) => void;
  replaceResultsDialog: ReactNode;
  problems: readonly QuizshowLocalProblem[];
  alreadyOpen: OpenSessionRef | null;
  errorKey: string | null;
  isPending: boolean;
} {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { afterOpenPath, onOpened, shouldReplaceHistory } = useContext(
    QuizshowAfterOpenContext,
  );
  const mutation = useOpenQuizshowSession(scope);
  const [state, setState] = useState<OpenLobbyState>(CLEAN_STATE);

  async function submit(requested: QuizshowOpenSessionInput): Promise<void> {
    const input = openInputOf(requested);
    setState((previous) => ({
      ...CLEAN_STATE,
      inputAwaitingReplace: previous.inputAwaitingReplace,
    }));
    try {
      const response = await mutation.mutateAsync(input);
      if (response.isGuestPushSent) {
        showToast(t("quizshow:lobby.pushSent"), "success");
      } else if (input.notifyGuests) {
        showToast(t("quizshow:lobby.pushSkipped"), "info");
      }
      onOpened?.();
      const nextPath = afterOpenPath(scope);
      if (nextPath !== pathname) {
        void navigate(nextPath, { replace: shouldReplaceHistory === true });
      }
    } catch (error) {
      setState(stateAfterError(error, input));
    }
  }

  const { inputAwaitingReplace } = state;
  const replaceResultsDialog = createElement(
    AnimatePresence,
    null,
    inputAwaitingReplace === null
      ? null
      : createElement(ConfirmDialog, {
          key: "quizshow-replace-results",
          open: true,
          onClose: () => setState(CLEAN_STATE),
          onConfirm: () =>
            void submit({
              ...inputAwaitingReplace,
              shouldReplaceResults: true,
            }),
          title: t("quizshow:lobby.replaceResultsTitle"),
          description: t(
            scope.kind === "game"
              ? "quizshow:lobby.replaceResultsBodyGame"
              : "quizshow:lobby.replaceResultsBody",
          ),
          confirmLabel: t("quizshow:lobby.replaceResultsCta"),
          tone: "destructive",
          loading: mutation.isPending,
        }),
  );

  return {
    open: (input) => {
      if (mutation.isPending) return;
      void submit(input);
    },
    replaceResultsDialog,
    problems: state.problems,
    alreadyOpen: state.alreadyOpen,
    errorKey: state.errorKey,
    isPending: mutation.isPending,
  };
}
