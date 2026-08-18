/**
 * The one mock opportunity treated as "posted by the demo viewer." The mock
 * `VolunteerOpportunity` registry has no real poster/ownership concept, so
 * this is a deliberate, single designated slug — reused by `useOpportunity`,
 * `useSignups`, and `useMyOpportunities` — that makes the poster-only roster,
 * applicant review, and manage-applicants dashboard reachable in demo mode.
 */
export const DEMO_POSTER_OPPORTUNITY_SLUG = "community-outreach";
