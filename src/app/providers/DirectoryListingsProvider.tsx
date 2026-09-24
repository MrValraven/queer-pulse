import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  makeRef,
  slugify,
  type ListingDraft,
  type PendingListing,
} from "../../features/marketing/listBusiness/listBusiness.data";
import { useListingMutations } from "../../features/marketing/listBusiness/api/useListings";
import { draftToDto } from "../../features/marketing/listBusiness/draftToDto";
import { useDemoMode } from "./DemoModeProvider";
import { DirectoryListingsContext } from "./useDirectoryListingsActions";

/**
 * Store for member-submitted directory listings (pending review).
 *
 * Demo mode is byte-for-byte the original behaviour: a local `useState` array
 * plus a `seq` counter is the whole source of truth, and nothing touches the
 * network.
 *
 * This provider holds ONLY the overlay — it does not fetch. The server list
 * (GET /listings/mine) is composed on top at read time by
 * `useDirectoryListings` in
 * `features/marketing/listBusiness/api/useDirectoryListings.ts`, so the
 * request fires when a reader mounts rather than on every route.
 *
 * Two ways to remove a listing: `withdrawListing` is fire-and-forget and hides
 * the ref at once; `deleteListing` (the multi-step `ListingDeleteFlow`) awaits
 * the server and hides the ref only after it confirms, rejecting on failure.
 *
 * The overlay stays app-wide deliberately: `addListing` is called on
 * /local/directory/list and `submitted` is read on /account/profile. Scope
 * this state to either route and a listing submitted on one stops appearing
 * on the other.
 */
export function DirectoryListingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { demoMode } = useDemoMode();
  const {
    createListing,
    withdrawListing: withdrawMutation,
    deleteListing: deleteMutation,
  } = useListingMutations();
  // `mutateAsync` is stable across renders, so the callback below keeps its
  // identity while the mutation's own status changes.
  const { mutateAsync: deleteListingOnServer } = deleteMutation;

  // Demo: the full store. Live: session-local optimistic additions only.
  const [local, setLocal] = useState<PendingListing[]>([]);
  const [seq, setSeq] = useState(7);
  // Live: refs withdrawn or deleted this session, so a server row disappears
  // immediately (before the invalidated GET /listings/mine refetch lands).
  const [withdrawn, setWithdrawn] = useState<Set<string>>(() => new Set());

  const addListing = useCallback(
    async (
      draft: ListingDraft,
      submittedBy: string,
    ): Promise<PendingListing> => {
      if (!demoMode) {
        // Live: persist and adopt the server's real record so the success
        // screen shows the persisted QPL ref and true status, not a
        // client-fabricated one. Invalidation (in the mutation) refreshes
        // GET /listings/mine; the dedup-by-ref merge prevents a double.
        const persisted = await createListing.mutateAsync(draftToDto(draft));
        if (persisted) {
          setLocal((prev) => [persisted, ...prev]);
          return persisted;
        }
      }
      // Demo: optimistic local record with a client-side sequence ref.
      const ref = makeRef(seq);
      const listing: PendingListing = {
        ...draft,
        ref,
        status: "review",
        slug: slugify(draft.name),
        submittedBy,
      };
      setLocal((prev) => [listing, ...prev]);
      setSeq((n) => n + 1);
      return listing;
    },
    [seq, demoMode, createListing],
  );

  const withdrawListing = useCallback(
    (ref: string) => {
      setLocal((prev) => prev.filter((l) => l.ref !== ref));
      if (!demoMode) {
        setWithdrawn((prev) => new Set(prev).add(ref));
        withdrawMutation.mutate(ref);
      }
    },
    [demoMode, withdrawMutation],
  );

  // Awaited, unlike withdrawListing: the ref is hidden only once the server
  // confirms, so a failed delete leaves the listing in place and the rejection
  // reaches the caller's own error UI.
  const deleteListing = useCallback(
    async (ref: string): Promise<void> => {
      if (!demoMode) {
        await deleteListingOnServer(ref);
        setWithdrawn((previousRefs) => new Set(previousRefs).add(ref));
      }
      setLocal((previousListings) =>
        previousListings.filter((listing) => listing.ref !== ref),
      );
    },
    [demoMode, deleteListingOnServer],
  );

  const value = useMemo(
    () => ({ local, withdrawn, addListing, withdrawListing, deleteListing }),
    [local, withdrawn, addListing, withdrawListing, deleteListing],
  );

  return (
    <DirectoryListingsContext.Provider value={value}>
      {children}
    </DirectoryListingsContext.Provider>
  );
}
