import { apiGet, apiPost } from "./client";

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
  /**
   * Sitewide announcement banner (ADM-25), read by `AnnouncementBanner`. The
   * backend already accounts for `announcementExpiresAt` — this is `false`
   * once that time passes, even if an admin never flipped the switch off.
   */
  announcementEnabled: boolean;
  /** `null` whenever `announcementEnabled` above is `false`. */
  announcementMessage: string | null;
  /** `null` whenever `announcementEnabled` above is `false`. Changes every
   *  time an admin edits the message, so a per-member dismissal resets. */
  announcementVersion: string | null;
  /**
   * Whether the CALLER has already dismissed this exact version — always
   * `false` for a signed-out visitor, who instead gets a `localStorage` flag
   * keyed by `announcementVersion` (see `AnnouncementBanner`).
   */
  announcementDismissed: boolean;
}

export const getPlatformStatus = () =>
  apiGet<PlatformStatusDTO>("/platform-status");

/** Signed-in members only — a signed-out visitor dismisses locally instead. */
export const postDismissAnnouncement = (announcementVersion: string) =>
  apiPost<{ dismissed: true }>(
    `/announcement/${encodeURIComponent(announcementVersion)}/dismiss`,
  );
