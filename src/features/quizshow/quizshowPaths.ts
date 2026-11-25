import { routes } from "../../app/routeMap";
import { appOrigin } from "../../shared/lib/inviteUrl";
import {
  QUIZSHOW_JOIN_CODE_PATTERN,
  type QuizshowText,
} from "../../shared/contracts/quizshow";
import { gatheringPath } from "../gatherings/gatheringPaths";
import { memberPath } from "../forum/forumAuthor.helpers";
import type { QuizshowSessionScope } from "./quizshowScope";

export const QUIZSHOW_MANAGE_TAB = "quizshow" as const;
export const QUIZSHOW_SCREEN_ROUTE = `${routes.gatherings}/:slug/quizshow/screen`;
export const QUIZSHOW_REMOTE_ROUTE = `${routes.gatherings}/:slug/quizshow/remote`;
/** The event's quiz in the full-screen studio editor. */
export const QUIZSHOW_EDIT_ROUTE = `${routes.gatherings}/:slug/quizshow/edit`;
export const QUIZSHOW_PLAY_CODE_ROUTE = `${routes.play}/:code`;
export const QUIZSHOW_GAMES_ROUTE = `${routes.play}/games`;
export const QUIZSHOW_GAME_ROUTE = `${routes.play}/games/:gameId`;
export const QUIZSHOW_GAME_SCREEN_ROUTE = `${routes.play}/games/:gameId/screen`;
export const QUIZSHOW_GAME_REMOTE_ROUTE = `${routes.play}/games/:gameId/remote`;
/** The venue TV's pairing page (contract 6.5): public, then the screen stage once paired. */
export const QUIZSHOW_TV_ROUTE = `${routes.play}/tv`;
/** A helper's phone shows a pairing code here (signed in). */
export const QUIZSHOW_HELPER_PAIR_ROUTE = `${routes.play}/remote`;
/** A paired helper's remote, from socket state only. */
export const QUIZSHOW_HELPER_REMOTE_ROUTE = `${routes.play}/remote/:sessionId`;
export const QUIZSHOW_PRINT_ROUTE = `${routes.gatherings}/:slug/quizshow/print`;
export const QUIZSHOW_GAME_PRINT_ROUTE = `${routes.play}/games/:gameId/print`;
export const QUIZSHOW_GAME_START_PARAM = "start";
export const QUIZSHOW_GAME_START_COPY = "copy";

export function quizshowScreenPath(slug: string): string {
  return `${gatheringPath(slug)}/quizshow/screen`;
}

export function quizshowRemotePath(slug: string): string {
  return `${gatheringPath(slug)}/quizshow/remote`;
}

export function quizshowEditPath(slug: string): string {
  return `${gatheringPath(slug)}/quizshow/edit`;
}

export function quizshowGamePath(
  gameId: string,
  options?: { shouldOpenSources?: boolean },
): string {
  const basePath = `${routes.play}/games/${encodeURIComponent(gameId)}`;
  return options?.shouldOpenSources
    ? `${basePath}?${QUIZSHOW_GAME_START_PARAM}=${QUIZSHOW_GAME_START_COPY}`
    : basePath;
}

export function quizshowGameScreenPath(gameId: string): string {
  return `${quizshowGamePath(gameId)}/screen`;
}

export function quizshowGameRemotePath(gameId: string): string {
  return `${quizshowGamePath(gameId)}/remote`;
}

/** Which printable sheet the print page shows. */
export type QuizshowPrintSheet = "host" | "answers";
export const QUIZSHOW_PRINT_SHEET_PARAM = "sheet";

/**
 * The studio opens on one question with the two 0-based search params (item
 * 59). The optional prompt pair lets the studio check it is still the same
 * question; the studio reads both from here.
 */
export const STUDIO_FOCUS_PARAMS = {
  round: "round",
  question: "question",
  promptEn: "promptEn",
  promptPt: "promptPt",
} as const;

export function quizshowTvPath(): string {
  return QUIZSHOW_TV_ROUTE;
}

/** The navigation state a paired TV's back control sends to `/play/tv`: leave this pairing and show a new code. */
export const QUIZSHOW_TV_LEAVE_STATE = { leaveTvPairing: true } as const;

/** Whether a navigation to `/play/tv` carries `QUIZSHOW_TV_LEAVE_STATE`. */
export function isQuizshowTvLeaveState(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    (state as Record<string, unknown>).leaveTvPairing === true
  );
}

export function quizshowHelperPairPath(): string {
  return QUIZSHOW_HELPER_PAIR_ROUTE;
}

export function quizshowHelperRemotePath(sessionId: string): string {
  return `${QUIZSHOW_HELPER_PAIR_ROUTE}/${encodeURIComponent(sessionId)}`;
}

export function quizshowPrintPath(
  scope: QuizshowSessionScope,
  sheet: QuizshowPrintSheet,
): string {
  const basePath =
    scope.kind === "event"
      ? `${gatheringPath(scope.eventSlug)}/quizshow/print`
      : `${quizshowGamePath(scope.gameId)}/print`;
  const searchParams = new URLSearchParams({
    [QUIZSHOW_PRINT_SHEET_PARAM]: sheet,
  });
  return `${basePath}?${searchParams.toString()}`;
}

/**
 * The studio of `scope` opened on one question: the event's editor or the
 * game page. With `prompt` (both languages), the studio selects the question
 * only while it still holds that prompt at those indices.
 */
export function quizshowStudioFocusPath(
  scope: QuizshowSessionScope,
  roundIndex: number,
  questionIndex: number,
  prompt?: QuizshowText,
): string {
  const basePath =
    scope.kind === "event"
      ? quizshowEditPath(scope.eventSlug)
      : quizshowGamePath(scope.gameId);
  const searchParams = new URLSearchParams({
    [STUDIO_FOCUS_PARAMS.round]: String(roundIndex),
    [STUDIO_FOCUS_PARAMS.question]: String(questionIndex),
  });
  if (prompt !== undefined) {
    searchParams.set(STUDIO_FOCUS_PARAMS.promptEn, prompt.en);
    searchParams.set(STUDIO_FOCUS_PARAMS.promptPt, prompt.pt);
  }
  return `${basePath}?${searchParams.toString()}`;
}

export function quizshowHostProfilePath(memberSlug: string): string {
  return memberPath(memberSlug);
}

export function quizshowPlayPath(code?: string): string {
  return code ? `${routes.play}/${code}` : routes.play;
}

export function quizshowPlayUrl(code: string): string {
  return `${appOrigin()}${quizshowPlayPath(code)}`;
}

export function quizshowRemoteUrl(slug: string): string {
  return `${appOrigin()}${quizshowRemotePath(slug)}`;
}

/** Uppercase, spaces and hyphens removed: what the server matches. */
export function normaliseJoinCode(input: string): string {
  return input.replace(/[\s-]+/g, "").toUpperCase();
}

export function isJoinCodeShaped(input: string): boolean {
  return QUIZSHOW_JOIN_CODE_PATTERN.test(normaliseJoinCode(input));
}
