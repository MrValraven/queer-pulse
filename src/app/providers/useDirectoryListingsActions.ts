import { createContext, useContext } from "react";
import {
  type ListingDraft,
  type PendingListing,
} from "../../features/marketing/listBusiness/listBusiness.data";

export interface DirectoryListingsActions {
  /** Demo: the full store. Live: session-local optimistic additions only. */
  local: PendingListing[];
  /** Live-only tombstones: refs withdrawn or deleted this session. */
  withdrawn: Set<string>;
  /** Persist a draft as a pending listing; returns the created record.
   *  Live: the server's real record (real ref/status/slug). Demo: an
   *  optimistic local record with a client-side ref. */
  addListing: (
    draft: ListingDraft,
    submittedBy: string,
  ) => Promise<PendingListing>;
  /** Remove a pending listing by reference. Fire-and-forget: hides the ref
   *  at once and lets the global error toast report a failed request. */
  withdrawListing: (ref: string) => void;
  /** Permanently delete a listing by reference, for `ListingDeleteFlow`.
   *  Live: awaits DELETE /listings/:ref and rejects on failure with no global
   *  toast (the caller shows its own error), then hides the ref locally the
   *  same way `withdrawListing` does. Demo: drops the local copy and
   *  resolves. */
  deleteListing: (ref: string) => Promise<void>;
}

export const DirectoryListingsContext =
  createContext<DirectoryListingsActions | null>(null);

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
