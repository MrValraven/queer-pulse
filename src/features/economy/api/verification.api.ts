import { ApiError, apiGet, apiPost } from "../../../shared/api/client";

/** Ordered identity-assurance ladder, mirrored from the backend. `email` is the
 * floor any account already has (Google-only sign-in proves a verified email);
 * `phone` and `id_verified` reflect a REAL, recorded verification event. */
export type VerificationLevel = "none" | "email" | "phone" | "id_verified";

/** The kind of verification a standing/request covers. Mirrors the backend's
 * `VerificationType` enum; only `identity` exists today — the dimension exists
 * so a future verification type (e.g. business/landlord) can coexist. */
export type VerificationType = "identity";

export interface VerificationStatusDTO {
  level: VerificationLevel;
  phoneVerified: boolean;
  idVerified: boolean;
  method: string | null;
  provider: string | null;
  verifiedAt: string | null;
}

/**
 * The lifecycle of a member-submitted verification request. Mirrors the
 * backend's `VerificationRequestStatus` enum: a request starts `pending`, a
 * moderator may pull it `in_review`, then decides `approved` or `rejected`. A
 * `rejected` request may be appealed exactly once (→ `appealing`, which
 * re-enters the review loop). The member may `withdrawn` a request themselves
 * while it is still open. Legal transitions are enforced server-side — the
 * client never trusts a locally-computed next state.
 */
export type VerificationRequestStatus =
  "pending" | "in_review" | "approved" | "rejected" | "appealing" | "withdrawn";

/**
 * A member's own view of one of their verification requests — the shape
 * `POST /verification/requests`, `.../withdraw`, `.../appeal`, and
 * `GET /verification/me`'s `latestRequest` all return. Deliberately narrow:
 * no reviewer-only fields (`reviewedByUserId`, `signals`) and no
 * `evidenceRef` (the member already knows what they submitted; it isn't
 * echoed back here). Mirrors the backend's `VerificationRequestDTO`.
 */
export interface VerificationRequestDTO {
  id: string;
  type: VerificationType;
  requestedLevel: VerificationLevel;
  status: VerificationRequestStatus;
  context: string | null;
  decisionReason: string | null;
  isAppeal: boolean;
  createdAt: string;
  updatedAt: string;
}

/** `GET /verification/me` response — the member's current standing (unchanged
 * Phase 1 shape) plus their newest request, so the client can render
 * submitted/in-review/approved/rejected/appealing status without a second
 * round trip. `latestRequest` is `null` when the member has never submitted
 * one. Mirrors the backend's `VerificationStatusWithRequestDTO`. */
export interface VerificationStatusWithRequestDTO extends VerificationStatusDTO {
  latestRequest: VerificationRequestDTO | null;
}

const LEVEL_ORDER: VerificationLevel[] = [
  "none",
  "email",
  "phone",
  "id_verified",
];

export function levelRank(level: VerificationLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

export function meetsLevel(
  actual: VerificationLevel,
  required: VerificationLevel,
): boolean {
  return levelRank(actual) >= levelRank(required);
}

/**
 * Reads a `VERIFICATION_REQUIRED` 403 body and returns the level the action
 * needs, so the caller can open the step-up prompt. Returns `null` for any other
 * error (the caller handles it normally). The backend emits
 * `{ code: "VERIFICATION_REQUIRED", requiredLevel }` from its gate.
 */
export function verificationRequiredFrom(
  error: unknown,
): VerificationLevel | null {
  if (error instanceof ApiError && error.status === 403) {
    const data = error.data as
      { code?: string; requiredLevel?: VerificationLevel } | undefined;
    if (data?.code === "VERIFICATION_REQUIRED" && data.requiredLevel) {
      return data.requiredLevel;
    }
  }
  return null;
}

export const getVerificationStatus = () =>
  apiGet<VerificationStatusWithRequestDTO>("/verification/me");

export const startIdentityVerification = () =>
  apiPost<{ redirectUrl: string; providerRef: string }>(
    "/verification/identity/start",
    {},
  );

/** `POST /verification/requests` body — option-A, reference-based evidence
 * (the member's own words plus a link to already-public corroboration, never
 * a document upload — see the design spec's §9). `type` defaults to
 * `identity` server-side when omitted. Mirrors the backend's
 * `SubmitVerificationRequestDto`. */
export interface SubmitVerificationRequestInput {
  type?: VerificationType;
  requestedLevel: VerificationLevel;
  context?: string;
  evidenceRef?: string;
}

/** Submit a new manual verification request. 409s server-side when the member
 * already has an open request (pending/in_review/appealing) for the type. */
export const submitVerificationRequest = (
  input: SubmitVerificationRequestInput,
) => apiPost<VerificationRequestDTO>("/verification/requests", input);

/** Withdraw your own open request. Only legal from pending/in_review. */
export const withdrawVerificationRequest = (requestId: string) =>
  apiPost<VerificationRequestDTO>(
    `/verification/requests/${requestId}/withdraw`,
    {},
  );

/** Appeal a rejected request, exactly once. 409s server-side on a second
 * appeal or from any status other than `rejected`. */
export const appealVerificationRequest = (requestId: string) =>
  apiPost<VerificationRequestDTO>(
    `/verification/requests/${requestId}/appeal`,
    {},
  );
