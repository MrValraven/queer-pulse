import { useQuery, type QueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toPreviewView,
  type StudioPreviewView,
  type StudioReleaseView,
} from "./studio.adapters";
import { STUDIO_PREVIEW_TOKEN_PATTERN } from "./studio.types";
import { getStudioPreview } from "./studioArtistTools.api";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** The demo preview. A release the member made or changed in this session
 *  lives in the release cache, not in the fixtures, so the cached view decides:
 *  a draft or scheduled one opens as a preview, one published since redirects
 *  to its page, and a taken-down one is the single 404. A release the cache
 *  does not hold falls back to the fixtures. */
async function demoPreviewOf(
  client: QueryClient,
  token: string,
): Promise<StudioPreviewView> {
  const { demoReleaseIdForToken } = await import("./studioDemoArtistTools");
  const releaseId = STUDIO_PREVIEW_TOKEN_PATTERN.test(token)
    ? demoReleaseIdForToken(token)
    : null;
  const cachedView = releaseId
    ? client.getQueryData<StudioReleaseView>(
        studioKeys.release(true, releaseId),
      )
    : undefined;
  // Only the member's own releases change in the demo.
  const cached = cachedView?.isOwner ? cachedView : undefined;
  if (cached?.status === "taken_down") {
    const { studioRefusal } = await import("./studioDemoMutations");
    throw studioRefusal(404, "studio_preview_not_found");
  }
  if (cached?.status === "published")
    return { release: null, publishedReleaseId: cached.id };
  if (cached)
    return {
      release: { ...cached, isPreview: true },
      publishedReleaseId: null,
    };
  return toPreviewView(
    (await import("./studioDemoApi")).demoStudioPreview(token),
  );
}

/** A private preview link (`/studio/preview/<token>`). A token that cannot
 *  be one never reaches the network and reads as not found, the same as the
 *  server's single 404. Never kept past the page: the owner can turn the
 *  link off at any moment. */
export function useStudioPreview(token: string | null): {
  preview: StudioPreviewView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const isWellFormed =
    token !== null && STUDIO_PREVIEW_TOKEN_PATTERN.test(token);
  const query = useQuery({
    queryKey: studioKeys.studioPreview(demoMode, token ?? ""),
    enabled: isWellFormed && (demoMode || hasAccess),
    gcTime: 0,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        demoMode
          ? demoPreviewOf(client, token ?? "")
          : toPreviewView(await getStudioPreview(token ?? "")),
      ),
  });
  if (!isWellFormed)
    return { preview: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    preview: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
