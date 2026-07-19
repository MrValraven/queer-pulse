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
import { useListingMutations } from "../../features/marketing/listBusiness/api/useListings";
import { useDemoMode } from "./DemoModeProvider";

interface DirectoryListingsActions {
  /** Demo: the full store. Live: session-local optimistic additions only. */
  local: PendingListing[];
  /** Live-only tombstones: refs withdrawn this session. */
  withdrawn: Set<string>;
  /** Persist a draft as a pending listing; returns the created record. */
  addListing: (draft: ListingDraft, submittedBy: string) => PendingListing;
  /** Remove a pending listing by reference. */
  withdrawListing: (ref: string) => void;
  /** Move a listing along its review status (used by the prototype flip). */
  setStatus: (ref: string, status: ListingStatus) => void;
}

const DirectoryListingsContext = createContext<DirectoryListingsActions | null>(
  null,
);

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

  const value = useMemo(
    () => ({ local, withdrawn, addListing, withdrawListing, setStatus }),
    [local, withdrawn, addListing, withdrawListing, setStatus],
  );

  return (
    <DirectoryListingsContext.Provider value={value}>
      {children}
    </DirectoryListingsContext.Provider>
  );
}

/**
 * Overlay state + mutators only. **No query subscription** — a consumer that
 * only writes (ListBusinessPage) must use this, not `useDirectoryListings`,
 * or it re-subscribes GET /listings/mine and reintroduces the eager request
 * this refactor removed. Nothing visibly breaks if you get this wrong; only
 * `src/test/requestBudget.test.tsx` catches it.
 */
export function useDirectoryListingsActions(): DirectoryListingsActions {
  const ctx = useContext(DirectoryListingsContext);
  if (!ctx) {
    throw new Error(
      "useDirectoryListingsActions must be used within a DirectoryListingsProvider",
    );
  }
  return ctx;
}
