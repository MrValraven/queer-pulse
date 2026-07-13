import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  makeRef,
  slugify,
  type ListingDraft,
  type ListingStatus,
  type PendingListing,
} from "../../features/marketing/listBusiness/listBusiness.data";
import {
  useListingMutations,
  useMyListings,
} from "../../features/marketing/listBusiness/api/useListings";
import { useDemoMode } from "./DemoModeProvider";

interface DirectoryListingsContextValue {
  /** Listings submitted this session, newest first. */
  submitted: PendingListing[];
  /** Persist a draft as a pending listing; returns the created record. */
  addListing: (draft: ListingDraft, submittedBy: string) => PendingListing;
  /** Remove a pending listing by reference. */
  withdrawListing: (ref: string) => void;
  /** Move a listing along its review status (used by the prototype flip). */
  setStatus: (ref: string, status: ListingStatus) => void;
}

const DirectoryListingsContext =
  createContext<DirectoryListingsContextValue | null>(null);

/**
 * Store for member-submitted directory listings (pending review).
 *
 * Demo mode is byte-for-byte the original behaviour: a local `useState` array
 * plus a `seq` counter is the whole source of truth, and nothing touches the
 * network. Live mode hydrates from GET /listings/mine and layers session-local
 * optimistic additions on top, so `addListing` can still return synchronously
 * while the create mutation lands and invalidation refreshes the server list.
 */
export function DirectoryListingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { demoMode } = useDemoMode();
  const { items: serverItems } = useMyListings().data ?? {
    items: [],
    total: 0,
  };
  const { createListing, withdrawListing: withdrawMutation } =
    useListingMutations();

  // Demo: the full store. Live: session-local optimistic additions only.
  const [local, setLocal] = useState<PendingListing[]>([]);
  const [seq, setSeq] = useState(7);
  // Live: refs withdrawn this session, so a server row disappears immediately
  // (before the invalidated GET /listings/mine refetch lands).
  const [withdrawn, setWithdrawn] = useState<Set<string>>(() => new Set());

  const addListing = useCallback(
    (draft: ListingDraft, submittedBy: string) => {
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
      // Live: persist to the backend; invalidation refreshes the server list.
      // The returned record above is the caller's synchronous optimistic copy.
      if (!demoMode) createListing.mutate(draft);
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

  const setStatus = useCallback((ref: string, status: ListingStatus) => {
    // Demo: flip the local status as the prototype does. Live: no-op —
    // moderation is server-only via PATCH /listings/:ref/status; members
    // cannot self-transition their own listings.
    setLocal((prev) => prev.map((l) => (l.ref === ref ? { ...l, status } : l)));
  }, []);

  const submitted = useMemo<PendingListing[]>(() => {
    if (demoMode) return local;
    // Live: optimistic additions first, then server rows, deduped by ref and
    // with anything withdrawn this session filtered out.
    const seen = new Set<string>();
    const merged: PendingListing[] = [];
    for (const l of [...local, ...serverItems]) {
      if (withdrawn.has(l.ref) || seen.has(l.ref)) continue;
      seen.add(l.ref);
      merged.push(l);
    }
    return merged;
  }, [demoMode, local, serverItems, withdrawn]);

  const value = useMemo(
    () => ({ submitted, addListing, withdrawListing, setStatus }),
    [submitted, addListing, withdrawListing, setStatus],
  );

  return (
    <DirectoryListingsContext.Provider value={value}>
      {children}
    </DirectoryListingsContext.Provider>
  );
}

export function useDirectoryListings(): DirectoryListingsContextValue {
  const ctx = useContext(DirectoryListingsContext);
  if (!ctx) {
    throw new Error(
      "useDirectoryListings must be used within a DirectoryListingsProvider",
    );
  }
  return ctx;
}
