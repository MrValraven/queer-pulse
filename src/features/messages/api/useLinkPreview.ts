import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { LinkPreviewResponse } from "../../../shared/contracts/contracts";
import { demoLinkPreview } from "../linkPreview.data";
import { getLinkPreview } from "./link-preview.api";

/**
 * Unfurl one URL into a preview card. Dual-mode like every data hook here:
 *  - demo → resolves a colocated mock synchronously (NO network in the prototype);
 *  - live → GET /link-preview, deduped/cached by url across every bubble that
 *    quotes the same link (React Query keys by `["link-preview", url]`).
 *
 * The backend returns an all-null card rather than erroring for un-previewable
 * URLs, so the component decides emptiness from the data (see `hasPreviewContent`).
 * Retries are disabled: a link that can't be unfurled won't become unfurlable on
 * a retry, and we never want a broken/half card — we simply show nothing.
 */
export function useLinkPreview(url: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<LinkPreviewResponse>({
    queryKey: ["link-preview", url, demoMode],
    enabled: !!url,
    queryFn: async () => {
      if (demoMode) return demoLinkPreview(url!);
      return getLinkPreview(url!);
    },
    staleTime: 10 * 60 * 1000, // match the server-side TTL; unfurls change rarely
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
}

/** Whether a resolved card carries anything worth rendering. An all-null card
 *  (un-previewable URL) renders nothing — never a broken frame. */
export function hasPreviewContent(
  preview: LinkPreviewResponse | undefined,
): preview is LinkPreviewResponse {
  return (
    !!preview &&
    (!!preview.title || !!preview.description || !!preview.imageUrl)
  );
}
