import { apiGet, apiPost, ensureCsrf } from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";

export type MemberStatus = "pending" | "active" | "suspended";
export type MemberRole = "member" | "moderator" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  status: MemberStatus;
  role: MemberRole;
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
 */
export function redirectToGoogle(redirectTo?: string, invite?: string): void {
  const params = new URLSearchParams();
  if (invite) params.set("invite", invite);
  if (redirectTo) params.set("redirect", redirectTo);
  const qs = params.toString();
  window.location.href = `${API_BASE_URL}/auth/google${qs ? `?${qs}` : ""}`;
}
