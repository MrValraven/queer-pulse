import { apiGet } from "../../../shared/api/client";
import type { LinkPreviewResponse } from "../../../shared/contracts/contracts";

export type { LinkPreviewResponse };

/**
 * GET /link-preview?url= — the server-side unfurl for one URL. The backend is
 * SSRF-hardened and returns an all-null card (never an error) when a URL can't
 * be previewed, so callers just check whether the card has any content.
 */
export async function getLinkPreview(
  url: string,
): Promise<LinkPreviewResponse> {
  const query = new URLSearchParams({ url });
  return apiGet<LinkPreviewResponse>(`/link-preview?${query.toString()}`);
}
