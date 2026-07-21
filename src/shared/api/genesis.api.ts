import { apiPost } from "./client";

/** The genesis invite code. The frontend composes the URL — see `inviteLink()`. */
export interface GenesisInviteDTO {
  code: string;
}

/**
 * One-time platform bootstrap. Both calls 404 unless the backend has
 * `GENESIS_EMAIL` set, which is the normal state — a 404 here means "closed",
 * not "broken".
 */
export const mintGenesisInvite = () =>
  apiPost<GenesisInviteDTO>("/genesis/invite");

export const claimGenesisAdmin = () => apiPost<void>("/genesis/claim");
