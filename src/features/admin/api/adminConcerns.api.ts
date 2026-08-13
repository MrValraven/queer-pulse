import { apiGet, apiPatch } from "../../../shared/api/client";
import type { ConcernCategory } from "../../governance/api/governance.api";

/**
 * Admin oversight of governance concerns (`/admin/concerns`, admin-only). Every
 * "Submit a concern" a visitor or member sent through the public governance form
 * lands here so staff have real visibility on reported issues and can triage
 * them. The submissions are stored through the generic intake pipeline as the
 * `governance_concern` kind; this file owns the wire shape and unpacks the
 * intake `payload` into the concern's typed fields.
 *
 * The backend scopes both routes to admins (403s otherwise); the frontend also
 * gates the route in authGate.ts.
 */

export type { ConcernCategory };

/** Triage lifecycle of a concern. A fresh submission is `new` until staff act. */
export type ConcernStatus = "new" | "reviewing" | "resolved" | "dismissed";

/** The forward triage actions an admin can take from the dashboard. */
export type ConcernTriageStatus = Exclude<ConcernStatus, "new">;

/** A signed-in submitter resolved to display fields (name/avatar/profile slug),
 *  so the dashboard shows who raised it rather than a bare id. */
export interface AdminConcernSubmitter {
  slug: string;
  name: string;
  avatarUrl: string | null;
}

export interface AdminConcernDTO {
  id: string;
  category: ConcernCategory;
  /** What the submitter described (free text). */
  description: string;
  /** Follow-up email — present only for logged-out submitters, else null. */
  email: string | null;
  /** The signed-in member who sent it, resolved to name/avatar/slug. Null when
   *  the submission was anonymous (logged-out) or the profile is gone. */
  submitter: AdminConcernSubmitter | null;
  status: ConcernStatus;
  createdAt: string;
}

export interface AdminConcernListDTO {
  items: AdminConcernDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** Raw intake row as the generic `/intakes` endpoint returns it. */
interface IntakeSubmissionWireDTO {
  id: string;
  kind: string;
  submitterId: string | null;
  submitter: AdminConcernSubmitter | null;
  payload: Record<string, unknown>;
  status: string;
  createdAt: string;
}

interface IntakeListWireDTO {
  items: IntakeSubmissionWireDTO[];
  total: number;
  page: number;
  pageSize: number;
}

const CONCERN_CATEGORIES: readonly ConcernCategory[] = [
  "member",
  "gathering",
  "content",
  "appeal",
  "other",
];

const CONCERN_STATUSES: readonly ConcernStatus[] = [
  "new",
  "reviewing",
  "resolved",
  "dismissed",
];

/** String field from an intake payload, or "" when absent/mis-typed. */
const payloadString = (
  payload: Record<string, unknown>,
  key: string,
): string => {
  const value = payload[key];
  return typeof value === "string" ? value : "";
};

/** Map one generic intake row into the typed concern shape. Unknown category /
 *  status values (a hand-edited row, a legacy status) fall back to a safe
 *  default rather than leaking through untyped. */
const toAdminConcern = (row: IntakeSubmissionWireDTO): AdminConcernDTO => {
  const category = payloadString(row.payload, "category") as ConcernCategory;
  const email = payloadString(row.payload, "email");
  const status = row.status as ConcernStatus;
  return {
    id: row.id,
    category: CONCERN_CATEGORIES.includes(category) ? category : "other",
    description: payloadString(row.payload, "description"),
    email: email.trim() ? email : null,
    submitter: row.submitter ?? null,
    status: CONCERN_STATUSES.includes(status) ? status : "new",
    createdAt: row.createdAt,
  };
};

/** Paginated concern list, optionally filtered by status (server-side). */
export const getAdminConcerns = async (parameters: {
  page?: number;
  status?: ConcernStatus;
}): Promise<AdminConcernListDTO> => {
  const searchParams = new URLSearchParams({ kind: "governance_concern" });
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  const list = await apiGet<IntakeListWireDTO>(
    `/intakes?${searchParams.toString()}`,
  );
  return {
    items: list.items.map(toAdminConcern),
    total: list.total,
    page: list.page,
    pageSize: list.pageSize,
  };
};

/** Move a concern into a triage state (admin). Echoes the updated concern. */
export const updateConcernStatus = async (
  id: string,
  status: ConcernTriageStatus,
): Promise<AdminConcernDTO> => {
  const row = await apiPatch<IntakeSubmissionWireDTO>(`/intakes/${id}`, {
    status,
  });
  return toAdminConcern(row);
};
