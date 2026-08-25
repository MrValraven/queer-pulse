import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { DIRECTORY_KEY } from "../../api/useDirectory";
import {
  confirmListingDetails,
  setListingDirectoryVisibility,
  setListingOperatingState,
  type ConfirmDetailsResult,
  type ManagedListingDTO,
  type UpdateListingVisibilityInput,
  type UpdateOperatingStateInput,
} from "./listings.api";

/** The owner's own listing row, so a fresh server record can be written
 *  straight into the cache the editor reads from. */
const detailKey = (ref: string) => ["listings", "detail", ref] as const;

/**
 * Everything the caches holding this listing need after the owner changes
 * something about it outside the main save: the detail row the editor reads,
 * the owner's "my listings" lists, and the public directory (browse, search and
 * map all filter on operating state, so a permanently closed business has to
 * leave those results without waiting for a reload).
 */
function useListingCacheRefresh() {
  const queryClient = useQueryClient();
  return (ref: string, fresh?: ManagedListingDTO | null) => {
    if (fresh) queryClient.setQueryData(detailKey(ref), fresh);
    void queryClient.invalidateQueries({ queryKey: ["listings"] });
    void queryClient.invalidateQueries({ queryKey: [DIRECTORY_KEY] });
  };
}

/**
 * `PATCH /listings/:ref/operating-state`: the owner declaring whether the
 * business is still trading (open, temporarily closed, permanently closed, or
 * moved). Returns the updated listing, which is written straight into the
 * editor's cache so the section it was pressed from re-renders with the new
 * state rather than the one that was just replaced.
 *
 * Demo mode never touches the network: there is no owner-gated listing to
 * fetch in demo, so this resolves to null and the caller keeps whatever it was
 * already showing.
 */
export function useSetOperatingState(ref: string) {
  const { demoMode } = useDemoMode();
  const refreshCaches = useListingCacheRefresh();

  return useMutation<
    ManagedListingDTO | null,
    Error,
    UpdateOperatingStateInput
  >({
    // The section renders its own inline failure, so silence the global toast.
    meta: { silentError: true },
    mutationFn: async (input) => {
      if (demoMode) return null;
      return setListingOperatingState(ref, input);
    },
    onSuccess: (fresh) => {
      if (demoMode) return;
      refreshCaches(ref, fresh);
    },
  });
}

/**
 * `POST /listings/:ref/confirm-details`, the "still accurate" press. It carries
 * no body: pressing it IS the message. The response is only the new timestamp, so the
 * cached listing is patched in place rather than replaced, and the surrounding
 * lists are invalidated so a freshness badge elsewhere agrees with this one.
 */
export function useConfirmListingDetails(ref: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const refreshCaches = useListingCacheRefresh();

  return useMutation<ConfirmDetailsResult, Error>({
    meta: { silentError: true },
    mutationFn: async () => {
      if (demoMode)
        return { ref, detailsConfirmedAt: new Date().toISOString() };
      return confirmListingDetails(ref);
    },
    onSuccess: (result) => {
      if (demoMode) return;
      queryClient.setQueryData<ManagedListingDTO>(detailKey(ref), (previous) =>
        previous
          ? { ...previous, detailsConfirmedAt: result.detailsConfirmedAt }
          : previous,
      );
      refreshCaches(ref);
    },
  });
}

/**
 * `PATCH /listings/:ref/visibility`: the owner pausing or resuming their own
 * entry in the directory.
 *
 * A pause withdraws the listing from browse, search and map results and
 * changes nothing else. It never touches `status` (what moderation thinks) and
 * never touches `operatingState` (whether the business is trading), which is
 * the whole reason it exists: owners were deleting listings to get this
 * effect, and a delete takes the reviews with it.
 *
 * The public directory caches are invalidated alongside the owner's own, so a
 * paused listing leaves browse and map results without waiting for a reload.
 *
 * Demo mode never touches the network: there is no owner-gated listing to
 * fetch there, so this resolves to null and the caller keeps what it had.
 */
export function useSetDirectoryVisibility(ref: string) {
  const { demoMode } = useDemoMode();
  const refreshCaches = useListingCacheRefresh();

  return useMutation<
    ManagedListingDTO | null,
    Error,
    UpdateListingVisibilityInput
  >({
    // The section renders its own inline failure, so silence the global toast.
    meta: { silentError: true },
    mutationFn: async (input) => {
      if (demoMode) return null;
      return setListingDirectoryVisibility(ref, input);
    },
    onSuccess: (fresh) => {
      if (demoMode) return;
      refreshCaches(ref, fresh);
    },
  });
}
