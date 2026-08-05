import type {
  AdminEligibleEntityDTO,
  AdminLandingFeatureDTO,
  LandingSection,
} from "./api/landingFeatures.api";
import { spotlights } from "../homepage/sections/Discovery.data";
import { members as homepageMembers } from "../homepage/data/members";
import {
  spotlightCommunities,
  type FullCommunity,
  type SpotlightCommunity,
} from "../homepage/sections/Communities.data";
import { changemakers } from "../homepage/data/changemakers";

/**
 * Demo fixtures + demo-session mutation registry for the admin landing-page
 * curation surface (`/admin/landing`). Every entity referenced here is a real
 * member/community/changemaker already present in the homepage's static
 * curation data (`homepage/sections/Discovery.data`, `Communities.data`,
 * `homepage/data/changemakers`) — this file only reshapes that curation into
 * `AdminLandingFeatureDTO`/`AdminEligibleEntityDTO` so the admin picker has
 * something to show without a network, never invents a new persona.
 */

// ── Section-scoped narrowing helpers ─────────────────────────────────────────

/** `spotlightCommunities` mixes `FullCommunity` (real card content) and
 *  `QuietCommunity` (a rail-only placeholder with no `desc`/`photoSrc`) —
 *  only `FullCommunity` entries have enough content to feature. */
function isFullCommunity(community: SpotlightCommunity): community is FullCommunity {
  return community.quiet !== true;
}

const fullSpotlightCommunities = spotlightCommunities.filter(isFullCommunity);

/** First five spotlight communities are curated onto the landing page by
 *  default; the rest sit in `DEMO_ELIGIBLE.community` as "not yet featured". */
const FEATURED_COMMUNITY_COUNT = 5;
const featuredCommunities = fullSpotlightCommunities.slice(
  0,
  FEATURED_COMMUNITY_COUNT,
);
const eligibleCommunities = fullSpotlightCommunities.slice(
  FEATURED_COMMUNITY_COUNT,
);

/** The three homepage changemaker seeds credit a member by their real
 *  registry slug (`catarina-vaz`, `jonas`, `luisa`), but `ChangeMaker.key`
 *  (the exported shape's identity) shortens `catarina-vaz` to `catarina` for
 *  the homepage card's DOM key. This maps back to the real member slug so
 *  `target.slug` — and the admin picker's link to the member's profile —
 *  stays correct. */
const CHANGEMAKER_MEMBER_SLUG: Record<string, string> = {
  catarina: "catarina-vaz",
  jonas: "jonas",
  luisa: "luisa",
};

/** Members already in the homepage's featured-spotlight rotation, so they're
 *  excluded from `DEMO_ELIGIBLE.member` (an admin can't "add" someone who's
 *  already featured). */
const featuredMemberKeys = new Set(
  spotlights.map((spotlight) => spotlight.member.key),
);
const eligibleMembers = homepageMembers.filter(
  (member) => !featuredMemberKeys.has(member.key),
);

// ── DEMO_LANDING_FEATURES — the immutable seed ───────────────────────────────

/** The demo-mode seed for every section's curated slots, shaped exactly like
 *  `GET /admin/landing/features?section=...` would answer. Never mutated
 *  directly — `useLandingFeatures`/the mutation hooks read/write the
 *  module-scoped registry below, which is lazily cloned from this seed. */
export const DEMO_LANDING_FEATURES: Record<
  LandingSection,
  AdminLandingFeatureDTO[]
> = {
  member: spotlights.map((spotlight, index) => ({
    id: `demo-member-${spotlight.member.key}`,
    section: "member",
    targetId: spotlight.member.key,
    position: index,
    active: true,
    copy: { quote: spotlight.quote },
    target: {
      slug: spotlight.member.key,
      name: spotlight.member.name,
      avatarUrl: spotlight.member.photo ?? null,
    },
    eligible: true,
    hiddenReason: null,
  })),
  community: featuredCommunities.map((community, index) => ({
    id: `demo-community-${community.anchor}`,
    section: "community",
    targetId: community.anchor,
    position: index,
    active: true,
    copy: { blurb: community.desc },
    target: {
      slug: community.anchor,
      name: community.railName,
      avatarUrl: community.photoSrc ?? null,
    },
    eligible: true,
    hiddenReason: null,
  })),
  changemaker: changemakers.map((changemaker, index) => {
    const memberSlug =
      CHANGEMAKER_MEMBER_SLUG[changemaker.key] ?? changemaker.key;
    return {
      id: `demo-changemaker-${changemaker.key}`,
      section: "changemaker",
      targetId: memberSlug,
      position: index,
      active: true,
      copy: {
        cause: changemaker.cause,
        blurb: changemaker.blurb,
        tags: changemaker.tags,
      },
      target: {
        slug: memberSlug,
        name: changemaker.name,
        avatarUrl: changemaker.image ?? null,
      },
      eligible: true,
      hiddenReason: null,
    };
  }),
};

// ── DEMO_ELIGIBLE — the "not yet featured" picker pool ───────────────────────

/** The demo-mode seed for `GET /admin/landing/eligible?section=...` — real
 *  members/communities not currently in `DEMO_LANDING_FEATURES` for that
 *  section, so the admin "add a slot" picker has something to search.
 *  `getDemoLandingEligible` derives the *live* eligible pool (this seed minus
 *  whatever the session has since featured) — read that, not this constant,
 *  from hooks. */
export const DEMO_ELIGIBLE: Record<LandingSection, AdminEligibleEntityDTO[]> = {
  member: eligibleMembers.map((member) => ({
    targetId: member.key,
    slug: member.key,
    name: member.name,
    avatarUrl: member.photo ?? null,
  })),
  community: eligibleCommunities.map((community) => ({
    targetId: community.anchor,
    slug: community.anchor,
    name: community.railName,
    avatarUrl: community.photoSrc ?? null,
  })),
  // Reuses the first two not-yet-featured members (`eligibleMembers`: chef
  // Tomás, then psychologist Mariana) rather than inventing new changemaker
  // personas — there is no separate "changemaker candidate" registry in the
  // app.
  changemaker: eligibleMembers.slice(0, 2).map((member) => ({
    targetId: member.key,
    slug: member.key,
    name: member.name,
    avatarUrl: member.photo ?? null,
  })),
};

// ── Demo-session mutation registry ───────────────────────────────────────────

/**
 * The demo-session's mutable copy of `DEMO_LANDING_FEATURES`, lazily cloned
 * on first access. Module-level (not `useState`/context) on purpose, mirroring
 * `adminListings.data.ts`'s `demoListingMutations`: it must survive remounts
 * of every hook/component reading the curation lists, and reset only on a
 * full page reload — not on navigation between admin screens. Add/remove/
 * reorder/update all write straight into this registry; `DEMO_LANDING_FEATURES`
 * itself is never touched, so a reload always starts from the same seed.
 */
let demoLandingRegistry: Record<LandingSection, AdminLandingFeatureDTO[]> | null =
  null;

function ensureDemoLandingRegistry(): Record<
  LandingSection,
  AdminLandingFeatureDTO[]
> {
  if (!demoLandingRegistry) {
    demoLandingRegistry = {
      member: DEMO_LANDING_FEATURES.member.map((feature) => ({ ...feature })),
      community: DEMO_LANDING_FEATURES.community.map((feature) => ({
        ...feature,
      })),
      changemaker: DEMO_LANDING_FEATURES.changemaker.map((feature) => ({
        ...feature,
      })),
    };
  }
  return demoLandingRegistry;
}

/** Read one section's current demo-session features, ordered by `position`.
 *  This — not `DEMO_LANDING_FEATURES` — is what `useLandingFeatures` reads in
 *  demo mode, so prior adds/removes/reorders in this session stay visible. */
export function getDemoLandingFeatures(
  section: LandingSection,
): AdminLandingFeatureDTO[] {
  return [...ensureDemoLandingRegistry()[section]].sort(
    (featureA, featureB) => featureA.position - featureB.position,
  );
}

/** Read one section's current "not yet featured" pool: the static
 *  `DEMO_ELIGIBLE` seed minus whatever the session has since featured (by
 *  `targetId`), optionally narrowed by a case-insensitive name search — this
 *  is what `useLandingEligible` reads in demo mode. */
export function getDemoLandingEligible(
  section: LandingSection,
  search: string,
): AdminEligibleEntityDTO[] {
  const featuredTargetIds = new Set(
    ensureDemoLandingRegistry()[section].map((feature) => feature.targetId),
  );
  const needle = search.trim().toLowerCase();
  return DEMO_ELIGIBLE[section].filter(
    (entity) =>
      !featuredTargetIds.has(entity.targetId) &&
      (!needle || entity.name.toLowerCase().includes(needle)),
  );
}

/** Demo-mode equivalent of `POST /admin/landing/features`: appends a new slot
 *  at the end of `section`, resolving `target` from the eligible pool (or
 *  the entity's own registry entry, if it was somehow already featured under
 *  another `copy`) so the new row renders a real name/avatar immediately. */
export function createDemoLandingFeature(
  section: LandingSection,
  targetId: string,
  copy: Record<string, unknown>,
): AdminLandingFeatureDTO {
  const registry = ensureDemoLandingRegistry();
  const sectionFeatures = registry[section];
  const eligibleEntity = DEMO_ELIGIBLE[section].find(
    (entity) => entity.targetId === targetId,
  );
  const newFeature: AdminLandingFeatureDTO = {
    id: `demo-${section}-${targetId}-${Date.now()}`,
    section,
    targetId,
    position: sectionFeatures.length,
    active: true,
    copy,
    target: eligibleEntity
      ? {
          slug: eligibleEntity.slug,
          name: eligibleEntity.name,
          avatarUrl: eligibleEntity.avatarUrl,
        }
      : null,
    eligible: true,
    hiddenReason: null,
  };
  sectionFeatures.push(newFeature);
  return newFeature;
}

/** Demo-mode equivalent of `PATCH /admin/landing/features/:id`: merges
 *  `patch` into the matching feature across every section (mirroring the
 *  live endpoint, which is keyed by `id` alone, not `id` + `section`). */
export function updateDemoLandingFeature(
  id: string,
  patch: { copy?: Record<string, unknown>; active?: boolean },
): AdminLandingFeatureDTO {
  const registry = ensureDemoLandingRegistry();
  for (const section of Object.keys(registry) as LandingSection[]) {
    const sectionFeatures = registry[section];
    const index = sectionFeatures.findIndex((feature) => feature.id === id);
    const existingFeature = sectionFeatures[index];
    if (index !== -1 && existingFeature) {
      // Callers (e.g. a copy-only edit or an active-only toggle) pass a
      // partial patch where the untouched field is `undefined`, not absent —
      // spreading it verbatim would overwrite that field with `undefined`
      // instead of leaving it alone. Only merge keys the caller actually set.
      const updatedFeature: AdminLandingFeatureDTO = { ...existingFeature };
      if (patch.copy !== undefined) updatedFeature.copy = patch.copy;
      if (patch.active !== undefined) updatedFeature.active = patch.active;
      sectionFeatures[index] = updatedFeature;
      return updatedFeature;
    }
  }
  throw new Error(`Demo landing feature not found: ${id}`);
}

/** Demo-mode equivalent of `PATCH /admin/landing/features/reorder`:
 *  replaces `section`'s order with `orderedIds`, re-deriving each feature's
 *  `position` from its new index. IDs the caller passes that no longer exist
 *  are silently dropped (mirrors a client racing a since-removed row). */
export function reorderDemoLandingFeatures(
  section: LandingSection,
  orderedIds: string[],
): AdminLandingFeatureDTO[] {
  const registry = ensureDemoLandingRegistry();
  const featuresById = new Map(
    registry[section].map((feature) => [feature.id, feature] as const),
  );
  const reorderedFeatures = orderedIds
    .map((id) => featuresById.get(id))
    .filter((feature): feature is AdminLandingFeatureDTO => Boolean(feature))
    .map((feature, index) => ({ ...feature, position: index }));
  registry[section] = reorderedFeatures;
  return reorderedFeatures;
}

/** Demo-mode equivalent of `DELETE /admin/landing/features/:id`: drops the
 *  matching feature from whichever section holds it and closes the gap in
 *  `position` so the remaining slots stay contiguous. */
export function deleteDemoLandingFeature(id: string): void {
  const registry = ensureDemoLandingRegistry();
  for (const section of Object.keys(registry) as LandingSection[]) {
    const sectionFeatures = registry[section];
    const index = sectionFeatures.findIndex((feature) => feature.id === id);
    if (index !== -1) {
      registry[section] = sectionFeatures
        .filter((feature) => feature.id !== id)
        .map((feature, newIndex) => ({ ...feature, position: newIndex }));
      return;
    }
  }
}

/** Reset the demo-session registry to the seed. Nothing in the app calls
 *  this today (a page reload already clears the in-memory object); kept for
 *  completeness and for tests that want a clean slate between cases. */
export function resetDemoLandingRegistry(): void {
  demoLandingRegistry = null;
}
