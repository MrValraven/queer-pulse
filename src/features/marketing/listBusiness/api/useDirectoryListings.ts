import { useMemo } from "react";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useDirectoryListingsActions } from "../../../../app/providers/DirectoryListingsProvider";
import type { PendingListing } from "../listBusiness.data";
import { useMyListings } from "./useListings";

/**
 * The member's submitted listings: the app-wide optimistic overlay layered
 * over the server list, newest first.
 *
 * Subscribing to `useMyListings` here — rather than in
 * `DirectoryListingsProvider` — is the entire point: react-query fetches on
 * first subscribe, so GET /listings/mine now fires when a reader mounts
 * (PlacesSection, on /account/profile) instead of on every route.
 *
 * Read-only consumers use this. Write-only consumers MUST use
 * `useDirectoryListingsActions` instead — calling this hook to reach the
 * mutators would re-subscribe the query and undo the fix.
 *
 * Page 1 only, as before: `useMyListings()` defaults to `page = 1` and this
 * surface has never paginated.
 */
export function useDirectoryListings() {
  const { demoMode } = useDemoMode();
  const { local, withdrawn, addListing, withdrawListing, setStatus } =
    useDirectoryListingsActions();
  const { items: serverItems } = useMyListings().data ?? {
    items: [],
    total: 0,
  };

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

  return { submitted, addListing, withdrawListing, setStatus };
}
