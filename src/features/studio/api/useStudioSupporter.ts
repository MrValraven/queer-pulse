import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { isStudioNotFound } from "./studio.api";
import {
  deleteStudioSupporter,
  getStudioSupporterState,
  putStudioSupporter,
} from "./studioListening.api";
import {
  toSupporterStateView,
  type StudioSupporterStateView,
  type StudioSupportingView,
} from "./studioListening.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

// The supporter opt-in on an artist page (CONTRACT-PART-2 section 5, backend
// delta 4). Neither write toasts: the card names the reason under the picker
// through `studioErrorMessageKeyOf(error, "save")`.

const SILENT = { silentError: true } as const;
const loadDemoSupporters = () => import("./studioDemoYourListening");

/** A saved or removed opt-in changes "Artists you support". */
function refreshSupporting(queryClient: QueryClient, demoMode: boolean) {
  void queryClient.invalidateQueries({
    queryKey: studioKeys.listeningSupporting(demoMode),
  });
}

/** The caller's opt-in for one artist persona. Reads nothing while
 *  disabled (an owner, or a page that has not asked yet). */
export function useStudioSupporterState(
  subprofileId: string,
  isEnabled: boolean,
): { state: StudioSupporterStateView | null; loadState: StudioLoadState } {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.supporter(demoMode, subprofileId),
    enabled: isEnabled && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 0,
    meta: SILENT,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toSupporterStateView(
          demoMode
            ? (await loadDemoSupporters()).demoStudioSupporterState(
                subprofileId,
              )
            : await getStudioSupporterState(subprofileId),
        ),
      ),
  });
  const loadState = studioLoadStateOf(query, query.data !== undefined);
  return {
    state: query.data ?? null,
    loadState: isEnabled ? loadState : { ...loadState, isLoading: false },
  };
}

/** Saves the identity the caller shows as; null is the account. */
export function useSaveStudioSupporter(subprofileId: string): {
  save: (shownAsSubprofileId: string | null) => Promise<boolean>;
  isSaving: boolean;
  error: unknown;
} {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const queryKey = studioKeys.supporter(demoMode, subprofileId);
  const mutation = useMutation<StudioSupporterStateView, Error, string | null>({
    meta: SILENT,
    mutationFn: async (shownAsSubprofileId) =>
      toSupporterStateView(
        demoMode
          ? (await loadDemoSupporters()).demoPutStudioSupporter(
              subprofileId,
              shownAsSubprofileId,
            )
          : await putStudioSupporter(subprofileId, { shownAsSubprofileId }),
      ),
    onSuccess: (state) => {
      queryClient.setQueryData(queryKey, state);
      refreshSupporting(queryClient, demoMode);
    },
    onError: (error) => {
      // The artist became unavailable, or the caller identity-blocked it
      // (delta 4). A reset drops the shown state and reads again, so the
      // card falls to its not-available state.
      if (isStudioNotFound(error)) void queryClient.resetQueries({ queryKey });
    },
  });
  return {
    save: async (shownAsSubprofileId) => {
      try {
        await mutation.mutateAsync(shownAsSubprofileId);
        return true;
      } catch {
        return false;
      }
    },
    isSaving: mutation.isPending,
    error: mutation.error,
  };
}

/** Turns the opt-in off. DELETE answers 204 for any uuid. */
export function useRemoveStudioSupporter(subprofileId: string): {
  remove: () => Promise<boolean>;
  isRemoving: boolean;
  error: unknown;
} {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const queryKey = studioKeys.supporter(demoMode, subprofileId);
  const mutation = useMutation<void, Error, void>({
    meta: SILENT,
    mutationFn: async () => {
      if (demoMode) {
        (await loadDemoSupporters()).demoDeleteStudioSupporter(subprofileId);
        return;
      }
      await deleteStudioSupporter(subprofileId);
    },
    onSuccess: () => {
      // Drop the artist from "Artists you support" at once. An empty cache
      // stays empty: the updater returns undefined, so no row is invented.
      queryClient.setQueryData<StudioSupportingView[]>(
        studioKeys.listeningSupporting(demoMode),
        (previous) =>
          previous?.filter((item) => item.artist.id !== subprofileId),
      );
      queryClient.setQueryData<StudioSupporterStateView>(
        queryKey,
        (previous) =>
          previous && {
            ...previous,
            isSupporting: false,
            shownAsSubprofileId: null,
            shownAs: null,
            since: null,
          },
      );
      refreshSupporting(queryClient, demoMode);
    },
  });
  return {
    remove: async () => {
      try {
        await mutation.mutateAsync();
        return true;
      } catch {
        return false;
      }
    },
    isRemoving: mutation.isPending,
    error: mutation.error,
  };
}
