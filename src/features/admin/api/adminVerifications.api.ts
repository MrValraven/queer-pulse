import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type {
  VerificationLevel,
  VerificationRequestStatus,
  VerificationType,
} from "../../economy/api/verification.api";

/**
 * Admin verification review (`/admin/verifications`, moderator/admin-only).
 * Carries only the member ref, the level, its provenance, and the opaque
 * provider ref — never any document/biometric data, because none is stored.
 */
export interface AdminVerificationDTO {
  userId: string;
  member: MemberRefDTO | null;
  level: VerificationLevel;
  method: string | null;
  provider: string | null;
  providerRef: string | null;
  verifiedAt: string | null;
  updatedAt: string;
}

/** Every level, low to high — mirrors the backend's `VERIFICATION_LEVEL_ORDER`. */
export const VERIFICATION_LEVELS: readonly VerificationLevel[] = [
  "none",
  "email",
  "phone",
  "id_verified",
];

/** The level tab filter, plus the synthetic `"all"` tab. */
export type VerificationLevelFilter = VerificationLevel | "all";

/** Sort orders the admin list accepts — mirrors the backend's
 *  `ADMIN_VERIFICATION_SORTS` (`recent`/`oldest` order by `updatedAt`,
 *  `level` orders by ladder rank, highest assurance first). */
export type VerificationSort = "recent" | "oldest" | "level";

/** The append-only audit action recorded on a member's verification history.
 *  Mirrors the backend's `VerificationEventAction` enum values. */
export type VerificationEventAction =
  | "submitted"
  | "approved"
  | "rejected"
  | "overridden"
  | "downgraded"
  | "appealed"
  | "withdrawn";

/** One row of a member's append-only audit trail, for the admin drawer's
 *  history panel. `actor` is the moderator/admin who performed the action —
 *  `null` for a system-attributed or member-earned event. Mirrors the
 *  backend's `VerificationEventDTO`. */
export interface VerificationEventDTO {
  id: string;
  action: VerificationEventAction;
  fromLevel: VerificationLevel | null;
  toLevel: VerificationLevel | null;
  reason: string | null;
  actor: MemberRefDTO | null;
  createdAt: string;
}

/** Per-level tab counts, scoped by the active `q` search but NOT by `level`
 *  — this is the axis the four counted tabs vary across. Mirrors the
 *  backend's `Record<VerificationLevel, number>`. */
export type VerificationCounts = Record<VerificationLevel, number>;

/** `GET /admin/verifications` response — a page of rows, the per-level tab
 *  counts, and an opaque keyset cursor for "load more". Mirrors the
 *  backend's `AdminVerificationListDTO`. */
export interface AdminVerificationListDTO {
  rows: AdminVerificationDTO[];
  counts: VerificationCounts;
  nextCursor: string | null;
}

/** Zero-filled counts, for a defensive fallback when a payload omits (or
 *  only partly carries) `counts`. */
function zeroVerificationCounts(): VerificationCounts {
  return {
    none: 0,
    email: 0,
    phone: 0,
    id_verified: 0,
  };
}

/** Hand-maps a raw `GET /admin/verifications` payload to the typed DTO,
 *  defaulting any field the server omits rather than trusting the wire
 *  shape blindly. */
function toAdminVerificationListDTO(
  raw: Partial<AdminVerificationListDTO> | null | undefined,
): AdminVerificationListDTO {
  return {
    rows: raw?.rows ?? [],
    counts: { ...zeroVerificationCounts(), ...raw?.counts },
    nextCursor: raw?.nextCursor ?? null,
  };
}

export interface GetAdminVerificationsFilter {
  level?: VerificationLevelFilter;
  query?: string;
  sort?: VerificationSort;
  cursor?: string;
}

/** The moderation queue for the manual/stub verification path, filterable by
 *  level, free-text search, and sort, with keyset pagination via `cursor`.
 *  Moderator/Admin only. */
export async function getAdminVerifications(
  filter: GetAdminVerificationsFilter = {},
): Promise<AdminVerificationListDTO> {
  const { level, query, sort, cursor } = filter;
  const searchParams = new URLSearchParams();
  if (level && level !== "all") searchParams.set("level", level);
  if (query) searchParams.set("q", query);
  if (sort) searchParams.set("sort", sort);
  if (cursor) searchParams.set("cursor", cursor);
  const queryString = searchParams.toString();
  const raw = await apiGet<Partial<AdminVerificationListDTO>>(
    `/admin/verifications${queryString ? `?${queryString}` : ""}`,
  );
  return toAdminVerificationListDTO(raw);
}

/** A member's verification audit history, newest first. Moderator/Admin only. */
export async function getVerificationHistory(
  userId: string,
): Promise<VerificationEventDTO[]> {
  const events = await apiGet<VerificationEventDTO[] | null>(
    `/admin/verifications/${userId}/history`,
  );
  return events ?? [];
}

/** Manual override (the stub review path) — grants or revokes a level.
 *  `reason` is required by the backend when lowering a level; the drawer's
 *  reason field maps to the backend's `note` field. Omitting `reason` still
 *  works (the field simply isn't sent). */
export const overrideVerification = (
  userId: string,
  level: VerificationLevel,
  reason?: string,
) =>
  apiPatch<AdminVerificationDTO>(`/admin/verifications/${userId}`, {
    level,
    note: reason,
  });

// --- request lifecycle (Phase 2 review queue) ---

/** Every request status, in the lifecycle order the backend's enum declares —
 *  mirrors the backend's `VerificationRequestStatus`. */
export const VERIFICATION_REQUEST_STATUSES: readonly VerificationRequestStatus[] = [
  "pending",
  "in_review",
  "approved",
  "rejected",
  "appealing",
  "withdrawn",
];

/** The status tab filter, plus the synthetic `"all"` tab. */
export type VerificationRequestStatusFilter = VerificationRequestStatus | "all";

/** Sort orders the admin request queue accepts — mirrors the backend's
 *  `VERIFICATION_REQUEST_SORTS`. Both order by `createdAt` (the submission
 *  date, unlike the level console's `updatedAt`-ordered `VerificationSort`). */
export type VerificationRequestSort = "recent" | "oldest";

/**
 * Anti-fraud signals snapshotted onto a request at submit time and refreshed
 * at decision time — the evidence a reviewer sees alongside the request.
 * Mirrors the backend's `VerificationSignalsDTO`.
 *
 * DEFERRED (computed nowhere yet): phone/VOIP-carrier and IP/geo signals —
 * see the backend type's own doc comment for why. `duplicateProviderRef` is
 * the only cross-account signal available today.
 */
export interface VerificationSignalsDTO {
  /** Whole days since the member's account was created. */
  accountAgeDays: number;
  /** Count of this member's own past requests decided `rejected`. */
  priorRejections: number;
  /** Non-null only when the member's identity-provider session reference is
   *  shared by at least one other account. */
  duplicateProviderRef: { count: number; userIds: string[] } | null;
}

/** Admin request-queue row — `GET /admin/verifications/requests`'s list item.
 *  Carries the member ref but none of the reviewer-only detail (`context`/
 *  `signals`/`decisionReason`/history) — that's the detail DTO below. The one
 *  exception is `hasDuplicateSignal`, a light boolean derived from the row's
 *  own signals snapshot so the queue can flag a duplicate without opening the
 *  drawer. Mirrors the backend's `AdminVerificationRequestDTO`. */
export interface AdminVerificationRequestDTO {
  id: string;
  member: MemberRefDTO | null;
  type: VerificationType;
  requestedLevel: VerificationLevel;
  status: VerificationRequestStatus;
  isAppeal: boolean;
  createdAt: string;
  updatedAt: string;
  hasDuplicateSignal: boolean;
}

/** `GET /admin/verifications/requests/:id` response — the list row's fields
 *  plus everything a reviewer needs to decide: the member's own context and
 *  evidence reference, the prior decision (if any) and who reviewed it, the
 *  anti-fraud `signals` snapshot, and the member's full verification audit
 *  trail. Mirrors the backend's `AdminVerificationRequestDetailDTO`. */
export interface AdminVerificationRequestDetailDTO
  extends AdminVerificationRequestDTO {
  context: string | null;
  evidenceRef: string | null;
  decisionReason: string | null;
  reviewedBy: MemberRefDTO | null;
  signals: VerificationSignalsDTO | null;
  history: VerificationEventDTO[];
}

/** Per-status tab counts, zero-filled over every `VerificationRequestStatus`,
 *  scoped by the active `q`/`type` search but NOT by `status` — the axis the
 *  six counted tabs vary across. Mirrors the backend's
 *  `Record<VerificationRequestStatus, number>`. */
export type VerificationRequestCounts = Record<VerificationRequestStatus, number>;

/** `GET /admin/verifications/requests` response — a page of rows, the
 *  per-status tab counts, and an opaque keyset cursor for "load more". */
export interface AdminVerificationRequestListDTO {
  rows: AdminVerificationRequestDTO[];
  counts: VerificationRequestCounts;
  nextCursor: string | null;
}

/** Zero-filled counts, for a defensive fallback when a payload omits (or only
 *  partly carries) `counts`. */
function zeroVerificationRequestCounts(): VerificationRequestCounts {
  return {
    pending: 0,
    in_review: 0,
    approved: 0,
    rejected: 0,
    appealing: 0,
    withdrawn: 0,
  };
}

/** Hand-maps a raw `GET /admin/verifications/requests` payload to the typed
 *  DTO, defaulting any field the server omits rather than trusting the wire
 *  shape blindly. */
function toAdminVerificationRequestListDTO(
  raw: Partial<AdminVerificationRequestListDTO> | null | undefined,
): AdminVerificationRequestListDTO {
  return {
    rows: raw?.rows ?? [],
    counts: { ...zeroVerificationRequestCounts(), ...raw?.counts },
    nextCursor: raw?.nextCursor ?? null,
  };
}

export interface GetAdminVerificationRequestsFilter {
  status?: VerificationRequestStatusFilter;
  type?: VerificationType;
  query?: string;
  sort?: VerificationRequestSort;
  cursor?: string;
}

/** The manual-review request queue, filterable by status, type, free-text
 *  search, and sort, with keyset pagination via `cursor`. Moderator/Admin
 *  only. */
export async function getAdminVerificationRequests(
  filter: GetAdminVerificationRequestsFilter = {},
): Promise<AdminVerificationRequestListDTO> {
  const { status, type, query, sort, cursor } = filter;
  const searchParams = new URLSearchParams();
  if (status && status !== "all") searchParams.set("status", status);
  if (type) searchParams.set("type", type);
  if (query) searchParams.set("q", query);
  if (sort) searchParams.set("sort", sort);
  if (cursor) searchParams.set("cursor", cursor);
  const queryString = searchParams.toString();
  const raw = await apiGet<Partial<AdminVerificationRequestListDTO>>(
    `/admin/verifications/requests${queryString ? `?${queryString}` : ""}`,
  );
  return toAdminVerificationRequestListDTO(raw);
}

/** A request in full — context, signals, and audit history — for the review
 *  drawer. Moderator/Admin only. */
export const getAdminVerificationRequestDetail = (id: string) =>
  apiGet<AdminVerificationRequestDetailDTO>(
    `/admin/verifications/requests/${id}`,
  );

/** The three moves a moderator can make on a request — mirrors the backend's
 *  `DecideVerificationRequestDto` action union. `reason` is required by the
 *  backend only for `"reject"` (400 without one). */
export type VerificationRequestDecisionAction = "in_review" | "approve" | "reject";

/** Decide a request — mark in-review, approve, or reject. Approve raises the
 *  member's level via the Phase 1 override path server-side; reject requires
 *  `reason`. Returns the decided row, hand-mapped (never the raw entity). */
export const decideVerificationRequest = (
  id: string,
  action: VerificationRequestDecisionAction,
  reason?: string,
) =>
  apiPatch<AdminVerificationRequestDTO>(`/admin/verifications/requests/${id}`, {
    action,
    reason,
  });

// --- bulk decide (Phase 3, Task 4) ---

/** Mirrors the backend's `BULK_ACTION_CAP` (`verification.service.ts` /
 *  `BulkDecideVerificationRequestsDto`'s `@ArrayMaxSize`) — the most a single
 *  bulk request can carry. The selection UI enforces the same ceiling
 *  client-side so a reviewer finds out while picking rows, not from a
 *  generic failure toast after submitting. Same idiom as the listings
 *  queue's `LISTING_BULK_ACTION_CAP`, just a different number for a
 *  different endpoint. */
export const VERIFICATION_BULK_ACTION_CAP = 50;

/** Response shape of `POST /admin/verifications/requests/bulk` — which ids
 *  succeeded and which didn't. An illegal transition or unknown id is a
 *  per-item failure (it lands in `failed` without aborting the rest of the
 *  batch, each with its own `reason`); a genuine server error instead throws
 *  and the whole request fails. Mirrors the backend's bulk-decide result. */
export interface BulkDecideVerificationRequestsResultDTO {
  succeeded: string[];
  failed: { id: string; reason: string }[];
}

/** Bulk decide many requests in one server-side pass (cap
 *  `VERIFICATION_BULK_ACTION_CAP`, server-enforced too) — the Review-queue
 *  segment's multi-select bar and the single-row keyboard shortcuts both
 *  route through this one endpoint. `reason` is required by the backend for
 *  `"reject"`, same as the single-row `decideVerificationRequest`.
 *  Moderator/Admin only. */
export const bulkDecideVerificationRequests = (
  ids: string[],
  action: VerificationRequestDecisionAction,
  reason?: string,
) =>
  apiPost<BulkDecideVerificationRequestsResultDTO>(
    "/admin/verifications/requests/bulk",
    { ids, action, reason },
  );
