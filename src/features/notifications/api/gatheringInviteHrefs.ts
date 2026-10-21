import { collabInvitePath, routes } from "../../../app/routeMap";
import { coHostInvitePath, gatheringPath } from "../../gatherings/data";
import {
  lineupInvitePath,
  manageGatheringPath,
} from "../../gatherings/gatheringPaths";

/** The `payload.source` values of a gathering's invites and their replies. */
const GATHERING_INVITE_SOURCES = new Set([
  "cohost_invite",
  "lineup_invite",
  "lineup_reply",
  "community_collab_invite",
  "community_collab_response",
  "event_invite",
  "member_invite_request",
  "member_invite_reply",
]);

export function isGatheringInviteSource(source: unknown): boolean {
  return typeof source === "string" && GATHERING_INVITE_SOURCES.has(source);
}

function stringField(
  payload: Record<string, unknown>,
  field: string,
): string | undefined {
  const value = payload[field];
  return typeof value === "string" && value ? value : undefined;
}

/**
 * Where a gathering invite row opens. A co-host invite opens its page by
 * gathering and invite id; a lineup invite its page by lineup row id, and a
 * lineup reply the organiser's Manage page on the Attendees tab, where the
 * lineup editor lives. A collab invite opens `/collab-invites/:inviteId`,
 * and a collab answer opens the gathering. A payload missing the id it
 * needs builds no link.
 */
export function gatheringInviteSourceHref(
  payload: Record<string, unknown>,
): string | undefined {
  const eventSlug = stringField(payload, "eventSlug");
  const inviteId = stringField(payload, "inviteId");
  switch (payload.source) {
    case "cohost_invite":
      return eventSlug && inviteId
        ? coHostInvitePath(eventSlug, inviteId)
        : undefined;
    case "lineup_reply":
      return eventSlug
        ? manageGatheringPath(eventSlug, "attendees")
        : undefined;
    case "lineup_invite":
      return eventSlug && inviteId
        ? lineupInvitePath(eventSlug, inviteId)
        : undefined;
    case "community_collab_invite":
      return inviteId ? collabInvitePath(inviteId) : undefined;
    case "community_collab_response":
      return eventSlug ? gatheringPath(eventSlug) : undefined;
    case "event_invite":
      return routes.myEvents;
    case "member_invite_request":
      return eventSlug
        ? manageGatheringPath(eventSlug, "attendees")
        : undefined;
    case "member_invite_reply":
      return eventSlug ? gatheringPath(eventSlug) : undefined;
    default:
      return undefined;
  }
}
