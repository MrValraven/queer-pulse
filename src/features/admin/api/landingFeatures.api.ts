import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";

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
}

export interface LandingCommunityFeatureDTO {
  id: string;
  slug: string;
  name: string;
  memberCount: number;
  blurb: string | null;
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
