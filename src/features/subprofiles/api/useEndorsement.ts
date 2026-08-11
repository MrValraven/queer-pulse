import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  endorseSubprofile,
  getMyEndorsement,
  withdrawEndorsement,
  type MyEndorsementDTO,
} from "./subprofiles.api";
import type { PublicSubprofileOutcome } from "./usePublicSubprofile";

/** Result shape shared by the endorse and withdraw endpoints. */
export interface EndorsementResult {
  endorsementCount: number;
  viewerEndorsed: boolean;
}

export interface EndorseVariables {
  note?: string;
  /** The view's current count — only used as a demo-branch fallback if the
   *  persona somehow isn't in the mock registry. Ignored in live mode; the
   *  API is authoritative. */
  currentEndorsementCount: number;
}

export interface WithdrawVariables {
  currentEndorsementCount: number;
}

/**
 * Endorse/withdraw mutations for one persona, keyed on its `id` (the endorse
 * routes key on the non-identifying persona id, never slug/handle). Mirrors
 * the demo/live branch in `useSubprofileMutations`: live calls the API; demo
 * flips the shared in-memory `DEMO_SUBPROFILES` state via `mockSetEndorsed`,
 * so it stays consistent with `resolvePublicAccessDemo`/`mockEndorsersById`
 * reads (a purely local count nudge here would get overwritten by the very
 * invalidate-triggered refetch below). The SAME `endorse` mutation backs both
 * a first endorse and a later note edit — re-endorsing with a new note updates
 * the note in place (backend + demo), never firing a duplicate event/count.
 * Both branches invalidate the persona public query + this persona's endorsers
 * list + the viewer's own endorsement prefill on success so the hero control,
 * avatar cluster, and edit modal all re-read fresh.
 */
export function useEndorsement(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  // Patch the persona's public query cache in place with the AUTHORITATIVE
  // `{endorsementCount, viewerEndorsed}` the endpoint returns, instead of
  // invalidating + refetching it (which flickered the count between the stale
  // and fresh values). The public query is keyed by handle/slug + viewer, not
  // by this persona `id`, so we scan the whole `["subprofile","public"]` family
  // via `setQueriesData` and patch only the entry whose cached DTO carries this
  // `id`. Works identically in demo mode (same `EndorsementResult` shape). The
  // endorsers LIST and the viewer's own-endorsement prefill still need a
  // refetch — the count-only mutation result can't reconstruct a new endorser
  // row or the saved note — so those stay narrow, id-scoped invalidations.
  const settle = (result: EndorsementResult) => {
    queryClient.setQueriesData<PublicSubprofileOutcome>(
      { queryKey: ["subprofile", "public"] },
      (prev) =>
        prev && prev.state === "ok" && prev.data.id === subprofileId
          ? {
              ...prev,
              data: {
                ...prev.data,
                endorsementCount: result.endorsementCount,
                viewerEndorsed: result.viewerEndorsed,
              },
            }
          : prev,
    );
    void queryClient.invalidateQueries({
      queryKey: ["subprofile", "endorsers", subprofileId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["subprofile", "my-endorsement", subprofileId],
    });
  };

  const endorse = useMutation<EndorsementResult, Error, EndorseVariables>({
    // The endorse modal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ currentEndorsementCount, note }) => {
      if (demoMode) {
        const { mockSetEndorsed } = await import("../data/subprofiles.data");
        return (
          mockSetEndorsed(subprofileId, true, note) ?? {
            endorsementCount: currentEndorsementCount + 1,
            viewerEndorsed: true,
          }
        );
      }
      return endorseSubprofile(subprofileId, note);
    },
    onSuccess: settle,
  });

  const withdraw = useMutation<EndorsementResult, Error, WithdrawVariables>({
    // The endorse modal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ currentEndorsementCount }) => {
      if (demoMode) {
        const { mockSetEndorsed } = await import("../data/subprofiles.data");
        return (
          mockSetEndorsed(subprofileId, false) ?? {
            endorsementCount: Math.max(0, currentEndorsementCount - 1),
            viewerEndorsed: false,
          }
        );
      }
      return withdrawEndorsement(subprofileId);
    },
    onSuccess: settle,
  });

  return { endorse, withdraw };
}

/**
 * The current viewer's own endorsement of a persona (`viewerEndorsed` + their
 * saved note), lazily fetched to prefill the endorse modal in EDIT mode only —
 * pass `enabled: false` in create mode so it never fires. Live reads
 * `GET /subprofiles/:id/endorsement/mine`; demo reads the same in-memory state
 * `mockSetEndorsed` writes, so an edit shows the previously-entered note.
 */
export function useMyEndorsement(
  subprofileId: string,
  { enabled }: { enabled: boolean },
) {
  const { demoMode } = useDemoMode();
  return useQuery<MyEndorsementDTO>({
    queryKey: ["subprofile", "my-endorsement", subprofileId],
    queryFn: async ({ signal }) => {
      if (!demoMode) return getMyEndorsement(subprofileId, signal);
      const { mockMyEndorsement } = await import("../data/subprofiles.data");
      return (
        mockMyEndorsement(subprofileId) ?? { viewerEndorsed: false, note: null }
      );
    },
    enabled: enabled && Boolean(subprofileId),
  });
}
