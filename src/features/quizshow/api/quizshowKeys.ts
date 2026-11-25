import type { QuizshowScope, QuizshowSessionScope } from "../quizshowScope";

/** `demoMode` sits last in every key, matching the events domain's convention. */
export const quizshowKeys = {
  root: ["quizshow"] as const,
  quiz: (slug: string, demoMode: boolean) =>
    ["quizshow", "quiz", slug, demoMode] as const,
  importSources: (slug: string, demoMode: boolean) =>
    ["quizshow", "import-sources", slug, demoMode] as const,
  /** The published cards a host picks from. */
  templateCards: (demoMode: boolean) =>
    ["quizshow", "template-cards", demoMode] as const,
  /** The staff list of every template, drafts included. */
  templateRows: (demoMode: boolean) =>
    ["quizshow", "template-rows", demoMode] as const,
  /** One template as the builder reads it. */
  template: (templateId: string, demoMode: boolean) =>
    ["quizshow", "template", templateId, demoMode] as const,
  /** A published template's card and prompts, read before importing it (item 23). */
  templatePreview: (templateId: string, demoMode: boolean) =>
    ["quizshow", "template-preview", templateId, demoMode] as const,
  /** The signed-out join card's read (item 29). The key holds a typed join
   *  code, so its query sets `isPrivateQueryKey`. */
  joinPreview: (code: string, demoMode: boolean) =>
    ["quizshow", "join-preview", code, demoMode] as const,
  results: (slug: string, demoMode: boolean) =>
    ["quizshow", "results", slug, demoMode] as const,
  /** The next game's "Win to earn" badges for one event (route 11). */
  winBadgesPreview: (slug: string, demoMode: boolean) =>
    ["quizshow", "win-badges-preview", slug, demoMode] as const,
  games: (demoMode: boolean) => ["quizshow", "games", demoMode] as const,
  game: (gameId: string, demoMode: boolean) =>
    ["quizshow", "game", gameId, demoMode] as const,
  gameImportSources: (gameId: string, demoMode: boolean) =>
    ["quizshow", "game-import-sources", gameId, demoMode] as const,
  gameResults: (gameId: string, demoMode: boolean) =>
    ["quizshow", "game-results", gameId, demoMode] as const,
  /** An event scope reads the existing event keys, so event caches stay where they were. */
  quizFor: (scope: QuizshowScope, demoMode: boolean): readonly unknown[] => {
    switch (scope.kind) {
      case "event":
        return quizshowKeys.quiz(scope.eventSlug, demoMode);
      case "game":
        return quizshowKeys.game(scope.gameId, demoMode);
      case "template":
        return quizshowKeys.template(scope.templateId, demoMode);
      default: {
        const unknownScope: never = scope;
        throw new Error(`Unknown quizshow scope: ${String(unknownScope)}`);
      }
    }
  },
  importSourcesFor: (
    scope: QuizshowSessionScope,
    demoMode: boolean,
  ): readonly unknown[] =>
    scope.kind === "event"
      ? quizshowKeys.importSources(scope.eventSlug, demoMode)
      : quizshowKeys.gameImportSources(scope.gameId, demoMode),
  resultsFor: (
    scope: QuizshowSessionScope,
    demoMode: boolean,
  ): readonly unknown[] =>
    scope.kind === "event"
      ? quizshowKeys.results(scope.eventSlug, demoMode)
      : quizshowKeys.gameResults(scope.gameId, demoMode),
};
