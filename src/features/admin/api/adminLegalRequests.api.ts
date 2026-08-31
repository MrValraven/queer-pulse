import {
  ApiError,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type { Paginated } from "../../../shared/api/refs";

/**
 * The register of legal, government and law-enforcement demands for member data
 * (`/admin/legal-requests`, PRD-32).
 *
 * ADMIN ONLY. `AdminLegalRequestsController` carries `@Roles(Admin)` alone,
 * where the neighbouring staff queues take `Moderator, Admin`: every row names a
 * state body, a jurisdiction and a number of members it came for, and the
 * moderation rota is a much wider group than the people who should read a police
 * file. The route is gated to the same tier in `app/authGate.ts` and the nav
 * entry is hidden from moderators, so nobody is offered a link that bounces.
 *
 * THERE IS NO DELETE, and that is deliberate. A register of state demands that
 * can be quietly emptied is worth less than no register, because its silence is
 * still published as a zero. `POST :id/void` is the only removal, it requires a
 * written reason, it keeps the row, and it is refused with a 409 on a record
 * that is already struck.
 *
 * The backend serves NO label text for any of these vocabularies. Every value
 * below is a stable identifier, and the catalogue owns the words
 * (`admin:legalRequests.type.*`, `.outcome.*`, `.dataCategory.*`).
 */

/** What kind of demand arrived. Mirrors `LegalRequestType` in
 *  `queerpulse-backend/src/legal-requests/legal-request-vocabulary.ts`, in the
 *  backend's own fixed render order so two periods list their rows alike. */
export const LEGAL_REQUEST_TYPES = [
  "subpoena",
  "court_order",
  "police_request",
  "emergency_disclosure_request",
  "preservation_request",
  "takedown_demand",
  "other",
] as const;

export type LegalRequestType = (typeof LEGAL_REQUEST_TYPES)[number];

/** What QueerPulse did about it, worst case for the member first. `narrowed` is
 *  separate from `complied_in_part` on purpose: it says the demand was pushed
 *  back on and shrunk before anything was handed over. */
export const LEGAL_REQUEST_OUTCOMES = [
  "complied_in_full",
  "complied_in_part",
  "narrowed",
  "refused",
  "withdrawn",
  "pending",
] as const;

export type LegalRequestOutcome = (typeof LEGAL_REQUEST_OUTCOMES)[number];

/** The outcomes under which member data actually left the platform. A record
 *  with one of these, affected accounts, and nobody notified has to say why the
 *  members were not told. */
export const DISCLOSING_LEGAL_REQUEST_OUTCOMES: readonly LegalRequestOutcome[] =
  ["complied_in_full", "complied_in_part", "narrowed"];

/** The categories a disclosure can consist of. A closed key set, so "what did
 *  they actually hand over" stays a fact the register can be queried on years
 *  later. An empty array is a real and common answer: nothing was disclosed. */
export const LEGAL_REQUEST_DATA_CATEGORIES = [
  "account_identifiers",
  "contact_details",
  "account_metadata",
  "connection_logs",
  "profile_content",
  "posts_and_comments",
  "private_messages",
  "uploaded_media",
  "membership_records",
  "other",
] as const;

export type LegalRequestDataCategory =
  (typeof LEGAL_REQUEST_DATA_CATEGORIES)[number];

/** Which slice of the register to list. `all` is the backend default: a voided
 *  record is still part of the register's history. */
export const LEGAL_REQUEST_REGISTER_STATES = [
  "all",
  "active",
  "voided",
] as const;

export type LegalRequestRegisterState =
  (typeof LEGAL_REQUEST_REGISTER_STATES)[number];

/** Server-side write limits, mirrored so the form can stop a value before it is
 *  sent rather than after a 400 comes back. */
export const MAX_REQUESTING_BODY_LENGTH = 200;
export const MAX_JURISDICTION_LENGTH = 120;
export const MAX_LEGAL_REQUEST_TEXT_LENGTH = 4000;
export const MAX_ACCOUNTS_PER_LEGAL_REQUEST = 100000;

/**
 * One register row as staff read it. Mirrors `AdminLegalRequestDTO`
 * (`legal-request-response.ts`), which is an allowlist hand-mapped from the
 * entity: `recordedByUserId` and `voidedByUserId` stay server-side, and
 * `isVoided` is added.
 *
 * Nothing here reaches the public Transparency Report. That report publishes
 * counts over this table and no field of this shape.
 */
export interface AdminLegalRequestDTO {
  id: string;
  requestingBody: string;
  jurisdiction: string;
  requestType: LegalRequestType;
  /** `YYYY-MM-DD`. */
  receivedOn: string;
  accountsAffected: number;
  outcome: LegalRequestOutcome;
  dataDisclosed: LegalRequestDataCategory[];
  /** `YYYY-MM-DD`, or null while the named members have not been told. */
  memberNotifiedOn: string | null;
  accountsNotified: number;
  notificationWithheldReason: string | null;
  isUnderGagOrder: boolean;
  internalNote: string | null;
  /** Write-time snapshot of the recording admin's display name. Null on a row
   *  whose author has since erased their account. */
  recordedByName: string | null;
  /** True once the record has been struck. A voided row is still listed and
   *  still readable: it is dropped from the published figures, never from the
   *  register. */
  isVoided: boolean;
  voidedAt: string | null;
  voidReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AdminLegalRequestPageDTO = Paginated<AdminLegalRequestDTO>;

export interface ListLegalRequestsParams {
  page?: number;
  state?: LegalRequestRegisterState;
  requestType?: LegalRequestType;
  outcome?: LegalRequestOutcome;
}

/** GET /admin/legal-requests. Newest receipt first, 20 to a page. */
export function getAdminLegalRequests(
  parameters: ListLegalRequestsParams,
): Promise<AdminLegalRequestPageDTO> {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.state) searchParams.set("state", parameters.state);
  if (parameters.requestType) {
    searchParams.set("requestType", parameters.requestType);
  }
  if (parameters.outcome) searchParams.set("outcome", parameters.outcome);
  const querySuffix = searchParams.toString();
  return apiGet<AdminLegalRequestPageDTO>(
    `/admin/legal-requests${querySuffix ? `?${querySuffix}` : ""}`,
  );
}

/** GET /admin/legal-requests/:id. One recorded demand in full. */
export function getAdminLegalRequest(
  id: string,
): Promise<AdminLegalRequestDTO> {
  return apiGet<AdminLegalRequestDTO>(`/admin/legal-requests/${id}`);
}

/**
 * Body for `POST /admin/legal-requests`. `outcome` may be left off and defaults
 * to `pending` at the column, so a demand can be recorded the hour it arrives
 * and answered later. That is the intended flow.
 */
export interface CreateLegalRequestBody {
  requestingBody: string;
  jurisdiction: string;
  requestType: LegalRequestType;
  receivedOn: string;
  accountsAffected: number;
  outcome: LegalRequestOutcome;
  dataDisclosed: LegalRequestDataCategory[];
  memberNotifiedOn: string | null;
  accountsNotified: number;
  notificationWithheldReason: string | null;
  isUnderGagOrder: boolean;
  internalNote: string | null;
}

/** Body for `PATCH /admin/legal-requests/:id`. Every key is optional and an
 *  explicit `null` CLEARS a nullable field; the editor sends the whole record
 *  so the shape it validated is exactly the shape the server merges. */
export type UpdateLegalRequestBody = Partial<CreateLegalRequestBody>;

export function createLegalRequest(
  body: CreateLegalRequestBody,
): Promise<AdminLegalRequestDTO> {
  return apiPost<AdminLegalRequestDTO>("/admin/legal-requests", body);
}

/** PATCH /admin/legal-requests/:id. 409 when the record has been voided, which
 *  freezes it against every further amendment. */
export function updateLegalRequest(
  id: string,
  body: UpdateLegalRequestBody,
): Promise<AdminLegalRequestDTO> {
  return apiPatch<AdminLegalRequestDTO>(`/admin/legal-requests/${id}`, body);
}

/** POST /admin/legal-requests/:id/void. The reason is required, the row stays,
 *  and re-voiding is a 409 rather than a second stamp. */
export function voidLegalRequest(
  id: string,
  reason: string,
): Promise<AdminLegalRequestDTO> {
  return apiPost<AdminLegalRequestDTO>(`/admin/legal-requests/${id}/void`, {
    reason,
  });
}

/** True when the backend refused a write because the record had already been
 *  struck. A conflict, never a fault, and worth its own wording. */
export function isLegalRequestConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}
