import { ApiError } from "../../../shared/api/client";
import type {
  QuizshowContentLabel,
  QuizshowErrorCode,
  QuizshowQuestion,
  QuizshowQuiz,
  QuizshowQuizInput,
  QuizshowQuizProblem,
  QuizshowRound,
  QuizshowStarterPack,
  QuizshowStarterPackKey,
} from "../../../shared/contracts/quizshow";
import {
  isStructuralProblem,
  quizshowProblemsFor,
  type QuizshowLocalProblem,
} from "../builder/quizshowValidation";
import { QUIZSHOW_STARTER_PACKS } from "../demo/quizshowStarterPacks.data";
import { QUIZSHOW_DEMO_IMPORT_SOURCES } from "./quizshowDemoStore.data";

/**
 * What both demo stores share: refusals, quiz building, the shape checks and
 * the demo events' saved quizzes. The event store and the games store both
 * import this module, so the games store reads event quizzes from here and
 * keeps the import graph one way.
 */

export type DemoQuizBody = Omit<QuizshowQuizInput, "expectedUpdatedAt">;

/** A quiz picked as an import source, ready to be stored under a new owner. */
export interface DemoQuizCopy {
  body: DemoQuizBody;
  starterPackKey: QuizshowStarterPackKey | null;
}

const DEFAULT_QUIZ_PACK_KEY: QuizshowStarterPackKey = "pride_history";

/** Refusal statuses that differ from the 422 the event adults code uses. */
const ADULTS_REFUSAL_STATUS: Partial<Record<QuizshowErrorCode, number>> = {
  quizshow_game_adults_rounds_need_switch: 403,
};
const DEFAULT_ADULTS_REFUSAL_STATUS = 422;

// Module scope on purpose: the demo keeps what a tab saved until it reloads.
export const demoEventQuizzesBySlug = new Map<string, QuizshowQuiz>();

export function demoRefusal(
  status: number,
  code: string,
  details: Record<string, unknown> = {},
): ApiError {
  return new ApiError(status, code, {
    statusCode: status,
    code,
    message: code,
    ...details,
  });
}

export function quizFromInput(
  input: DemoQuizBody,
  options: {
    idPrefix: string;
    updatedAt: string;
    starterPackKey: QuizshowStarterPackKey | null;
  },
): QuizshowQuiz {
  const rounds: QuizshowRound[] = input.rounds.map((round, roundIndex) => {
    const roundId = `${options.idPrefix}-r${roundIndex}`;
    const questions: QuizshowQuestion[] = round.questions.map(
      (question, questionIndex) => ({
        ...question,
        id: `${roundId}-q${questionIndex}`,
        mediaUrl: question.mediaRef,
      }),
    );
    return { ...round, id: roundId, questions };
  });
  return {
    title: input.title,
    languages: input.languages,
    screenLanguage: input.screenLanguage,
    starterPackKey: options.starterPackKey,
    updatedAt: options.updatedAt,
    rounds,
  };
}

export function demoDefaultPack(): QuizshowStarterPack {
  const pack =
    QUIZSHOW_STARTER_PACKS.find(
      (candidate) => candidate.key === DEFAULT_QUIZ_PACK_KEY,
    ) ?? QUIZSHOW_STARTER_PACKS[0];
  if (!pack) throw demoRefusal(404, "quizshow_pack_not_found");
  return pack;
}

function isServerProblem(
  problem: QuizshowLocalProblem,
): problem is QuizshowQuizProblem {
  return problem.code !== "adults_round_needs_adults_event";
}

export function demoBodyOf(quiz: QuizshowQuiz): DemoQuizBody {
  return {
    title: quiz.title,
    languages: quiz.languages,
    screenLanguage: quiz.screenLanguage,
    rounds: quiz.rounds,
  };
}

export function demoCompletenessProblems(
  quiz: QuizshowQuiz,
): QuizshowQuizProblem[] {
  return quizshowProblemsFor(demoBodyOf(quiz), { isAdultsEvent: false })
    .filter((problem) => !isStructuralProblem(problem.code))
    .filter(isServerProblem);
}

/** Refuses a body the server would refuse: shape problems first, then an adults round where none is allowed. */
export function demoAssertShape(
  body: DemoQuizBody,
  options: { isAdultsAllowed: boolean; adultsCode: QuizshowErrorCode },
): void {
  const structuralProblems = quizshowProblemsFor(body, {
    isAdultsEvent: options.isAdultsAllowed,
  }).filter((problem) => isStructuralProblem(problem.code));
  const shapeProblems = structuralProblems.filter(isServerProblem);
  if (shapeProblems.length > 0) {
    throw demoRefusal(422, "quizshow_quiz_invalid", {
      problems: shapeProblems,
    });
  }
  if (structuralProblems.length > 0) {
    throw demoRefusal(
      ADULTS_REFUSAL_STATUS[options.adultsCode] ??
        DEFAULT_ADULTS_REFUSAL_STATUS,
      options.adultsCode,
    );
  }
}

export function hasAdultsRound(quiz: {
  rounds: readonly { contentLabel: QuizshowContentLabel }[];
}): boolean {
  return quiz.rounds.some((round) => round.contentLabel === "adults");
}

export function demoPackCopy(packKey: QuizshowStarterPackKey): DemoQuizCopy {
  const pack = QUIZSHOW_STARTER_PACKS.find(
    (candidate) => candidate.key === packKey,
  );
  if (!pack) throw demoRefusal(404, "quizshow_pack_not_found");
  return { body: pack.quiz, starterPackKey: pack.key };
}

/** The quiz a demo event offers as a source: the one saved in this tab, else the default pack under the source's title. */
export function demoEventSourceCopy(eventSlug: string): DemoQuizCopy {
  const source = QUIZSHOW_DEMO_IMPORT_SOURCES.find(
    (candidate) =>
      candidate.kind === "event" && candidate.eventSlug === eventSlug,
  );
  if (!source) throw demoRefusal(404, "quizshow_import_source_not_found");
  const copiedQuiz = demoEventQuizzesBySlug.get(eventSlug);
  if (copiedQuiz) {
    return {
      body: demoBodyOf(copiedQuiz),
      starterPackKey: copiedQuiz.starterPackKey,
    };
  }
  return {
    body: { ...demoDefaultPack().quiz, title: source.quizTitle },
    starterPackKey: null,
  };
}
