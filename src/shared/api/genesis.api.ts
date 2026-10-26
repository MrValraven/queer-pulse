import { apiGet, apiPost } from "./client";

/** The genesis invite code. The frontend composes the URL; see `inviteLink()`. */
export interface GenesisInviteDTO {
  code: string;
}

/**
 * Whether genesis can still be used. `open` is false once genesis was claimed,
 * when an admin already exists, or when the server has genesis disabled.
 */
export interface GenesisStatusDTO {
  open: boolean;
}

/**
 * Public, so it answers the same signed in and signed out. The page reads it
 * before offering any action, so a used genesis never shows a button.
 */
export const getGenesisStatus = () =>
  apiGet<GenesisStatusDTO>("/genesis/status");

/**
 * One-time platform bootstrap. Both calls 404 unless the backend has
 * `GENESIS_EMAIL` set, which is the normal state. A 404 here means "closed":
 * genesis is used or switched off. A claim refused with 403 carries a `code`
 * in its body: `genesis_closed` or `genesis_not_founder_account`.
 */
export const mintGenesisInvite = () =>
  apiPost<GenesisInviteDTO>("/genesis/invite");

export const claimGenesisAdmin = () => apiPost<void>("/genesis/claim");
