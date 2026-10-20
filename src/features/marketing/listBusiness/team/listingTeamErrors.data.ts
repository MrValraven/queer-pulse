import { ApiError } from "../../../../shared/api/client";
import type { Formatters } from "../../../../shared/i18n/format";
import {
  LISTING_TEAM_ERROR_CODES,
  LISTING_TEAM_LIMITS,
  type ListingTeamErrorCode,
  type ListingTeamSide,
} from "../api/listingTeam.types";

const ERROR_KEY_PREFIX = "marketing:listingTeam.errors.";

const KEY_BY_CODE: Record<ListingTeamErrorCode, string> = {
  listing_team_persona_not_found: "personaNotFound",
  listing_team_listing_not_found: "listingNotFound",
  listing_team_link_not_found: "linkGone",
  listing_team_persona_ineligible: "personaIneligible",
  listing_team_listing_not_live: "listingNotLive",
  listing_team_already_pending: "alreadyPendingInvite",
  listing_team_already_accepted: "alreadyAccepted",
  listing_team_cooldown: "cooldown",
  listing_team_full: "teamFull",
  listing_team_pending_full: "pendingFullListing",
  listing_team_persona_full: "personaFull",
  listing_team_persona_requests_full: "personaRequestsFull",
  listing_team_not_pending: "linkGone",
  listing_team_not_accepted: "notAccepted",
  listing_team_order_mismatch: "orderMismatch",
};

function readErrorBody(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof ApiError)) return null;
  const data: unknown = error.data;
  if (typeof data !== "object" || data === null) return null;
  return data as Record<string, unknown>;
}

function isListingTeamErrorCode(value: unknown): value is ListingTeamErrorCode {
  return (
    typeof value === "string" &&
    (LISTING_TEAM_ERROR_CODES as readonly string[]).includes(value)
  );
}

export function listingTeamErrorCode(
  error: unknown,
): ListingTeamErrorCode | null {
  const body = readErrorBody(error);
  const code = body?.code;
  return isListingTeamErrorCode(code) ? code : null;
}

export function listingTeamErrorCopy(
  error: unknown,
  side: ListingTeamSide,
  formatters: Formatters,
): { messageKey: string; values: Record<string, string> } {
  const code = listingTeamErrorCode(error);
  const body = readErrorBody(error);
  const withKey = (key: string, values: Record<string, string> = {}) => ({
    messageKey: `${ERROR_KEY_PREFIX}${key}`,
    values,
  });
  if (code === null) return withKey("generic");

  switch (code) {
    case "listing_team_cooldown": {
      const retryAtRaw = body?.retryAt;
      const retryAt = new Date(
        typeof retryAtRaw === "string" ? retryAtRaw : "",
      );
      if (Number.isNaN(retryAt.getTime())) return withKey("cooldownLater");
      return withKey("cooldown", {
        date: formatters.date(retryAt, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      });
    }
    case "listing_team_already_pending":
      return withKey(
        body?.initiatedBy === "persona"
          ? "alreadyPendingRequest"
          : "alreadyPendingInvite",
      );
    case "listing_team_full":
      return withKey("teamFull", {
        max: formatters.number(LISTING_TEAM_LIMITS.acceptedPerListing),
      });
    case "listing_team_pending_full":
      return withKey(
        side === "listing" ? "pendingFullListing" : "pendingFullPersona",
        { max: formatters.number(LISTING_TEAM_LIMITS.pendingPerListing) },
      );
    case "listing_team_persona_full":
      return withKey("personaFull", {
        max: formatters.number(LISTING_TEAM_LIMITS.acceptedPerPersona),
      });
    case "listing_team_persona_requests_full":
      return withKey("personaRequestsFull", {
        max: formatters.number(LISTING_TEAM_LIMITS.pendingRequestsPerPersona),
      });
    default:
      return withKey(KEY_BY_CODE[code]);
  }
}
