import { apiGet } from "../../../shared/api/client";

/**
 * Admin oversight of Commission Board interest (`/admin/commission-interests`,
 * admin-only). Lists every "express interest" a member has sent — who they are,
 * which commission and category, who they were reaching out to, and their
 * optional note — so staff can follow up. The backend scopes this to admins and
 * 403s otherwise; this file only owns the wire shape.
 */

export type CommissionCategory =
  "Photo" | "Music" | "Writing" | "Design" | "Film";

export interface AdminPersonDTO {
  slug: string;
  name: string;
  avatarUrl?: string | null;
}

export interface AdminCommissionInterestDTO {
  id: string;
  /** The member who expressed interest (null if their profile is gone). */
  member: AdminPersonDTO | null;
  commissionTitle: string;
  commissionCategory: CommissionCategory;
  /** Who the member was reaching out to, denormalized at submission time. */
  recipientName: string;
  /** The optional "Your message" note, if any. */
  message: string | null;
  createdAt: string;
}

export interface AdminCommissionInterestListDTO {
  items: AdminCommissionInterestDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** Paginated commission-interest list, optionally filtered by category. */
export const getAdminCommissionInterests = (parameters: {
  page?: number;
  category?: CommissionCategory;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.category) searchParams.set("category", parameters.category);
  const querySuffix = searchParams.toString();
  return apiGet<AdminCommissionInterestListDTO>(
    `/admin/commission-interests${querySuffix ? `?${querySuffix}` : ""}`,
  );
};
