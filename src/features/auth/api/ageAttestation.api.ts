/**
 * The Terms version whose first clause carries the 18+ eligibility rule
 * ("You must be 18 or older", TermsPage §1). Paired with every age attestation
 * so the stored consent record is complete and defensible — if the eligibility
 * clause changes, bump this and members re-attest against the new version.
 *
 * WHERE THE ATTESTATION ACTUALLY GOES NOW: it rides the OAuth `state` param on
 * the way to Google (see `redirectToGoogle` in auth.api.ts), and the backend
 * stamps `users.age_attested_at` + `terms_version` when it creates the account.
 * There is no separate attestation endpoint — a `POST /auth/onboarding` used to
 * live here, but it was never built on the backend, so it 404'd silently inside
 * a best-effort try/catch on every signup.
 *
 * It is also sent with a public join request (`useCreateJoinRequest`), where the
 * applicant has no account yet.
 */
export const TERMS_VERSION = "2.4";
