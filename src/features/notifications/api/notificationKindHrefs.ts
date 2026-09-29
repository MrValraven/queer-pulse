import { routes } from "../../../app/routeMap";
import { MY_HOUSING_LISTINGS_PATH } from "../../economy/housing.data";
import { gatheringPath } from "../../gatherings/data";
import { listingCorrectionContactPath } from "../../marketing/contactPrefill";

/**
 * A landlord's public page. The route is declared as the literal
 * `/work/landlord/:slug` in `economy/routes.tsx` and has no `routeMap.ts`
 * entry, the same literal `shared/media/mediaReferences.ts` builds.
 */
const LANDLORD_PAGE_PATH = "/work/landlord";

function slugOf(
  payload: Record<string, unknown> | null | undefined,
  field: string,
): string | undefined {
  const value = payload?.[field];
  return typeof value === "string" && value ? value : undefined;
}

/**
 * ENG-409. The destinations of the kinds in `notificationKindCopy.ts` whose
 * payload the generic `source` branches in `sourceHrefFromPayload` would
 * resolve wrongly or not at all. Returns `null` for every other type (and for
 * the ones the generic branches already get right: the community kinds via
 * `source: "community"`, `forum_thread_reviewed` via `source: "forum"`, the
 * approved claim, the edit suggestion and the venue attachment via
 * `source: "listing"`), so the caller falls through to them. A returned
 * `{ href: undefined }` means "handled, and this row has no destination".
 *
 * Keyed on `type`, the same way the report and ban-evasion branches are,
 * because each payload here either carries no `source` at all or carries one
 * (`governance`, `housing_group`, `landlord`) that no generic branch reads.
 */
export function lifecycleSourceHref(
  type: string,
  payload: Record<string, unknown> | null | undefined,
): { href: string | undefined } | null {
  switch (type) {
    // A host's announcement. Newer rows carry `source: "event"` and would
    // resolve through the generic event branch too; rows stored before the
    // backend forwarded `source` carry `eventSlug` alone, so the type is
    // matched here for both.
    case "event_announcement": {
      const eventSlug = slugOf(payload, "eventSlug");
      return { href: eventSlug ? gatheringPath(eventSlug) : undefined };
    }
    // The proposer's motion is read on the public governance page. The
    // payload's `proposalId` is not on the backend allowlist, so the page
    // itself is the most precise destination the row can build.
    case "governance_motion_approved":
    case "governance_motion_rejected":
      return { href: routes.governance };
    // Staff duty mail: the console where the motion is screened.
    case "governance_motion_ready_for_review":
      return { href: routes.adminGovernance };
    // Staff duty mail: the communities console, where an owner is reassigned.
    case "community_owner_review_requested":
      return { href: routes.adminCommunities };
    case "group_listing_decided": {
      const groupSlug = slugOf(payload, "groupSlug");
      return {
        href: groupSlug ? `${routes.housingGroups}/${groupSlug}` : undefined,
      };
    }
    // Only a live entry has a page the suggester can open: a held-back entry
    // is off the public directory and a removed one no longer exists.
    case "landlord_suggestion_decided": {
      const landlordSlug = slugOf(payload, "landlordSlug");
      const isLive = payload?.decision === "live";
      return {
        href:
          isLive && landlordSlug
            ? `${LANDLORD_PAGE_PATH}/${landlordSlug}`
            : undefined,
      };
    }
    case "landlord_intro_request_decided": {
      const landlordSlug = slugOf(payload, "landlordSlug");
      return {
        href: landlordSlug
          ? `${LANDLORD_PAGE_PATH}/${landlordSlug}`
          : undefined,
      };
    }
    // An approved listing opens the listing itself. Every other outcome opens
    // the lister's own listings page, which carries the decision and the
    // reason, since a rejected or pulled listing is off the public board.
    case "housing_listing_decision": {
      const slug = slugOf(payload, "slug");
      if (payload?.decision === "approve" && slug) {
        return { href: `${routes.housing}/${slug}` };
      }
      return { href: MY_HOUSING_LISTINGS_PATH };
    }
    // A declined claim opens the member's own claims, where its status is.
    // The payload now also names the listing (`source: "listing"`,
    // `listingSlug`), but the public listing page shows nothing about the
    // claim, so the claims page stays the destination. An approved claim
    // resolves to that listing through the generic listing branch.
    case "listing_claim_declined":
      return { href: routes.listingClaims };
    // PRD-433/434. A suggestion held back, sent back or removed has no public
    // page to open. The row opens the contact form prefilled for a correction
    // to that listing's ref instead, which is also how a suggester answers
    // "needs more information". The live row resolves to the listing itself
    // through the generic listing branch (`source: "listing"`, `listingSlug`).
    case "listing_suggestion_needs_info":
    case "listing_suggestion_sent_back":
    case "listing_suggestion_removed": {
      const listingRef = slugOf(payload, "listingRef");
      return {
        href: listingRef ? listingCorrectionContactPath(listingRef) : undefined,
      };
    }
    // Persona rows carry no persona address today, so they open the member's
    // own personas dashboard, where incoming invites and every persona they
    // hold are listed. For `subprofile_invite` and `subprofile_co_owner_joined`
    // the allowlist does forward `subprofileSlugOrHandle` and `deepLink`, but
    // their emit sites (`notifications.listener.ts`) do not write either yet.
    // `persona_endorsed` and `persona_followed` now carry `subprofileName` for
    // the copy, but no persona slug or handle, so the dashboard stays their
    // destination too.
    case "persona_endorsed":
    case "persona_followed":
    case "subprofile_invite":
    case "subprofile_co_owner_joined":
      return { href: routes.subprofilesDashboard };
    // The persona is gone, or no longer theirs: nothing to open.
    case "subprofile_deleted":
    case "subprofile_member_removed":
      return { href: undefined };
    // The member's own badge case. `badgeKey` is the catalogue id the page
    // reads from `?badge=` to open that badge's drawer; a row without one
    // still opens the case.
    case "badge_earned": {
      const badgeKey = slugOf(payload, "badgeKey");
      return {
        href: badgeKey
          ? `${routes.badges}?badge=${encodeURIComponent(badgeKey)}`
          : routes.badges,
      };
    }
    // The level ladder lives on the same page.
    case "xp_level_up":
      return { href: routes.badges };
    default:
      return null;
  }
}
