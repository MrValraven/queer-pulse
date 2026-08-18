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
  /** The community-guidelines revision currently in force. The single source
   *  of truth is the backend's `CURRENT_GUIDELINES_VERSION`
   *  (`queerpulse-backend/src/users/users.service.ts`) — read it from here
   *  rather than hardcoding a local copy that can drift out of sync. */
  guidelinesVersion: string;
}

export const getPlatformStatus = () =>
  apiGet<PlatformStatusDTO>("/platform-status");
