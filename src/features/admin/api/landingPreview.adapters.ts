import type { LandingFeatureVM } from "./landingFeatures.adapters";
import type {
  LandingChangemakerFeatureDTO,
  LandingCommunityFeatureDTO,
  LandingMemberFeatureDTO,
} from "./landingFeatures.api";

/**
 * Adapt the admin-curation view-models (`useLandingFeatures`) into the public
 * `/landing/features` DTO shapes the homepage sections render, so the
 * `/admin/landing` preview shows the real cards driven by what the admin is
 * editing right now. The admin VM is the live source of truth for *which*
 * targets are featured, their *order*, their *active* flag and their editorial
 * *copy* — every one of those updates the instant a mutation invalidates its
 * query, so the preview reflects an edit with no save round-trip.
 *
 * What the VM can't supply is entity chrome the admin doesn't author — a
 * member's profile tags, a community's cover/roster/category/founding year.
 * That chrome is filled by matching the public feed (`useLandingFeaturesPublic`)
 * on slug. Members and changemakers reconstruct fully from the VM alone (the
 * card hides the tag bits it lacks); communities need the enrichment for a rich
 * card, so a not-yet-enriched pick is surfaced separately as "pending" rather
 * than rendered as a card with fabricated zeros.
 */

const asString = (value: unknown): string =>
  typeof value === "string" ? value : "";

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

/** The exact subset the public page renders: active slots, in `position` order.
 *  (`sort` copies first so the source array from react-query is never mutated.) */
export function activeInOrder(features: LandingFeatureVM[]): LandingFeatureVM[] {
  return features
    .filter((feature) => feature.active)
    .slice()
    .sort((first, second) => first.position - second.position);
}

/** Index a public feed slice by slug, for O(1) enrichment lookups per VM. */
export function bySlug<Item extends { slug: string }>(
  items: Item[],
): Map<string, Item> {
  return new Map(items.map((item) => [item.slug, item]));
}

const slugOf = (feature: LandingFeatureVM): string =>
  feature.target?.slug ?? feature.targetId;

export function previewMemberDTOs(
  features: LandingFeatureVM[],
  enrichBySlug: Map<string, LandingMemberFeatureDTO>,
): LandingMemberFeatureDTO[] {
  return activeInOrder(features).map((feature) => {
    const slug = slugOf(feature);
    const enrich = enrichBySlug.get(slug);
    return {
      id: feature.id,
      slug,
      name: feature.target?.name ?? enrich?.name ?? "",
      tagline: enrich?.tagline ?? null,
      avatarUrl: feature.target?.avatarUrl ?? enrich?.avatarUrl ?? null,
      quote: asString(feature.copy.quote) || (enrich?.quote ?? ""),
      tags: enrich?.tags ?? [],
    };
  });
}

export function previewChangemakerDTOs(
  features: LandingFeatureVM[],
  enrichBySlug: Map<string, LandingChangemakerFeatureDTO>,
): LandingChangemakerFeatureDTO[] {
  return activeInOrder(features).map((feature) => {
    const slug = slugOf(feature);
    const enrich = enrichBySlug.get(slug);
    const copyTags = asStringArray(feature.copy.tags);
    return {
      id: feature.id,
      slug,
      name: feature.target?.name ?? enrich?.name ?? "",
      cause: asString(feature.copy.cause) || (enrich?.cause ?? ""),
      blurb: asString(feature.copy.blurb) || (enrich?.blurb ?? ""),
      tags: copyTags.length > 0 ? copyTags : (enrich?.tags ?? []),
    };
  });
}

/** A featured community the public feed hasn't enriched yet (a session-only add
 *  in demo, or a pick whose live data hasn't loaded) — shown as a lightweight
 *  note instead of a rich card built on fabricated member counts / founding
 *  years. */
export interface PendingCommunityPreview {
  id: string;
  name: string;
  blurb: string;
}

export interface CommunityPreviewSplit {
  /** Fully-enriched communities → the real `FeaturedCommunityCard`, with the
   *  admin's current blurb overriding the entity's default. */
  enriched: LandingCommunityFeatureDTO[];
  pending: PendingCommunityPreview[];
}

export function previewCommunityDTOs(
  features: LandingFeatureVM[],
  enrichBySlug: Map<string, LandingCommunityFeatureDTO>,
): CommunityPreviewSplit {
  const enriched: LandingCommunityFeatureDTO[] = [];
  const pending: PendingCommunityPreview[] = [];
  for (const feature of activeInOrder(features)) {
    const enrich = enrichBySlug.get(slugOf(feature));
    const blurb = asString(feature.copy.blurb);
    if (enrich) {
      enriched.push({ ...enrich, blurb: blurb || enrich.blurb });
    } else {
      pending.push({ id: feature.id, name: feature.target?.name ?? "", blurb });
    }
  }
  return { enriched, pending };
}
