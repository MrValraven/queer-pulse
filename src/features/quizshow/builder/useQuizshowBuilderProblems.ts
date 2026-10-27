import type {
  QuizshowQuizProblem,
  QuizshowQuizResponse,
  QuizshowTemplateCardText,
} from "../../../shared/contracts/quizshow";
import type { QuizshowScope } from "../quizshowScope";
import { useQuizshowTemplatePublish } from "../templates/useQuizshowTemplatePublish";
import { draftToInput, type QuizshowDraft } from "./quizshowDraft";
import {
  quizshowProblemsFor,
  quizshowProblemsFromServer,
  type QuizshowLocalProblem,
} from "./quizshowValidation";

/**
 * The server's refusal first, then the draft's own problems while it is
 * unsaved, else the saved quiz's problems plus the adults check on the draft.
 */
function shownProblemsOf(options: {
  rejectedProblems: readonly QuizshowLocalProblem[];
  localProblems: readonly QuizshowLocalProblem[];
  serverProblems: readonly QuizshowQuizProblem[];
  isUnsaved: boolean;
}): readonly QuizshowLocalProblem[] {
  const { rejectedProblems, localProblems, serverProblems, isUnsaved } =
    options;
  if (rejectedProblems.length > 0) return rejectedProblems;
  if (isUnsaved) return localProblems;
  return [
    ...quizshowProblemsFromServer(serverProblems),
    ...localProblems.filter(
      (problem) => problem.code === "adults_round_needs_adults_event",
    ),
  ];
}

/**
 * The builder's problem lists and, on a template, its publish state. Publish
 * reads the problems before its own refusals, so a refused publish never
 * blocks the next attempt by itself; the list then shows the save's and the
 * publish's refusals together.
 */
export function useQuizshowBuilderProblems(options: {
  scope: QuizshowScope;
  data: QuizshowQuizResponse;
  draft: QuizshowDraft;
  isAdultsEvent: boolean;
  isUnsaved: boolean;
  saveRejectedProblems: readonly QuizshowLocalProblem[];
  templateCard: QuizshowTemplateCardText;
}) {
  const {
    scope,
    data,
    draft,
    isAdultsEvent,
    isUnsaved,
    saveRejectedProblems,
    templateCard,
  } = options;
  const localProblems = quizshowProblemsFor(draftToInput(draft, null), {
    isAdultsEvent,
  });
  const problemsBeforeRefusals = shownProblemsOf({
    rejectedProblems: saveRejectedProblems,
    localProblems,
    serverProblems: data.problems,
    isUnsaved,
  });
  const publishing = useQuizshowTemplatePublish({
    templateId: scope.kind === "template" ? scope.templateId : null,
    card: templateCard,
    languages: draft.languages,
    savedUpdatedAt: data.quiz?.updatedAt ?? null,
    isUnsaved,
    hasQuizProblems: problemsBeforeRefusals.length > 0,
  });
  const problems = shownProblemsOf({
    rejectedProblems: [...saveRejectedProblems, ...publishing.rejectedProblems],
    localProblems,
    serverProblems: data.problems,
    isUnsaved,
  });
  // The try-out plays the draft on screen now, so its own problems block it;
  // the adults-event check is about the event and leaves the try-out open.
  const dryRunProblems = localProblems.filter(
    (problem) => problem.code !== "adults_round_needs_adults_event",
  );
  return { problems, dryRunProblems, publishing };
}
