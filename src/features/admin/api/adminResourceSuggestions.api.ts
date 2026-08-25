import { apiGet, apiPost } from "../../../shared/api/client";

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

export const approveResourceSuggestion = (id: string, note?: string) =>
  apiPost<AdminResourceSuggestionDTO>(
    `/admin/resource-suggestions/${id}/approve`,
    decisionBody(note),
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
