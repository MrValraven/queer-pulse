import { routes } from "../../app/routeMap";
import { appOrigin } from "../../shared/lib/inviteUrl";
import { QUIZSHOW_JOIN_CODE_PATTERN } from "../../shared/contracts/quizshow";
import { gatheringPath } from "../gatherings/gatheringPaths";

export const QUIZSHOW_MANAGE_TAB = "quizshow" as const;
export const QUIZSHOW_SCREEN_ROUTE = `${routes.gatherings}/:slug/quizshow/screen`;
export const QUIZSHOW_REMOTE_ROUTE = `${routes.gatherings}/:slug/quizshow/remote`;
export const QUIZSHOW_PLAY_CODE_ROUTE = `${routes.play}/:code`;

export function quizshowScreenPath(slug: string): string {
  return `${gatheringPath(slug)}/quizshow/screen`;
}

export function quizshowRemotePath(slug: string): string {
  return `${gatheringPath(slug)}/quizshow/remote`;
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
