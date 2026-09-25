import type { TFunction } from "../../shared/i18n/types";
import type { MemberRefDTO } from "../../shared/api/refs";
import type { ListingModerationEventDTO } from "./api/adminListings.api";

/** The staff-facing actor label for a moderation event or question row.
 *  Falls back to a generic "A moderator" when the acting account is no
 *  longer resolvable (deleted/anonymised). Split out of `ListingHistoryPanel`
 *  alongside `eventLabel` so the panel component stays under the 200-line
 *  component cap once every action has its own switch case. */
export function actorName(actor: MemberRefDTO | null, t: TFunction): string {
  if (!actor) return t("admin:adminListings.history.unknownActor");
  return `${actor.firstName} ${actor.lastName}`.trim();
}

/** One line per event action: `fromStatus`/`toStatus` only apply to the two
 *  status-transition actions, so only those two interpolate `{from}`/`{to}`.
 *  Exhaustive over all 13 values of `ListingModerationAction` (mirrors the
 *  backend's `ListingModerationAction` enum in
 *  `listing-moderation-event.entity.ts`), so a new action added to the
 *  backend enum fails this switch's `never` check at compile time instead of
 *  rendering as a raw string here. */
export function eventLabel(
  event: ListingModerationEventDTO,
  t: TFunction,
): string {
  const actor = actorName(event.actor, t);
  const from = event.fromStatus
    ? t(`admin:adminListings.status.${event.fromStatus}`)
    : "";
  const to = event.toStatus
    ? t(`admin:adminListings.status.${event.toStatus}`)
    : "";
  switch (event.action) {
    case "status_changed":
      return t("admin:adminListings.history.event.statusChanged", {
        actor,
        from,
        to,
      });
    case "bulk_status":
      return t("admin:adminListings.history.event.bulkStatus", {
        actor,
        from,
        to,
      });
    case "removed":
      return t("admin:adminListings.history.event.removed", { actor });
    case "question_asked":
      return t("admin:adminListings.history.event.questionAsked", { actor });
    case "answered":
      return t("admin:adminListings.history.event.answered", { actor });
    case "ownership_transferred":
      return t("admin:adminListings.history.event.ownershipTransferred", {
        actor,
      });
    case "owner_edited":
      return t("admin:adminListings.history.event.ownerEdited", { actor });
    case "co_manager_added":
      return t("admin:adminListings.history.event.coManagerAdded", {
        actor,
      });
    case "co_manager_removed":
      return t("admin:adminListings.history.event.coManagerRemoved", {
        actor,
      });
    case "staff_created":
      return t("admin:adminListings.history.event.staffCreated", { actor });
    case "suggestion_applied":
      return t("admin:adminListings.history.event.suggestionApplied", {
        actor,
      });
    case "directory_paused":
      return t("admin:adminListings.history.event.directoryPaused", {
        actor,
      });
    case "directory_resumed":
      return t("admin:adminListings.history.event.directoryResumed", {
        actor,
      });
    default: {
      const exhaustiveCheck: never = event.action;
      return exhaustiveCheck;
    }
  }
}
