import { createElement, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
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
import { quizshowScreenPath } from "../quizshowPaths";
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

const CLEAN_STATE: OpenLobbyState = {
  inputAwaitingReplace: null,
  problems: [],
  alreadyOpen: null,
  errorKey: null,
};

function stateAfterError(
  error: unknown,
  input: QuizshowOpenSessionInput,
): OpenLobbyState {
  const code = quizshowErrorCodeOf(error);
  if (code === "quizshow_results_exist") {
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

export function useQuizshowOpenLobby(slug: string): {
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
  const mutation = useOpenQuizshowSession(slug);
  const [state, setState] = useState<OpenLobbyState>(CLEAN_STATE);

  async function submit(input: QuizshowOpenSessionInput): Promise<void> {
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
      void navigate(quizshowScreenPath(slug));
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
          description: t("quizshow:lobby.replaceResultsBody"),
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
