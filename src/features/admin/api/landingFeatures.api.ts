import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type { AccessTier, CommunityType } from "../../communities/api/communities.api";

export type LandingSection = "member" | "community" | "changemaker";

/** Why an already-featured target no longer renders on the public landing
 *  page — surfaced so admins can spot and clear stale slots instead of the
 *  slot silently going empty. `null` = still eligible. */
export type LandingHiddenReason =
  | "consent_revoked"
  | "went_private"
  | "unpublished"
  | "not_public"
  | "deleted";

export interface AdminLandingFeatureDTO {
  id: string;
  section: LandingSection;
  targetId: string;
  position: number;
  active: boolean;
  copy: Record<string, unknown>;
  target: { slug: string; name: string; avatarUrl?: string | null } | null;
  eligible: boolean;
  hiddenReason: LandingHiddenReason | null;
}

export interface AdminEligibleEntityDTO {
  targetId: string;
  slug: string;
  name: string;
  avatarUrl?: string | null;
}

// ── Public read (GET /landing/features) ─────────────────────────────────────
export interface LandingMemberFeatureDTO {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  avatarUrl: string | null;
  quote: string;
  /** The member's own public profile tags, surfaced so the homepage spotlight
   *  mirrors the richer profile-preview card. */
  tags: string[];
}

/** A single roster face on a featured-community card — the owner ("kept by") or
 *  a member. Name (for the initials fallback) + a resolved avatar URL. */
export interface LandingCommunityFaceDTO {
  name: string;
  avatarUrl: string | null;
}

export interface LandingCommunityFeatureDTO {
  id: string;
  slug: string;
  name: string;
  memberCount: number;
  blurb: string | null;
  /** Resolved cover image, or null → the card shows a tinted placeholder. */
  coverImageUrl: string | null;
  /** The 6-value community `type`, shown as the card's category badge. */
  category: CommunityType;
  /** Access level → an "open / request / private" chip. */
  accessTier: AccessTier;
  /** Year the community was created → "since ‹year›". */
  foundedYear: number;
  /** The community's `features` slugs → the card's "what you get" chips. */
  features: string[];
  /** The owner, rendered as "kept by ‹name›". */
  owner: LandingCommunityFaceDTO | null;
  /** Capped member avatars for the roster strip. Empty when the community hides
   *  its roster — the card then leans on `memberCount` alone. */
  faces: LandingCommunityFaceDTO[];
}

export interface LandingChangemakerFeatureDTO {
  id: string;
  slug: string;
  name: string;
  cause: string;
  blurb: string;
  tags: string[];
}

export interface LandingFeaturesResponseDTO {
  members: LandingMemberFeatureDTO[];
  communities: LandingCommunityFeatureDTO[];
  changemakers: LandingChangemakerFeatureDTO[];
}

export const getLandingFeaturesPublic = () =>
  apiGet<LandingFeaturesResponseDTO>("/landing/features");

// ── Admin CRUD (GET/POST/PATCH/DELETE /admin/landing/features) ──────────────
export const getAdminLandingFeatures = (section: LandingSection) =>
  apiGet<AdminLandingFeatureDTO[]>(`/admin/landing/features?section=${section}`);

export const getAdminLandingEligible = (section: LandingSection, search: string) =>
  apiGet<AdminEligibleEntityDTO[]>(
    `/admin/landing/eligible?section=${section}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`,
  );

export const createLandingFeature = (body: {
  section: LandingSection;
  targetId: string;
  copy: Record<string, unknown>;
}) => apiPost<AdminLandingFeatureDTO>("/admin/landing/features", body);

export const updateLandingFeature = (
  id: string,
  body: { copy?: Record<string, unknown>; active?: boolean },
) => apiPatch<AdminLandingFeatureDTO>(`/admin/landing/features/${id}`, body);

export const reorderLandingFeatures = (body: {
  section: LandingSection;
  orderedIds: string[];
}) => apiPatch<AdminLandingFeatureDTO[]>("/admin/landing/features/reorder", body);

export const deleteLandingFeature = (id: string) =>
  apiDelete<void>(`/admin/landing/features/${id}`);
