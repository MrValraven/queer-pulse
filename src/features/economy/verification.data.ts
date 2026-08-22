import type {
  SubmitVerificationRequestInput,
  VerificationRequestDTO,
  VerificationRequestStatus,
  VerificationStatusWithRequestDTO,
} from "./api/verification.api";

/**
 * Demo-mode verification standing. The prototype has no real verification, so
 * the demo persona is treated as fully ID-verified — every gated housing action
 * flows without a network call. `latestRequest` is `null`: the demo persona
 * reached their level before Phase 2's request flow existed, so there is no
 * request to show — a request appears in the cache only once
 * `useSubmitVerificationRequest` simulates one. Never used in live mode
 * (which reads `GET /verification/me`).
 */
export const DEMO_VERIFICATION_STATUS: VerificationStatusWithRequestDTO = {
  level: "id_verified",
  phoneVerified: true,
  idVerified: true,
  method: "id_document",
  provider: "stub_identity",
  verifiedAt: "2026-01-01T00:00:00.000Z",
  latestRequest: null,
};

/**
 * Builds the request a demo `useSubmitVerificationRequest` call "creates" —
 * there is no backend in demo mode, so this stands in for
 * `POST /verification/requests`'s response. Always lands `pending`, exactly
 * like a fresh real submission.
 */
export function simulateVerificationRequestSubmission(
  input: SubmitVerificationRequestInput,
): VerificationRequestDTO {
  const now = new Date().toISOString();
  return {
    id: `demo-request-${Date.now()}`,
    type: input.type ?? "identity",
    requestedLevel: input.requestedLevel,
    status: "pending",
    context: input.context ?? null,
    decisionReason: null,
    isAppeal: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Applies a demo withdraw/appeal transition to the member's current request.
 * Reads the request out of the caller's cached `latestRequest` (there is no
 * server record to fetch it from in demo mode) and re-stamps it with the new
 * status; falls back to a minimal stub for the rare case the cache is empty
 * (e.g. a direct hook call in a test) so the mutation still resolves honestly
 * rather than throwing.
 */
export function simulateVerificationRequestTransition(
  current: VerificationRequestDTO | null | undefined,
  requestId: string,
  status: VerificationRequestStatus,
  extra?: Partial<Pick<VerificationRequestDTO, "isAppeal" | "decisionReason">>,
): VerificationRequestDTO {
  const base: VerificationRequestDTO =
    current && current.id === requestId
      ? current
      : {
          id: requestId,
          type: "identity",
          requestedLevel: "phone",
          status: "pending",
          context: null,
          decisionReason: null,
          isAppeal: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
  return {
    ...base,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  };
}
