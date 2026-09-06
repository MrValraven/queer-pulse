import { apiGet, apiPost } from "../../../shared/api/client";
import type { ResourceListingWriteBody } from "./adminResourceListings.api";

export type { ResourceListingWriteBody };

export type ResourceListingCategory = "legal_aid" | "sexual_health_testing";
export type ResourceSuggestionStatus =
  "pending" | "approved" | "declined" | "archived";

export interface AdminPersonDTO {
  slug: string;
  name: string;
  avatarUrl?: string | null;
}

export interface AdminResourceSuggestionDTO {
  id: string;
  member: AdminPersonDTO | null;
  category: ResourceListingCategory;
  name: string;
  description: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  createdAt: string;
  status: ResourceSuggestionStatus;
  decidedAt: string | null;
  decisionNote: string | null;
  /**
   * The directory listing this suggestion's approval published (PRD-269), or
   * null for everything else. The console reads it to show that a row is
   * already live and to keep the approve action off it, which is the same
   * fact the backend's 409 on a second approve states.
   */
  createdListingId: string | null;
}

export interface AdminResourceSuggestionListDTO {
  items: AdminResourceSuggestionDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export const getAdminResourceSuggestions = (parameters: {
  page?: number;
  category?: ResourceListingCategory;
  status?: ResourceSuggestionStatus;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.category) searchParams.set("category", parameters.category);
  if (parameters.status) searchParams.set("status", parameters.status);
  const querySuffix = searchParams.toString();
  return apiGet<AdminResourceSuggestionListDTO>(
    `/admin/resource-suggestions${querySuffix ? `?${querySuffix}` : ""}`,
  );
};

export type ResourceSuggestionDecision = "approve" | "decline" | "archive";

const decisionBody = (note?: string) =>
  note && note.trim() ? { note: note.trim() } : {};

/**
 * Approve, and publish (PRD-269).
 *
 * `listing` is REQUIRED by the endpoint, and that is the point: approving now
 * creates the public directory row in the same transaction as the decision, so
 * the reviewer confirms or corrects every field of it first. The suggestion
 * cannot supply a `region` at all, and its contact fields are all optional
 * where a listing needs at least one, so the missing pieces come from the
 * person who checked the organisation rather than from a default.
 */
export const approveResourceSuggestion = (
  id: string,
  listing: ResourceListingWriteBody,
  note?: string,
) =>
  apiPost<AdminResourceSuggestionDTO>(
    `/admin/resource-suggestions/${id}/approve`,
    { ...decisionBody(note), listing },
  );

export const declineResourceSuggestion = (id: string, note?: string) =>
  apiPost<AdminResourceSuggestionDTO>(
    `/admin/resource-suggestions/${id}/decline`,
    decisionBody(note),
  );

export const archiveResourceSuggestion = (id: string, note?: string) =>
  apiPost<AdminResourceSuggestionDTO>(
    `/admin/resource-suggestions/${id}/archive`,
    decisionBody(note),
  );
