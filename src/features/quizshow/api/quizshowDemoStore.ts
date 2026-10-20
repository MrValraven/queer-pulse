import { ApiError } from "../../../shared/api/client";
import {
  QUIZSHOW_JOIN_CODE_PATTERN,
  type QuizshowImportInput,
  type QuizshowImportSource,
  type QuizshowJoinInput,
  type QuizshowJoinResponse,
  type QuizshowLiveSessionRef,
  type QuizshowOpenSessionInput,
  type QuizshowOpenSessionResponse,
  type QuizshowQuestion,
  type QuizshowQuiz,
  type QuizshowQuizInput,
  type QuizshowQuizProblem,
  type QuizshowQuizResponse,
  type QuizshowResultsResponse,
  type QuizshowRound,
  type QuizshowStarterPack,
  type QuizshowStarterPackCard,
  type QuizshowStarterPackKey,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_DEMO_JOIN_CODE,
  QUIZSHOW_DEMO_SESSION_ID,
} from "../quizshow.constants";
import {
  isStructuralProblem,
  quizshowProblemsFor,
  type QuizshowLocalProblem,
} from "../builder/quizshowValidation";
import { QUIZSHOW_STARTER_PACKS } from "../demo/quizshowStarterPacks.data";
import {
  QUIZSHOW_DEMO_IMPORT_SOURCES,
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS,
  QUIZSHOW_DEMO_RESULTS_SLUG,
} from "./quizshowDemoStore.data";

type QuizBody = Omit<QuizshowQuizInput, "expectedUpdatedAt">;

const DEMO_EVENT_TITLE = "Pride brunch";
const DEFAULT_QUIZ_PACK_KEY: QuizshowStarterPackKey = "pride_history";
const DEFAULT_QUIZ_UPDATED_AT = "2026-10-01T10:00:00.000Z";

// Module scope on purpose: the demo keeps what a tab saved until it reloads.
const quizzesBySlug = new Map<string, QuizshowQuiz>();
const liveSessionsBySlug = new Map<string, QuizshowLiveSessionRef>();
const deletedResultsSlugs = new Set<string>();
let saveCounter = 0;

export function resetQuizshowDemoStore(): void {
  quizzesBySlug.clear();
  liveSessionsBySlug.clear();
  deletedResultsSlugs.clear();
  saveCounter = 0;
}

function refusal(
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
  input: QuizBody,
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

function defaultPack(): QuizshowStarterPack {
  const pack =
    QUIZSHOW_STARTER_PACKS.find(
      (candidate) => candidate.key === DEFAULT_QUIZ_PACK_KEY,
    ) ?? QUIZSHOW_STARTER_PACKS[0];
  if (!pack) throw refusal(404, "quizshow_pack_not_found");
  return pack;
}

function isServerProblem(
  problem: QuizshowLocalProblem,
): problem is QuizshowQuizProblem {
  return problem.code !== "adults_round_needs_adults_event";
}

function bodyOf(quiz: QuizshowQuiz): QuizBody {
  return {
    title: quiz.title,
    languages: quiz.languages,
    screenLanguage: quiz.screenLanguage,
    rounds: quiz.rounds,
  };
}

function completenessProblemsOf(quiz: QuizshowQuiz): QuizshowQuizProblem[] {
  return quizshowProblemsFor(bodyOf(quiz), { isAdultsEvent: false })
    .filter((problem) => !isStructuralProblem(problem.code))
    .filter(isServerProblem);
}

function hasKeptResults(slug: string): boolean {
  return slug === QUIZSHOW_DEMO_RESULTS_SLUG && !deletedResultsSlugs.has(slug);
}

function responseFor(slug: string): QuizshowQuizResponse {
  const quiz = quizzesBySlug.get(slug) ?? null;
  return {
    quiz,
    problems: quiz ? completenessProblemsOf(quiz) : [],
    isAdultsEvent: false,
    liveSession: liveSessionsBySlug.get(slug) ?? null,
    hasResults: hasKeptResults(slug),
  };
}

function nextIdPrefix(slug: string): string {
  saveCounter += 1;
  return `demo-${slug}-${saveCounter}`;
}

function storeQuiz(
  slug: string,
  body: QuizBody,
  starterPackKey: QuizshowStarterPackKey | null,
): void {
  quizzesBySlug.set(
    slug,
    quizFromInput(body, {
      idPrefix: nextIdPrefix(slug),
      updatedAt: new Date().toISOString(),
      starterPackKey,
    }),
  );
}

function assertNoStructuralProblems(body: QuizBody): void {
  const structuralProblems = quizshowProblemsFor(body, {
    isAdultsEvent: false,
  }).filter((problem) => isStructuralProblem(problem.code));
  const shapeProblems = structuralProblems.filter(isServerProblem);
  if (shapeProblems.length > 0) {
    throw refusal(422, "quizshow_quiz_invalid", { problems: shapeProblems });
  }
  if (structuralProblems.length > 0) {
    throw refusal(422, "quizshow_adults_round_needs_adults_event");
  }
}

export function demoGetQuiz(slug: string): QuizshowQuizResponse {
  return responseFor(slug);
}

export function demoPutQuiz(
  slug: string,
  body: QuizshowQuizInput,
): QuizshowQuizResponse {
  const stored = quizzesBySlug.get(slug);
  if (body.expectedUpdatedAt !== (stored?.updatedAt ?? null)) {
    throw refusal(409, "quizshow_quiz_changed", {
      updatedAt: stored?.updatedAt ?? null,
    });
  }
  const { expectedUpdatedAt: unusedExpectedUpdatedAt, ...quizBody } = body;
  void unusedExpectedUpdatedAt;
  assertNoStructuralProblems(quizBody);
  storeQuiz(slug, quizBody, stored?.starterPackKey ?? null);
  return responseFor(slug);
}

export function demoImportQuiz(
  slug: string,
  body: QuizshowImportInput,
): QuizshowQuizResponse {
  if (body.from === "pack") {
    const pack = QUIZSHOW_STARTER_PACKS.find(
      (candidate) => candidate.key === body.packKey,
    );
    if (!pack) throw refusal(404, "quizshow_pack_not_found");
    storeQuiz(slug, pack.quiz, pack.key);
    return responseFor(slug);
  }
  if (body.eventSlug === slug) throw refusal(422, "quizshow_import_same_event");
  const source = QUIZSHOW_DEMO_IMPORT_SOURCES.find(
    (candidate) => candidate.eventSlug === body.eventSlug,
  );
  if (!source) throw refusal(404, "quizshow_import_source_not_found");
  const copiedQuiz = quizzesBySlug.get(source.eventSlug);
  const fallbackPack = defaultPack();
  storeQuiz(
    slug,
    copiedQuiz
      ? bodyOf(copiedQuiz)
      : { ...fallbackPack.quiz, title: source.quizTitle },
    copiedQuiz ? copiedQuiz.starterPackKey : null,
  );
  return responseFor(slug);
}

export function demoImportSources(slug: string): {
  items: QuizshowImportSource[];
} {
  return {
    items: QUIZSHOW_DEMO_IMPORT_SOURCES.filter(
      (source) => source.eventSlug !== slug,
    ),
  };
}

export function demoPacks(): { items: QuizshowStarterPackCard[] } {
  return {
    items: QUIZSHOW_STARTER_PACKS.map((pack) => ({
      key: pack.key,
      title: pack.title,
      description: pack.description,
      languages: pack.quiz.languages,
      roundCount: pack.quiz.rounds.length,
      questionCount: pack.quiz.rounds.reduce(
        (total, round) => total + round.questions.length,
        0,
      ),
      hasAdultsRounds: pack.quiz.rounds.some(
        (round) => round.contentLabel === "adults",
      ),
    })),
  };
}

export function demoOpenSession(
  slug: string,
  body: QuizshowOpenSessionInput,
): QuizshowOpenSessionResponse {
  const quiz = quizzesBySlug.get(slug);
  if (!quiz) throw refusal(404, "quizshow_quiz_not_found");
  const problems = completenessProblemsOf(quiz);
  if (problems.length > 0) {
    throw refusal(422, "quizshow_quiz_incomplete", { problems });
  }
  if (liveSessionsBySlug.has(slug)) {
    throw refusal(409, "quizshow_session_already_open", {
      sessionId: QUIZSHOW_DEMO_SESSION_ID,
      joinCode: QUIZSHOW_DEMO_JOIN_CODE,
    });
  }
  if (hasKeptResults(slug)) {
    if (!body.shouldReplaceResults)
      throw refusal(409, "quizshow_results_exist");
    deletedResultsSlugs.add(slug);
  }
  liveSessionsBySlug.set(slug, {
    sessionId: QUIZSHOW_DEMO_SESSION_ID,
    joinCode: QUIZSHOW_DEMO_JOIN_CODE,
    status: "lobby",
    playMode: body.playMode,
    playerCount: 0,
    startedAt: new Date().toISOString(),
  });
  return {
    sessionId: QUIZSHOW_DEMO_SESSION_ID,
    joinCode: QUIZSHOW_DEMO_JOIN_CODE,
    isGuestPushSent: body.notifyGuests,
  };
}

export function demoJoin(body: QuizshowJoinInput): QuizshowJoinResponse {
  const normalizedCode = body.code.toUpperCase().replace(/[\s-]/g, "");
  if (!QUIZSHOW_JOIN_CODE_PATTERN.test(normalizedCode)) {
    throw refusal(404, "quizshow_join_code_not_found");
  }
  return {
    sessionId: QUIZSHOW_DEMO_SESSION_ID,
    eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
    eventTitle: DEMO_EVENT_TITLE,
    status: "lobby",
    isRejoin: false,
  };
}

export function demoResults(slug: string): QuizshowResultsResponse {
  if (!hasKeptResults(slug)) throw refusal(404, "quizshow_results_not_found");
  return structuredClone(QUIZSHOW_DEMO_RESULTS);
}

export function demoDeleteResults(slug: string): void {
  if (!hasKeptResults(slug)) throw refusal(404, "quizshow_results_not_found");
  deletedResultsSlugs.add(slug);
}

/** The quiz a demo engine plays for this event: the one saved in this tab, else the Pride history pack. */
export function demoQuizFor(slug: string): QuizshowQuiz {
  const stored = quizzesBySlug.get(slug);
  if (stored) return structuredClone(stored);
  const pack = defaultPack();
  return quizFromInput(pack.quiz, {
    idPrefix: `demo-${pack.key}`,
    updatedAt: DEFAULT_QUIZ_UPDATED_AT,
    starterPackKey: pack.key,
  });
}
