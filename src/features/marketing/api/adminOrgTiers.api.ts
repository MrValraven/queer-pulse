import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type { OrgTierCtaType } from "./orgTiers.api";

/** Admin view of a tier — the public shape plus publish/order metadata. */
export interface OrgTierAdminDTO {
  id: string;
  slug: string;
  name: string;
  priceDisplay: string;
  pricePeriod: string;
  dek: string;
  bullets: string[];
  footnote: string;
  ctaType: OrgTierCtaType;
  ctaLabel: string;
  ctaTarget: string | null;
  featured: boolean;
  sortOrder: number;
  published: boolean;
}

export interface OrgTierWriteBody {
  name: string;
  priceDisplay: string;
  pricePeriod: string;
  dek: string;
  bullets?: string[];
  footnote: string;
  ctaType: OrgTierCtaType;
  ctaLabel: string;
  ctaTarget?: string | null;
  featured?: boolean;
  sortOrder?: number;
  published?: boolean;
}

/** Every tier, published or not. Admin-only — 403s otherwise. */
export const getAdminOrgTiers = () =>
  apiGet<OrgTierAdminDTO[]>("/admin/org-tiers");

export const createOrgTier = (body: OrgTierWriteBody) =>
  apiPost<OrgTierAdminDTO>("/admin/org-tiers", body);

export const updateOrgTier = (id: string, body: Partial<OrgTierWriteBody>) =>
  apiPatch<OrgTierAdminDTO>(`/admin/org-tiers/${id}`, body);

export const deleteOrgTier = (id: string) =>
  apiDelete<void>(`/admin/org-tiers/${id}`);
