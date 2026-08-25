import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";

export type ResourceListingCategory = "legal_aid" | "sexual_health_testing";
export type ResourceListingStatus = "active" | "archived";

export interface AdminResourceListingDTO {
  id: string;
  category: ResourceListingCategory;
  title: string;
  description: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  region: string | null;
  status: ResourceListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceListingWriteBody {
  category: ResourceListingCategory;
  title: string;
  description: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  region?: string | null;
  status?: ResourceListingStatus;
}

/** Every listing, active or archived. Admin-only — 403s otherwise. */
export const getAdminResourceListings = (
  category?: ResourceListingCategory,
) => {
  const q = new URLSearchParams();
  if (category) q.set("category", category);
  const qs = q.toString();
  return apiGet<AdminResourceListingDTO[]>(
    `/admin/resource-listings${qs ? `?${qs}` : ""}`,
  );
};

export const createResourceListing = (body: ResourceListingWriteBody) =>
  apiPost<AdminResourceListingDTO>("/admin/resource-listings", body);

export const updateResourceListing = (
  id: string,
  body: Partial<ResourceListingWriteBody>,
) => apiPatch<AdminResourceListingDTO>(`/admin/resource-listings/${id}`, body);

export const deleteResourceListing = (id: string) =>
  apiDelete<void>(`/admin/resource-listings/${id}`);
