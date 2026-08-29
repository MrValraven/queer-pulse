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
  /**
   * The member who submitted the nomination.
   *
   * ABSENT (not null) when the reader holds the `partnerships` staff grant
   * without the Moderator/Admin tier: a nomination is a private submission
   * about a third party who never opted in, so the pairing of the two names
   * stays with platform staff. `null` is the different case where the
   * nominator's account is gone. The UI must say something different for each.
   */
  nominator?: AdminPersonDTO | null;
  /** The free-text name the member put forward. */
  nomineeName: string;
  /**
   * The nominee's own member profile, when the nominator picked them out of
   * the form's member search (COM-18). `null` when they aren't a member here,
   * or when the account behind the stored link is gone. ABSENT for a
   * `partnerships` grant holder, on the same rule as `nominator`.
   */
  nominee?: AdminPersonDTO | null;
  /** Where else to find the nominee, in the nominator's own words (COM-18) —
   *  a handle, a link, an email. ABSENT on the same rule as `nominator`. */
  nomineeContact?: string | null;
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
