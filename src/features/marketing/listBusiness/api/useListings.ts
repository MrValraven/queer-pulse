import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import type { PendingListing } from "../listBusiness.data";
import {
  createListing,
  deleteListing,
  getMyListings,
  type CreateListingDto,
} from "./listings.api";
import { listingDtoToPending } from "./listings.adapters";

export interface MyListingsResult {
  items: PendingListing[];
  total: number;
}

/**
 * The caller's own submitted listings. Demo mode never hits the network — the
 * DirectoryListingsProvider keeps its own local demo array as the source, so
 * the query is simply disabled and returns a placeholder. Live mode calls
 * GET /listings/mine and adapts each DTO to the PendingListing view-model.
 */
export function useMyListings(page = 1) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  return useQuery<MyListingsResult>({
    queryKey: ["listings", "mine", demoMode, page],
    enabled: !demoMode && loggedIn,
    queryFn: async () => {
      const res = await getMyListings(page);
      return {
        items: res.items.map(listingDtoToPending),
        total: res.total,
      };
    },
  });
}

/**
 * Create / withdraw mutations for directory listings. Each branches on
 * `demoMode`: demo is a no-op (the provider keeps its optimistic local state),
 * and live calls the API then invalidates the ["listings"] tree so the
 * useMyListings query refetches. Demo mode never touches the network.
 */
export function useListingMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const createListingMutation = useMutation<
    PendingListing | null,
    Error,
    CreateListingDto
  >({
    mutationFn: async (dto) => {
      if (demoMode) return null;
      const res = await createListing(dto);
      return listingDtoToPending(res);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });

  const withdrawListingMutation = useMutation<void, Error, string>({
    mutationFn: async (ref) => {
      if (demoMode) return;
      await deleteListing(ref);
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });

  return {
    createListing: createListingMutation,
    withdrawListing: withdrawListingMutation,
  };
}
