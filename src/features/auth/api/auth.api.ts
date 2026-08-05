import {
  apiGet,
  apiPost,
  ensureCsrf,
  postUnversioned,
} from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";
import { validateAuthUser } from "../../../shared/api/validation";
import { TERMS_VERSION } from "./ageAttestation.api";

/**
 * `deactivated` covers BOTH member-initiated pauses and the 30-day erasure
 * grace period — the backend sets the same status for each, since both mean
 * "hidden everywhere but recoverable". Every `ActiveMemberGuard` route 403s for
 * these members, so the app must route them somewhere useful rather than let
 * them land on a feed that fails to load (see authGate.ts).
 */
export type MemberStatus = "active" | "suspended" | "deactivated";
export type MemberRole = "member" | "moderator" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  status: MemberStatus;
  role: MemberRole;
  /**
   * ISO timestamp of the member's 18+ self-attestation, or null if they haven't
   * passed the age gate yet (spec 06). A member with a null value must be forced
   * through the onboarding attestation before they can use the app.
   */
  ageAttestedAt: string | null;
  /**
   * ISO timestamp of when the member finished the one-time post-signup
   * onboarding wizard, or null while they're still mid-onboarding. The auth
   * gate reads this to bounce an already-onboarded member off `/auth/onboarding`
   * (see authGate.ts) — the wizard is one-time, so landing back on it (usually
   * via browser autofill of the saved URL) should not replay it. Backfilled to
   * the account's creation time for members who predate this field.
   */
  onboardedAt: string | null;
  /**
   * For a suspended member: ISO expiry of a timed suspension, or `null` while
   * their status is "suspended" — a `null` here means a permanent ban (routed to
   * the account-banned page vs the timed account-suspended one). `null`/absent
   * for everyone else. A suspended member is locked out of every gated endpoint,
   * so `/auth/me` (JWT-only) is where the account-suspended page reads this.
   */
  suspendedUntil?: string | null;
  /**
   * The moderator's reason for a suspension/ban — `note` (the member-facing text)
   * + `reasonCode` category — sourced from the member's latest moderation-outcome
   * notification. `null` when the member isn't suspended, or when no reason is on
   * record (a suspension predating that notification); the page then shows
   * generic copy.
   */
  suspension?: { note: string; reasonCode: string } | null;
  /**
   * Additive "staff role" grants (e.g. `magazine_editor`) held on top of the
   * account tier (`role`) — orthogonal capabilities, not a higher tier. Defaults
   * to `[]` at the validation seam (`validateAuthUser`) when the backend payload
   * omits it, so older/partial `/auth/me` responses never crash. Untyped as
   * `StaffRoleId[]` here to avoid a dependency from `auth` → `admin`; callers
   * narrow with `isStaffRoleId`/`STAFF_ROLE_IDS` (see `useMyStaffRoles`).
   */
  staffRoles: string[];
  profile: {
    slug: string;
    firstName: string;
    lastName: string;
    pronouns?: string;
    avatarUrl?: string | null;
  };
}

// A malformed /auth/me silently holds or corrupts every gated route, so it is
// the one response we validate at runtime (P1-12). `validateAuthUser` narrows
// the body or throws, turning backend shape-drift into a loud ApiError(422)
// instead of an app full of `undefined`. (No timeout override → the 15s default.)
export const fetchMe = () =>
  apiGet<AuthUser>("/auth/me", undefined, validateAuthUser);
// Logout is UNVERSIONED (`/auth/logout`, not `/v1/auth/logout`): the backend
// controller is `@Version(VERSION_NEUTRAL)` so the request stays under the
// `path=/auth` scope of the refresh-token cookie. A versioned call would omit
// that cookie, and the backend's revoke-row + socket-disconnect step would
// silently no-op. Best-effort — the caller clears local session state in a
// `.finally` regardless of the result.
export const postLogout = () => postUnversioned("/auth/logout");
/**
 * The community-guidelines revision the onboarding wizard shows alongside the
 * agreement checkbox. Kept in lock-step with the backend's
 * `CURRENT_GUIDELINES_VERSION` (users.service.ts) so the completion stamp records
 * the exact revision the member actually agreed to, rather than the server always
 * falling back to its own current version. Bump both together when the guidelines
 * change materially.
 */
export const GUIDELINES_VERSION = "1.0";

/**
 * Stamp the member as having finished onboarding (idempotent server-side — the
 * first completion time wins). Fired when a new member reaches the wizard's
 * final step; demo mode never calls it. Best-effort: the caller ignores
 * failures, since the gate and the migration's backfill cover the common cases.
 * Sends the guidelines revision the wizard displayed so the backend records the
 * version the member agreed to (it only falls back to its own on an empty body).
 */
export const postCompleteOnboarding = () =>
  apiPost<{ onboardedAt: string }>("/auth/onboarding/complete", {
    guidelinesVersion: GUIDELINES_VERSION,
  });
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
