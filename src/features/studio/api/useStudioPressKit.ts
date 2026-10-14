import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toStudioPressKitView,
  type StudioPressKitView,
} from "./studio.adapters";
import type { UpdateStudioPressKitBody } from "./studio.types";
import { getStudioPressKit, putStudioPressKit } from "./studioArtistTools.api";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** A persona's press kit: for any granted member while the persona is
 *  listenable, and always for its owners (404 otherwise). */
export function useStudioPressKit(subprofileId: string | null): {
  pressKit: StudioPressKitView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.studioPressKit(demoMode, subprofileId ?? ""),
    enabled: subprofileId !== null && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toStudioPressKitView(
          demoMode
            ? (await import("./studioDemoPress")).demoStudioPressKit(
                subprofileId ?? "",
              )
            : await getStudioPressKit(subprofileId ?? ""),
        ),
      ),
  });
  if (subprofileId === null)
    return { pressKit: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    pressKit: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}

/** "Save press kit": the answer is the whole press kit, written into the
 *  cache the page and the one-sheet read. */
export function useSaveStudioPressKit() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioPressKitView,
    Error,
    { subprofileId: string; body: UpdateStudioPressKitBody }
  >({
    meta: { silentError: true },
    mutationFn: async ({ subprofileId, body }) =>
      toStudioPressKitView(
        demoMode
          ? (await import("./studioDemoPress")).demoSaveStudioPressKit(
              subprofileId,
              body,
            )
          : await putStudioPressKit(subprofileId, body),
      ),
    onSuccess: (pressKit, { subprofileId }) =>
      queryClient.setQueryData(
        studioKeys.studioPressKit(demoMode, subprofileId),
        pressKit,
      ),
  });
}
