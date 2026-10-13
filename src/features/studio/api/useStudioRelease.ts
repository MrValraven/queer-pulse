import { queryOptions, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioRelease } from "./studio.api";
import { toReleaseView, type StudioReleaseView } from "./studio.adapters";
import { DEMO_DEFAULT_RELEASE_ID } from "./studioDemoMe.data";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** Shared with the player, which loads a release's queue on Play. */
export function studioReleaseQueryOptions(
  demoMode: boolean,
  releaseId: string,
) {
  return queryOptions({
    queryKey: studioKeys.release(demoMode, releaseId),
    // The demo fixture never changes, and demo drafts exist only in this
    // cache: refetching one would answer 404 from the fixture.
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    queryFn: ({ client }): Promise<StudioReleaseView> =>
      readStudio(client, async () =>
        toReleaseView(
          demoMode
            ? (await import("./studioDemoApi")).demoStudioRelease(releaseId)
            : await getStudioRelease(releaseId),
        ),
      ),
  });
}

export function useStudioRelease(
  releaseId: string | null,
  options: { shouldUseDemoDefault?: boolean } = {},
): {
  release: StudioReleaseView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const shouldUseDemoDefault = options.shouldUseDemoDefault ?? true;
  const resolvedId =
    releaseId ??
    (demoMode && shouldUseDemoDefault ? DEMO_DEFAULT_RELEASE_ID : null);
  const query = useQuery({
    ...studioReleaseQueryOptions(demoMode, resolvedId ?? ""),
    enabled: resolvedId !== null && (demoMode || hasAccess),
  });
  if (resolvedId === null)
    return { release: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    release: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
