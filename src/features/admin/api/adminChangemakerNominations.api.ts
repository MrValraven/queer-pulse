import { apiGet, apiPatch } from "../../../shared/api/client";

/**
 * Admin oversight of changemaker nominations
 * (`/admin/changemaker-nominations`, admin-only). Lists every "Nominate them" a
 * member has submitted for the Change Makers directory — who nominated whom — so
 * staff can review the pipeline, plus (COM-17) triage: approve or dismiss a
 * pending nomination, which notifies the nominator. The backend scopes this
 * to admins and 403s otherwise; this file only owns the wire shape.
 */

export interface AdminPersonDTO {
  slug: string;
  name: string;
  avatarUrl?: string | null;
}

export type AdminChangemakerNominationStatus =
  "pending" | "approved" | "dismissed";

export interface AdminChangemakerNominationDTO {
  id: string;
  /** The member who submitted the nomination (null if their profile is gone). */
  nominator: AdminPersonDTO | null;
  /** The free-text name the member put forward. */
  nomineeName: string;
  /** The nominator's own words on why (COM-16) — null for nominations
   *  submitted before this field existed. */
  reason: string | null;
  /** Triage state (COM-17) — 'pending' until an admin approves or dismisses it. */
  status: AdminChangemakerNominationStatus;
  reviewer: AdminPersonDTO | null;
  reviewNote: string | null;
  reviewedAt: string | null;
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
  status?: AdminChangemakerNominationStatus;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  const querySuffix = searchParams.toString();
  return apiGet<AdminChangemakerNominationListDTO>(
    `/admin/changemaker-nominations${querySuffix ? `?${querySuffix}` : ""}`,
  );
};

/** `PATCH /admin/changemaker-nominations/:id` — approve or dismiss a pending
 *  nomination (COM-17). 409s if it's already been triaged. */
export const triageChangemakerNomination = (
  id: string,
  dto: { status: "approved" | "dismissed"; reviewNote?: string },
) =>
  apiPatch<AdminChangemakerNominationDTO>(
    `/admin/changemaker-nominations/${id}`,
    dto,
  );
