import { apiGet, apiPost, ensureCsrf } from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";
import { TERMS_VERSION } from "./ageAttestation.api";

/**
 * `deactivated` covers BOTH member-initiated pauses and the 30-day erasure
 * grace period — the backend sets the same status for each, since both mean
 * "hidden everywhere but recoverable". Every `ActiveMemberGuard` route 403s for
 * these members, so the app must route them somewhere useful rather than let
 * them land on a feed that fails to load (see authGate.ts).
 */
export type MemberStatus =
  | "pending"
  | "active"
  | "suspended"
  | "deactivated";
export type MemberRole = "member" | "moderator" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  status: MemberStatus;
  role: MemberRole;
  /**
   * ISO timestamp of the member's 18+ self-attestation, or null if they haven't
   * passed the age gate yet (spec 06). A `pending` user with a null value must be
   * forced through the onboarding attestation before promotion to `active`.
   */
  ageAttestedAt: string | null;
  profile: {
    slug: string;
    firstName: string;
    lastName: string;
    pronouns?: string;
    avatarUrl?: string | null;
  };
}

export const fetchMe = () => apiGet<AuthUser>("/auth/me");
export const postLogout = () => apiPost<{ ok: true }>("/auth/logout");
export const postRefresh = () => apiPost<{ ok: true }>("/auth/refresh");
export const bootstrapCsrf = ensureCsrf;

/**
 * Full-page navigation to the Google consent screen (not a fetch). Pass
 * `redirectTo` to tell the backend where to send the browser back after a
 * successful login — otherwise the callback uses its own default landing page.
 * Pass `invite` when registering off an invite link so the backend redeems it
 * during signup; a brand-new Google user with no invite is rejected.
 *
 * `ageAttested` carries the 18+ self-attestation ticked on the invite landing
 * page. The backend REQUIRES it to create a new account (Terms §eligibility) and
 * stamps `users.age_attested_at` from it — a returning member doesn't need it,
 * so sign-in omits it. It rides the OAuth `state` param across the consent hop.
 */
export function redirectToGoogle(
  redirectTo?: string,
  invite?: string,
  ageAttested?: boolean,
): void {
  const params = new URLSearchParams();
  if (invite) params.set("invite", invite);
  if (redirectTo) params.set("redirect", redirectTo);
  if (ageAttested) {
    params.set("ageAttested", "1");
    params.set("termsVersion", TERMS_VERSION);
  }
  const qs = params.toString();
  window.location.href = `${API_BASE_URL}/auth/google${qs ? `?${qs}` : ""}`;
}
