import { createContext, useContext } from "react";
import { appOrigin } from "../../shared/lib/inviteUrl";
import {
  quizshowGameRemotePath,
  quizshowGameScreenPath,
  quizshowRemotePath,
  quizshowScreenPath,
} from "./quizshowPaths";

export type QuizshowEventScope = { kind: "event"; eventSlug: string };
export type QuizshowGameScope = { kind: "game"; gameId: string };
export type QuizshowTemplateScope = { kind: "template"; templateId: string };
/** A scope that can open a lobby, keep results and drive a screen and a remote. */
export type QuizshowSessionScope = QuizshowEventScope | QuizshowGameScope;
export type QuizshowScope = QuizshowSessionScope | QuizshowTemplateScope;
export type QuizshowBuilderScopeKind = QuizshowScope["kind"];

export function eventScope(eventSlug: string): QuizshowEventScope {
  return { kind: "event", eventSlug };
}

export function gameScope(gameId: string): QuizshowGameScope {
  return { kind: "game", gameId };
}

export function templateScope(templateId: string): QuizshowTemplateScope {
  return { kind: "template", templateId };
}

export function isQuizshowSessionScope(
  scope: QuizshowScope,
): scope is QuizshowSessionScope {
  return scope.kind === "event" || scope.kind === "game";
}

/** "event:<slug>", "game:<id>" or "template:<id>": the three kinds never collide. */
export function quizshowScopeKey(scope: QuizshowScope): string {
  switch (scope.kind) {
    case "event":
      return `event:${scope.eventSlug}`;
    case "game":
      return `game:${scope.gameId}`;
    case "template":
      return `template:${scope.templateId}`;
    default: {
      const unknownScope: never = scope;
      return unknownScope;
    }
  }
}

export function quizshowScopeScreenPath(scope: QuizshowSessionScope): string {
  return scope.kind === "event"
    ? quizshowScreenPath(scope.eventSlug)
    : quizshowGameScreenPath(scope.gameId);
}

export function quizshowScopeRemotePath(scope: QuizshowSessionScope): string {
  return scope.kind === "event"
    ? quizshowRemotePath(scope.eventSlug)
    : quizshowGameRemotePath(scope.gameId);
}

export function quizshowScopeRemoteUrl(scope: QuizshowSessionScope): string {
  return `${appOrigin()}${quizshowScopeRemotePath(scope)}`;
}

/** Mounted by the game and template pages; read by copy that differs per kind. */
export const QuizshowScopeContext = createContext<QuizshowScope | null>(null);

/** "event" when no provider is mounted, so every existing event caller keeps today's copy. */
export function useQuizshowScopeKind(): QuizshowBuilderScopeKind {
  return useContext(QuizshowScopeContext)?.kind ?? "event";
}
