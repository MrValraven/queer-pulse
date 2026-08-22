import {
  apiGetNullable,
  apiPost,
  apiDelete,
} from "../../../shared/api/client";

// ── Employer affiliation ─────────────────────────────────────────────────────
// Which company the current member is authorised to post jobs for. A member has
// at most one affiliation; it starts `pending` while the platform confirms the
// employer relationship, then flips to `active`. Backs EmployerAffiliationProvider.

export interface EmployerAffiliationDTO {
  companySlug: string;
  company: { nameText: string };
  role: string;
  status: "pending" | "active";
}

// ── Raw calls (one per endpoint) ─────────────────────────────────────────────

/** GET /me/affiliation — the viewer's employer affiliation, or null if none. */
export const getAffiliation = () =>
  apiGetNullable<EmployerAffiliationDTO>("/me/affiliation");

/** POST /me/affiliation — request affiliation with a company. */
export const postAffiliation = (body: { companySlug: string; role: string }) =>
  apiPost<EmployerAffiliationDTO>("/me/affiliation", body);

/** DELETE /me/affiliation — drop the current affiliation. */
export const deleteAffiliation = () => apiDelete<void>("/me/affiliation");
