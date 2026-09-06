import { apiGet, apiPatch } from "../../../shared/api/client";

/**
 * The generalised intake console (`/admin/intakes`, admin-only). Every generic
 * intake form on the platform files into one table through `POST /intakes/:kind`
 * and, before ACQ-03, exactly one kind (`governance_concern`) had a reader.
 * This module is the wire shape for the whole table: the twelve kinds, the five
 * triage states, and the schema-less `payload` each form wrote.
 *
 * `adminConcerns.api.ts` stays the governance-concern view of the same endpoint:
 * a concern is confidential and carries its own richer worklist, so it keeps its
 * dedicated page and its own typed shape. This module deliberately does NOT
 * unpack the payload — the console reads it field by field at render time
 * (`AdminIntakePayload.tsx`), because a payload written by an older version of a
 * form can hold anything.
 */

/** Every kind `POST /intakes/:kind` accepts, in the order the console lists them. */
export const ADMIN_INTAKE_KINDS = [
  "grant",
  "suggest_edit",
  "sober_host",
  "panel_signup",
  "incubator_cohort",
  "incubator_mentor",
  "incubator_session",
  "culture_suggest_pick",
  "culture_post_project",
  "culture_submit_work",
  "culture_submit_playlist",
  // PRD-249. A landlord's request to answer a recommendation written about
  // them. Listed before the confidential concern, with the rest of the kinds
  // an admin actually works here.
  "landlord_reply_request",
  "governance_concern",
] as const;

export type AdminIntakeKind = (typeof ADMIN_INTAKE_KINDS)[number];

/**
 * The one kind the console shows but never triages. A governance concern is
 * confidential and has its own worklist on `/admin/concerns`; here it renders as
 * a stub row that says something arrived and links across, so the "everything
 * waiting" view can still answer "is anything waiting for a human today"
 * without reprinting what somebody reported.
 */
export const CONFIDENTIAL_INTAKE_KIND: AdminIntakeKind = "governance_concern";

/** Triage lifecycle of an intake row. A fresh submission is `new`. */
export type AdminIntakeStatus =
  "new" | "reviewed" | "reviewing" | "resolved" | "dismissed";

/** The states an admin can move a row into. The backend rejects `new` as a
 *  manual target, so it is absent here too. */
export type AdminIntakeTriageStatus = Exclude<AdminIntakeStatus, "new">;

export const ADMIN_INTAKE_STATUSES: readonly AdminIntakeStatus[] = [
  "new",
  "reviewed",
  "reviewing",
  "resolved",
  "dismissed",
];

/** A signed-in submitter resolved to display fields, so the row shows who sent
 *  it and links to their profile rather than printing a bare id. */
export interface AdminIntakeSubmitter {
  slug: string;
  name: string;
  avatarUrl: string | null;
}

/** The admin who last moved the row. Null on rows triaged before ACQ-03 shipped
 *  (the migration backfilled nothing), which the console renders honestly as
 *  "no recorded reviewer" rather than inventing an attribution. */
export interface AdminIntakeReviewer {
  id: string;
  name: string;
}

export interface AdminIntakeDTO {
  id: string;
  /** Kept as a plain string: a row written by a kind this build has never heard
   *  of must still render, so the console falls back to the raw value. */
  kind: string;
  submitterId: string | null;
  submitter: AdminIntakeSubmitter | null;
  /** The form's fields verbatim. Schema-less by design — read defensively. */
  payload: Record<string, unknown>;
  status: AdminIntakeStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: AdminIntakeReviewer | null;
}

export interface AdminIntakeListDTO {
  items: AdminIntakeDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** True when `value` is one of the kinds this build knows how to label. */
export function isKnownIntakeKind(value: string): value is AdminIntakeKind {
  return (ADMIN_INTAKE_KINDS as readonly string[]).includes(value);
}

/** Normalise a wire row: an unrecognised status degrades to `new` (a row still
 *  waiting) rather than leaking through untyped. */
function toAdminIntake(row: AdminIntakeDTO): AdminIntakeDTO {
  const status = ADMIN_INTAKE_STATUSES.includes(row.status)
    ? row.status
    : "new";
  return {
    ...row,
    status,
    payload: row.payload && typeof row.payload === "object" ? row.payload : {},
    submitter: row.submitter ?? null,
    reviewedAt: row.reviewedAt ?? null,
    reviewedBy: row.reviewedBy ?? null,
  };
}

/** Paginated intake list, optionally narrowed to one kind and/or one status
 *  (both server-side). Page size is a server constant. */
export const getAdminIntakes = async (parameters: {
  page?: number;
  kind?: AdminIntakeKind;
  status?: AdminIntakeStatus;
}): Promise<AdminIntakeListDTO> => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.kind) searchParams.set("kind", parameters.kind);
  if (parameters.status) searchParams.set("status", parameters.status);
  const query = searchParams.toString();
  const list = await apiGet<AdminIntakeListDTO>(
    query ? `/intakes?${query}` : "/intakes",
  );
  return { ...list, items: list.items.map(toAdminIntake) };
};

/** Move one intake row into a triage state. Echoes the updated row. */
export const updateIntakeStatus = async (
  id: string,
  status: AdminIntakeTriageStatus,
): Promise<AdminIntakeDTO> =>
  toAdminIntake(await apiPatch<AdminIntakeDTO>(`/intakes/${id}`, { status }));
