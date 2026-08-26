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
 *
 * NO LONGER AUTHORITATIVE (ID-14). The backend's `consent/policy-versions.ts`
 * declares every policy revision, and the live value arrives as `termsVersion`
 * on the public `GET /platform-status`. This literal is the fallback for the
 * moment before that query resolves and for demo mode, kept equal to the
 * backend constant. `redirectToGoogle` still reads it directly — it is a plain
 * function performing a full-page navigation, with no hook context to read the
 * query from — but that path is now belt-and-braces: `AuthService` falls back
 * to its OWN `CURRENT_TERMS_VERSION` when the OAuth state carries none, so a
 * stale literal here can no longer decide what gets stored.
 */
export const TERMS_VERSION = "2.4";
