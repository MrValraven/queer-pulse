import { routes } from "../../../app/routeMap";

/**
 * Where each admin queue's bell row goes.
 *
 * Frontend mirror of the backend's `ADMIN_QUEUE_REGISTRY`
 * (`src/admin-queue-notifications/admin-queue.registry.ts`). The keys are the
 * wire contract carried in `payload.queue`, so they are append-only: add one
 * when a queue is added, never rename one, or old rows lose their deep link.
 *
 * The backend registry additionally carries the tier and grants that decide
 * WHO receives a row. That half is not mirrored here, because by the time a
 * row reaches this file it has already been addressed to somebody. What this
 * file owns is only the destination.
 *
 * 28 keys map onto 23 distinct routes: /admin/moderation carries two
 * (`appeals`, `ban_ratifications`), /admin/safe-spaces two
 * (`safe_space_nominations`, `safe_space_flags`), /admin/landlords two
 * (`landlord_intro_requests`, `landlord_suggestions`), and /admin/listings
 * three (`listing_submissions`, `listing_claims`,
 * `listing_edit_suggestions`). Repeats are expected, not a mistake.
 */
export const ADMIN_QUEUE_ROUTES: Record<string, string> = {
  invite_requests: routes.adminJoinRequests,
  appeals: routes.adminModeration,
  ban_ratifications: routes.adminModeration,
  verification: routes.adminVerifications,
  dsar: routes.adminDsar,
  housing_listings: routes.adminHousingListings,
  housing_group_listings: routes.adminHousingGroupListings,
  landlord_intro_requests: routes.adminLandlords,
  landlord_suggestions: routes.adminLandlords,
  concerns: routes.adminConcerns,
  intakes: routes.adminIntakes,
  legal_requests: routes.adminLegalRequests,
  housing_coop_join_requests: routes.adminHousingCoops,
  community_tag_requests: routes.adminCommunityTagRequests,
  reading_group_proposals: routes.adminReadingGroupProposals,
  safe_space_nominations: routes.adminSafeSpaces,
  safe_space_flags: routes.adminSafeSpaces,
  listing_submissions: routes.adminListings,
  listing_claims: routes.adminListings,
  listing_edit_suggestions: routes.adminListings,
  resource_suggestions: routes.adminResourceSuggestions,
  magazine_submissions: routes.adminMagazineSubmissions,
  writer_applications: routes.adminWriterApplications,
  commission_interests: routes.adminCommissionInterests,
  partner_applications: routes.adminPartnerApplications,
  changemaker_nominations: routes.adminChangemakerNominations,
  // POST /roadmap/ideas creates a pending roadmap idea that admins promote,
  // merge or decline. It sat in a staff queue with nothing announcing its
  // arrival until this queue was added (final review of the admin-queue
  // arrival notifications feature).
  roadmap_ideas: routes.adminRoadmap,
  // PRD-270. The one queue whose arrivals are made by TIME rather than by a
  // member: a guide whose review date has passed, or that has never been
  // reviewed and is therefore withheld from the public entirely. The daily
  // sweeper announces them into the console that already sorts stalest-first.
  guide_reviews: routes.adminResourceGuides,
};

/** Every queue key, for catalog-coverage tests. */
export const ADMIN_QUEUE_KEYS: readonly string[] =
  Object.keys(ADMIN_QUEUE_ROUTES);

/**
 * The destination for one queue key, or `undefined` for a key this build does
 * not know. A newer backend can send a queue this frontend has never heard of;
 * the row still reads, it simply does not link.
 */
export function adminQueueRoute(queue: string): string | undefined {
  return ADMIN_QUEUE_ROUTES[queue];
}
