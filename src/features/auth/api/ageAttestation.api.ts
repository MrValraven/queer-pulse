import { apiPost } from "../../../shared/api/client";

/**
 * The Terms version whose first clause carries the 18+ eligibility rule
 * ("You must be 18 or older", TermsPage §1). Paired with every age attestation
 * so the stored consent record is complete and defensible — if the eligibility
 * clause changes, bump this and members re-attest against the new version.
 */
export const TERMS_VERSION = "2.4";

/**
 * The 18+ self-attestation the frontend records at onboarding (the load-bearing
 * gate, since Google OAuth cannot supply age) and mirrors into the request-invite
 * body. Self-attestation — not government-ID collection — is the deliberate,
 * audited tier for this community (see spec 06 §Backend). `ageAttested` MUST be
 * true; the backend validates and refuses to promote `pending → active` without it.
 */
export interface AgeAttestationInput {
  /** Always true — the explicit "I am 18 or older" affirmation. */
  ageAttested: true;
  /** Which Terms version's eligibility clause the member affirmed against. */
  termsVersion: string;
  /** Optional stronger record; server computes age and rejects < 18 when present. */
  dateOfBirth?: string;
}

/**
 * The auditable consent record the backend stores and echoes back. `ageAttestedAt`
 * is the timestamp `AuthUser` exposes so an un-attested live session can be forced
 * through the gate; `pending → active` requires it to be non-null.
 */
export interface AgeAttestationResult {
  ageAttestedAt: string;
  termsVersion: string;
}

/**
 * Record the 18+ attestation at onboarding completion — the gate that lets a
 * `pending` OAuth account become `active`. Contract: `POST /auth/onboarding`
 * with `{ ageAttested: true, termsVersion, dateOfBirth? }`; a DOB computing to
 * age < 18 returns a typed `403 { code: "UNDER_18" }` the client renders as the
 * humane block. Demo mode never calls this (see useAgeAttestation).
 */
export const postAgeAttestation = (input: AgeAttestationInput) =>
  apiPost<AgeAttestationResult>("/auth/onboarding", input);

/** True when a live-session user still needs to pass the 18+ attestation gate. */
export function needsAgeAttestation(
  user: { status: string; ageAttestedAt?: string | null } | null,
): boolean {
  if (!user) return false;
  return user.status === "pending" && !user.ageAttestedAt;
}
