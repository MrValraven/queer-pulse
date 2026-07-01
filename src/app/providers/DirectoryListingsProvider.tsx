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

/** Session store for member-submitted directory listings (pending review). */
export function DirectoryListingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [submitted, setSubmitted] = useState<PendingListing[]>([]);
  const [seq, setSeq] = useState(7);

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
      setSubmitted((prev) => [listing, ...prev]);
      setSeq((n) => n + 1);
      return listing;
    },
    [seq],
  );

  const withdrawListing = useCallback((ref: string) => {
    setSubmitted((prev) => prev.filter((l) => l.ref !== ref));
  }, []);

  const setStatus = useCallback((ref: string, status: ListingStatus) => {
    setSubmitted((prev) =>
      prev.map((l) => (l.ref === ref ? { ...l, status } : l)),
    );
  }, []);

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
