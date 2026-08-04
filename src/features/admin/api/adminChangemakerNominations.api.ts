import { apiGet } from "../../../shared/api/client";

/**
 * Admin oversight of changemaker nominations
 * (`/admin/changemaker-nominations`, admin-only). Lists every "Nominate them" a
 * member has submitted for the Change Makers directory — who nominated whom — so
 * staff can review the pipeline. The backend scopes this to admins and 403s
 * otherwise; this file only owns the wire shape.
 */

export interface AdminPersonDTO {
  slug: string;
  name: string;
  avatarUrl?: string | null;
}

export interface AdminChangemakerNominationDTO {
  id: string;
  /** The member who submitted the nomination (null if their profile is gone). */
  nominator: AdminPersonDTO | null;
  /** The free-text name the member put forward. */
  nomineeName: string;
  createdAt: string;
}

export interface AdminChangemakerNominationListDTO {
  items: AdminChangemakerNominationDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** Paginated changemaker-nomination list for the admin panel. */
export const getAdminChangemakerNominations = (parameters: {
  page?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  const querySuffix = searchParams.toString();
  return apiGet<AdminChangemakerNominationListDTO>(
    `/admin/changemaker-nominations${querySuffix ? `?${querySuffix}` : ""}`,
  );
};
