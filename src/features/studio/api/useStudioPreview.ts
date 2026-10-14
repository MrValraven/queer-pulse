import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { toPreviewView, type StudioPreviewView } from "./studio.adapters";
import { STUDIO_PREVIEW_TOKEN_PATTERN } from "./studio.types";
import { getStudioPreview } from "./studioArtistTools.api";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

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
        toPreviewView(
          demoMode
            ? (await import("./studioDemoApi")).demoStudioPreview(token ?? "")
            : await getStudioPreview(token ?? ""),
        ),
      ),
  });
  if (!isWellFormed)
    return { preview: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    preview: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
