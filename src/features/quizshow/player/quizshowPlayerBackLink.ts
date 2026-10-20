import { routes } from "../../../app/routeMap";
import type { QuizshowScopeKind } from "../../../shared/contracts/quizshow";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import { quizshowPlayPath } from "../quizshowPaths";

/**
 * Where a player goes once the game is over or they were removed. A game
 * without an event leads to the Pulse Live home; an event game leads to its
 * event, or to the events list while the event is unknown.
 */
export function playerBackLinkOf(
  kind: QuizshowScopeKind,
  eventSlug: string | null,
): { to: string; labelKey: string } {
  if (kind === "game") {
    return { to: quizshowPlayPath(), labelKey: "quizshow:player.backToPlay" };
  }
  return {
    to: eventSlug === null ? routes.gatherings : gatheringPath(eventSlug),
    labelKey: "quizshow:player.backToEvent",
  };
}
