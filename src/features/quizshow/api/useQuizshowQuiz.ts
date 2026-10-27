import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import type {
  QuizshowImportSource,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import type { QuizshowScope, QuizshowSessionScope } from "../quizshowScope";
import { quizResponseOfTemplate } from "../templates/quizshowTemplateResponse";
import {
  getQuizshowGame,
  getQuizshowGameImportSources,
  getQuizshowImportSources,
  getQuizshowQuiz,
} from "./quizshow.api";
import { getQuizshowTemplate } from "./quizshowTemplates.api";
import { quizshowKeys } from "./quizshowKeys";
import { demoGetQuiz, demoImportSources } from "./quizshowDemoStore";
import { demoGameImportSources, demoGetGame } from "./quizshowDemoGames";
import { demoGetTemplate } from "./quizshowDemoTemplates";

const LIVE_PANEL_REFETCH_MS = 15_000;
const MAX_RETRIES = 2;

/** A refusal about access or absence will not change on a retry. */
export function shouldRetryQuizshowRead(
  failureCount: number,
  error: unknown,
): boolean {
  if (
    error instanceof ApiError &&
    (error.status === 403 || error.status === 404)
  ) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

/** A scope whose slug or id has not resolved yet holds its reads back. */
export function hasQuizshowScopeId(scope: QuizshowScope): boolean {
  switch (scope.kind) {
    case "event":
      return scope.eventSlug !== "";
    case "game":
      return scope.gameId !== "";
    case "template":
      return scope.templateId !== "";
    default: {
      const unknownScope: never = scope;
      throw new Error(`Unknown quizshow scope: ${String(unknownScope)}`);
    }
  }
}

/** A template reads through the staff detail, adapted into the builder's response. */
async function fetchTemplateQuiz(
  templateId: string,
  demoMode: boolean,
): Promise<QuizshowQuizResponse> {
  const detail = demoMode
    ? demoGetTemplate(templateId)
    : await getQuizshowTemplate(templateId);
  return quizResponseOfTemplate(detail);
}

async function fetchQuizFor(
  scope: QuizshowScope,
  demoMode: boolean,
): Promise<QuizshowQuizResponse> {
  if (scope.kind === "event") {
    return demoMode
      ? demoGetQuiz(scope.eventSlug)
      : getQuizshowQuiz(scope.eventSlug);
  }
  if (scope.kind === "template") {
    return fetchTemplateQuiz(scope.templateId, demoMode);
  }
  return demoMode ? demoGetGame(scope.gameId) : getQuizshowGame(scope.gameId);
}

async function fetchImportSourcesFor(
  scope: QuizshowSessionScope,
  demoMode: boolean,
): Promise<{ items: QuizshowImportSource[] }> {
  if (scope.kind === "event") {
    return demoMode
      ? demoImportSources(scope.eventSlug)
      : getQuizshowImportSources(scope.eventSlug);
  }
  return demoMode
    ? demoGameImportSources(scope.gameId)
    : getQuizshowGameImportSources(scope.gameId);
}

export function useQuizshowQuiz(
  scope: QuizshowScope,
  options: {
    isEnabled: boolean;
    /** Live only: poll this often while no session is open, so a screen notices a new lobby. Off when left out. */
    noSessionRefetchMs?: number;
  },
): UseQueryResult<QuizshowQuizResponse> {
  const { demoMode } = useDemoMode();
  const { noSessionRefetchMs } = options;
  return useQuery<QuizshowQuizResponse>({
    queryKey: quizshowKeys.quizFor(scope, demoMode),
    enabled: options.isEnabled && hasQuizshowScopeId(scope),
    retry: shouldRetryQuizshowRead,
    // Live only: the live panel's player count moves while a session is open.
    refetchInterval: (query) => {
      if (demoMode) return false;
      if (query.state.data?.liveSession) return LIVE_PANEL_REFETCH_MS;
      return noSessionRefetchMs ?? false;
    },
    queryFn: async () => fetchQuizFor(scope, demoMode),
  });
}

/** An event row of the import list, with the fields an event row reads. */
export type QuizshowEventImportSource = QuizshowImportSource & {
  kind: "event";
  eventSlug: string;
  startAt: string;
};

/** Event rows only for now: game rows join the list with the game picker. */
export function isEventImportSource(
  source: QuizshowImportSource,
): source is QuizshowEventImportSource {
  return (
    source.kind === "event" &&
    source.eventSlug !== null &&
    source.startAt !== null
  );
}

export function useQuizshowImportSources(
  scope: QuizshowSessionScope,
  options: { isEnabled: boolean },
): UseQueryResult<{ items: QuizshowImportSource[] }> {
  const { demoMode } = useDemoMode();
  return useQuery<{ items: QuizshowImportSource[] }>({
    queryKey: quizshowKeys.importSourcesFor(scope, demoMode),
    enabled: options.isEnabled && hasQuizshowScopeId(scope),
    retry: shouldRetryQuizshowRead,
    queryFn: async () => fetchImportSourcesFor(scope, demoMode),
  });
}
