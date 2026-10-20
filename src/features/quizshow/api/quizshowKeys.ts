import type { QuizshowScope } from "../quizshowScope";

/** `demoMode` sits last in every key, matching the events domain's convention. */
export const quizshowKeys = {
  root: ["quizshow"] as const,
  quiz: (slug: string, demoMode: boolean) =>
    ["quizshow", "quiz", slug, demoMode] as const,
  importSources: (slug: string, demoMode: boolean) =>
    ["quizshow", "import-sources", slug, demoMode] as const,
  packs: (demoMode: boolean) => ["quizshow", "packs", demoMode] as const,
  results: (slug: string, demoMode: boolean) =>
    ["quizshow", "results", slug, demoMode] as const,
  games: (demoMode: boolean) => ["quizshow", "games", demoMode] as const,
  game: (gameId: string, demoMode: boolean) =>
    ["quizshow", "game", gameId, demoMode] as const,
  gameImportSources: (gameId: string, demoMode: boolean) =>
    ["quizshow", "game-import-sources", gameId, demoMode] as const,
  gameResults: (gameId: string, demoMode: boolean) =>
    ["quizshow", "game-results", gameId, demoMode] as const,
  /** An event scope reads the existing event keys, so event caches stay where they were. */
  quizFor: (scope: QuizshowScope, demoMode: boolean): readonly unknown[] =>
    scope.kind === "event"
      ? quizshowKeys.quiz(scope.eventSlug, demoMode)
      : quizshowKeys.game(scope.gameId, demoMode),
  importSourcesFor: (
    scope: QuizshowScope,
    demoMode: boolean,
  ): readonly unknown[] =>
    scope.kind === "event"
      ? quizshowKeys.importSources(scope.eventSlug, demoMode)
      : quizshowKeys.gameImportSources(scope.gameId, demoMode),
  resultsFor: (scope: QuizshowScope, demoMode: boolean): readonly unknown[] =>
    scope.kind === "event"
      ? quizshowKeys.results(scope.eventSlug, demoMode)
      : quizshowKeys.gameResults(scope.gameId, demoMode),
};
