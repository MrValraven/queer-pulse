import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getDrafts, dtoToDraft } from "./drafts.api";
import type { Draft } from "../drafts.data";

/**
 * The member's server-side drafts (`GET /me/drafts`), page 1.
 *
 * This was a keyless `useEffect` + promise inside `DraftsProvider`, which fired
 * on every route whether or not anything read it. As a query it fires on first
 * subscribe instead — i.e. when `useDrafts()` mounts — and write-only consumers
 * that call `useDraftsActions()` never trigger it at all.
 *
 * Returns adapted `Draft`s rather than DTOs so the provider's store type never
 * changes. Note `dtoToDraft` rebuilds `meta`/`actions` as empty arrays: those
 * are `ReactNode` and don't survive the wire (see `drafts.api.ts`). That loss is
 * pre-existing behaviour, carried over deliberately and unchanged.
 *
 * `staleTime: Infinity` + no invalidation anywhere = hydrate once per session,
 * exactly like the effect it replaces. A refetch would overwrite the local store
 * wholesale and could clobber an in-flight optimistic add/remove.
 *
 * No `language` in the key: `dtoToDraft` is pure and never touches `t`/`fmt`,
 * so cached data can't go stale across a language switch.
 */
export function useMyDrafts() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  return useQuery<Draft[]>({
    queryKey: ["myDrafts", demoMode],
    // Both halves of the gate can open: `demoMode` is false whenever
    // VITE_API_URL is set, and `loggedIn` flips true once /auth/me resolves.
    enabled: !demoMode && loggedIn,
    staleTime: Infinity,
    retry: false,
    // The effect this replaces swallowed its error ("unauthorized / offline —
    // keep the cached local list"). Without this, the app-wide QueryCache
    // onError would start toasting a 5xx here that the member never provoked.
    meta: { silentError: true },
    queryFn: async () => {
      // Demo mode must never touch the network. Unreachable while `enabled`
      // holds, but kept as the second gate every hook in this directory has.
      if (demoMode) return [];
      const res = await getDrafts();
      return res.items.map(dtoToDraft);
    },
  });
}
