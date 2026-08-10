import { apiDelete, apiPost } from "../../../shared/api/client";
import type { SafeSpaceVouchRelationship } from "../vouchModal.data";

/** Live-mode write for a member's safe-space vouch. Mirrors the member-vouch
 *  `vouchFor` shape: only the fields the member actually set are sent, so the
 *  backend `ValidationPipe` (whitelist + forbidNonWhitelisted) never rejects an
 *  empty key. Resolves the space by its listing slug — the same identifier the
 *  public read path (`GET /directory/safe-spaces/:slug`) uses. */
export const vouchForSafeSpace = (
  slug: string,
  input: {
    relationship?: SafeSpaceVouchRelationship;
    note?: string;
    anonymous?: boolean;
  } = {},
) =>
  apiPost<{ vouchCount: number }>(`/safe-spaces/${slug}/vouch`, {
    ...(input.note ? { note: input.note } : {}),
    ...(input.relationship ? { relationship: input.relationship } : {}),
    ...(input.anonymous ? { anonymous: true } : {}),
  });

/** Withdraw the current member's vouch for a safe space. */
export const unvouchSafeSpace = (slug: string) =>
  apiDelete<{ ok: true }>(`/safe-spaces/${slug}/vouch`);
