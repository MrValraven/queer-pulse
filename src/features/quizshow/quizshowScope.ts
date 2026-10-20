import { createContext, useContext } from "react";
import type { QuizshowScopeKind } from "../../shared/contracts/quizshow";
import { appOrigin } from "../../shared/lib/inviteUrl";
import {
  quizshowGameRemotePath,
  quizshowGameScreenPath,
  quizshowRemotePath,
  quizshowScreenPath,
} from "./quizshowPaths";

export type QuizshowScope =
  { kind: "event"; eventSlug: string } | { kind: "game"; gameId: string };

export function eventScope(eventSlug: string): QuizshowScope {
  return { kind: "event", eventSlug };
}

export function gameScope(gameId: string): QuizshowScope {
  return { kind: "game", gameId };
}

/** "event:<slug>" or "game:<id>": the two kinds never collide. */
export function quizshowScopeKey(scope: QuizshowScope): string {
  return scope.kind === "event"
    ? `event:${scope.eventSlug}`
    : `game:${scope.gameId}`;
}

export function quizshowScopeScreenPath(scope: QuizshowScope): string {
  return scope.kind === "event"
    ? quizshowScreenPath(scope.eventSlug)
    : quizshowGameScreenPath(scope.gameId);
}

export function quizshowScopeRemotePath(scope: QuizshowScope): string {
  return scope.kind === "event"
    ? quizshowRemotePath(scope.eventSlug)
    : quizshowGameRemotePath(scope.gameId);
}

export function quizshowScopeRemoteUrl(scope: QuizshowScope): string {
  return `${appOrigin()}${quizshowScopeRemotePath(scope)}`;
}

/** Mounted by the game page (Task 9); read by copy that differs per kind. */
export const QuizshowScopeContext = createContext<QuizshowScope | null>(null);

/** "event" when no provider is mounted, so every existing event caller keeps today's copy. */
export function useQuizshowScopeKind(): QuizshowScopeKind {
  return useContext(QuizshowScopeContext)?.kind ?? "event";
}
