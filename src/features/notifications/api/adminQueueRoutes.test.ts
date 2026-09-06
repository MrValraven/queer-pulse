import { describe, expect, it } from "vitest";
import { requiredRole } from "../../../app/authGate";
import { routes } from "../../../app/routeMap";
import { ADMIN_NAV_SECTIONS } from "../../../shared/components/layout/adminNav.data";
import {
  ADMIN_QUEUE_KEYS,
  ADMIN_QUEUE_ROUTES,
  adminQueueRoute,
} from "./adminQueueRoutes";

/**
 * The same table asserted on the backend in
 * `queerpulse-backend/src/admin-queue-notifications/admin-queue.registry.spec.ts`.
 * The two are the whole contract between the repos: an edit on one side that
 * is not made on the other fails here or there.
 */
const EXPECTED_CAPABILITIES: Record<string, string[]> = {
  invite_requests: [],
  appeals: [],
  ban_ratifications: [],
  verification: [],
  dsar: [],
  housing_listings: ["housing_moderator"],
  housing_group_listings: ["housing_moderator"],
  landlord_intro_requests: [],
  landlord_suggestions: [],
  concerns: [],
  intakes: [],
  legal_requests: [],
  housing_coop_join_requests: [],
  community_tag_requests: ["communities"],
  reading_group_proposals: ["communities"],
  safe_space_nominations: ["directory_moderator"],
  safe_space_flags: [],
  listing_submissions: ["directory_moderator"],
  listing_claims: ["directory_moderator"],
  listing_edit_suggestions: ["directory_moderator"],
  resource_suggestions: ["resource_curator"],
  magazine_submissions: ["editorial"],
  writer_applications: ["editorial"],
  commission_interests: ["editorial"],
  partner_applications: ["partnerships"],
  changemaker_nominations: ["partnerships"],
  roadmap_ideas: [],
  guide_reviews: ["resource_curator"],
};

/**
 * The tier half of the backend mirror: which queues page BOTH staff tiers
 * versus admins only. `EXPECTED_CAPABILITIES` above already asserts the grant
 * half against the admin rail; this is the other half, asserted against
 * `MOD_ACCESSIBLE_ADMIN_PATTERNS` in `authGate.ts`, which decides whether a
 * moderator's own session can open the route a queue's arrival row points at.
 *
 * Without this, an edit to the backend registry's tier for a queue (or to
 * `MOD_ACCESSIBLE_ADMIN_PATTERNS` on this side) could page a moderator about a
 * queue the route gate then bounces them from, or leave an admin queue silent
 * for the moderators the backend actually wants working it.
 */
const MOD_TIER_QUEUES: readonly string[] = [
  "invite_requests",
  "appeals",
  "ban_ratifications",
  "verification",
  "dsar",
  "housing_listings",
  "housing_group_listings",
  "landlord_intro_requests",
  "landlord_suggestions",
];

const navItemsByPath = new Map(
  ADMIN_NAV_SECTIONS.flatMap((section) => section.items).map((item) => [
    item.to,
    item,
  ]),
);

describe("admin queue routes", () => {
  it("covers twenty-eight queues", () => {
    expect(ADMIN_QUEUE_KEYS).toHaveLength(28);
  });

  it("points every queue at a real admin route", () => {
    const knownRoutes = new Set<string>(Object.values(routes));
    for (const route of Object.values(ADMIN_QUEUE_ROUTES)) {
      expect(knownRoutes.has(route)).toBe(true);
    }
  });

  it("agrees with the admin rail about which grants reach each queue", () => {
    for (const [queue, route] of Object.entries(ADMIN_QUEUE_ROUTES)) {
      const navItem = navItemsByPath.get(route);
      if (!navItem) continue; // a queue whose route is a tab of another page
      // `safe_space_flags` is a deliberate exception, skipped rather than
      // asserted here. It shares /admin/safe-spaces with
      // `safe_space_nominations`, whose nav row carries `directory_moderator`
      // because the nomination queue genuinely is open to that grant. The
      // flag queue is not: it is the only surface in the console that serves
      // a flagger's identity together with their free text, and the backend
      // registry keeps it closed to `directory_moderator` on purpose. If this
      // assertion were applied to `safe_space_flags` too, the honest fix for
      // a future failure would look like copying the neighbouring row's
      // capability onto it, which is exactly the wrong move: it would tell a
      // `directory_moderator` grant holder that a flag exists against a space
      // they may have listed themselves, on a queue their grant was never
      // meant to open. Do not add `safe_space_flags` to EXPECTED_CAPABILITIES
      // and remove this skip in the same change.
      if (queue === "safe_space_flags") continue;
      expect(navItem.capabilities ?? []).toEqual(EXPECTED_CAPABILITIES[queue]);
    }
  });

  it("hides the legal register from the moderator rail", () => {
    const navItem = navItemsByPath.get(routes.adminLegalRequests);
    expect(navItem?.isAdminOnly).toBe(true);
  });

  it("agrees with authGate about which queues page a moderator", () => {
    for (const [queue, route] of Object.entries(ADMIN_QUEUE_ROUTES)) {
      const isModTierQueue = MOD_TIER_QUEUES.includes(queue);
      // `requiredRole` checks `MOD_ACCESSIBLE_ADMIN_PATTERNS` before the
      // blanket `/admin/*` admin-only match, so it returning "mod" for one of
      // these routes is exactly membership in that list, matched the same way
      // the route guard matches it (react-router's `matchPath`, wildcards
      // included) rather than by naive string equality.
      expect(requiredRole(route) === "mod").toBe(isModTierQueue);
    }
  });

  it("returns undefined for a queue this build does not know", () => {
    expect(adminQueueRoute("some_future_queue")).toBeUndefined();
  });
});
