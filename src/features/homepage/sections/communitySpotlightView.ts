import { communityPath } from "../../../app/routeMap";
import {
  initialsFromName,
  leadingInitials,
} from "../../../shared/lib/initials";
import type {
  LandingCommunityFaceDTO,
  LandingCommunityFeatureDTO,
} from "../../admin/api/landingFeatures.api";
import type {
  AccessTier,
  CommunityType,
} from "../../communities/api/communities.api";

/**
 * The three brand tints the card uses — the intersection of what `ImageSlot`
 * (cover placeholder) and the demo `FACE_TINT` map (face initials) both accept,
 * so a single value drives both without casts.
 */
export type CommunityCardTint = "coral" | "jade" | "plum";

/**
 * One roster face on a featured-community card, normalized for rendering: a
 * resolved avatar (shown when present) with initials + a brand tint as the
 * fallback mark.
 */
export interface CommunitySpotlightFace {
  name: string;
  initials: string;
  avatarUrl: string | null;
  tint: CommunityCardTint;
}

/**
 * The normalized shape `FeaturedCommunityCard` renders — the community analog of
 * `SpotlightView`. Both the live `/landing/features` community DTO and the demo
 * fixtures (via `useLandingFeaturesPublic`) map into this. Unlike the demo
 * prototype's `FullCommunity`, it deliberately omits the fields real communities
 * have no data for (founder quote, location, languages, verified badge, growth
 * sparkline): the card leans on what's genuinely known — cover, category, access,
 * founding year, owner, member faces + count — and degrades gracefully.
 */
export interface CommunitySpotlightView {
  /** Feature-row id: the React key and dedupe handle. */
  key: string;
  /** Route to the community's own page. */
  to: string;
  name: string;
  /** Fallback mark for the cover placeholder. */
  initials: string;
  memberCount: number;
  blurb: string | null;
  /** Resolved cover URL; absent → the card renders a tinted placeholder. */
  coverUrl?: string;
  category: CommunityType;
  accessTier: AccessTier;
  foundedYear: number;
  /** Backend `features` slugs → "what you get" chips. */
  features: string[];
  /** The owner, rendered as "kept by ‹name›". */
  owner: CommunitySpotlightFace | null;
  /** Capped roster faces; empty when the community hides its roster. */
  faces: CommunitySpotlightFace[];
  /** Members beyond the shown faces (`memberCount - faces.length`, ≥ 0). */
  facesMore: number;
  /** Deterministic card tint so a curated set isn't all one colour. */
  tint: CommunityCardTint;
  /** Curated tag ids (⊆ `COMMUNITY_TAGS`, `communities/communityTags.data.ts`)
   *  — rendered as pills. Absent when the source doesn't carry it. */
  tags?: string[];
}

/**
 * Rotate communities/faces through the three brand tints, deterministically on
 * a key so the same community keeps its colour across renders. Mirrors
 * `spotlightView.tintForKey`.
 */
const LIVE_TINTS: CommunityCardTint[] = ["coral", "jade", "plum"];
function tintForKey(key: string): CommunityCardTint {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash += key.charCodeAt(index);
  }
  return LIVE_TINTS[hash % LIVE_TINTS.length] ?? "plum";
}

function toFace(face: LandingCommunityFaceDTO): CommunitySpotlightFace {
  return {
    name: face.name,
    initials: initialsFromName(face.name, "?"),
    avatarUrl: face.avatarUrl,
    tint: tintForKey(face.name),
  };
}

/** Map a live/demo landing community DTO into the card's view-model. */
export function landingCommunityToView(
  dto: LandingCommunityFeatureDTO,
): CommunitySpotlightView {
  const faces = dto.faces.map(toFace);
  return {
    key: dto.id,
    to: communityPath(dto.slug),
    name: dto.name,
    initials: leadingInitials(dto.name, { fallback: "?" }),
    memberCount: dto.memberCount,
    blurb: dto.blurb,
    coverUrl: dto.coverImageUrl ?? undefined,
    category: dto.category,
    accessTier: dto.accessTier,
    foundedYear: dto.foundedYear,
    features: dto.features,
    owner: dto.owner ? toFace(dto.owner) : null,
    faces,
    facesMore: Math.max(0, dto.memberCount - faces.length),
    tint: tintForKey(dto.slug),
    tags: dto.tags,
  };
}
