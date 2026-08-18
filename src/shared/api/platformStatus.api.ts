import { apiGet } from "./client";

/**
 * The public projection of the kill switches — deliberately narrower than the
 * admin view: no actor, no timestamps, no audit. An unauthenticated endpoint
 * must not leak who operates the platform or when they were last active.
 */
export interface PlatformStatusDTO {
  registrationOpen: boolean;
  joinRequestsOpen: boolean;
  locked: boolean;
  lockdownMessage: string | null;
  registrationClosedMessage: string | null;
  /**
   * The community-guidelines revision currently in effect, mirroring the
   * backend's `CURRENT_GUIDELINES_VERSION` (`users.service.ts`). The
   * onboarding wizard reads this instead of hardcoding its own copy — see
   * `postCompleteOnboarding` in `features/auth/api/auth.api.ts`.
   */
  guidelinesVersion: string;
}

export const getPlatformStatus = () =>
  apiGet<PlatformStatusDTO>("/platform-status");
