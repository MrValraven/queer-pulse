import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { endorseSubprofile, withdrawEndorsement } from "./subprofiles.api";

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
 * so it stays consistent with `mockPublicByHandle`/`mockEndorsersById` reads
 * (a purely local count nudge here would get overwritten by the very
 * invalidate-triggered refetch below). Both branches invalidate the persona
 * public query + this persona's endorsers list on success so the hero control
 * and avatar cluster refetch.
 */
export function useEndorsement(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["subprofile"] });
    void queryClient.invalidateQueries({
      queryKey: ["subprofile", "endorsers", subprofileId],
    });
  };

  const endorse = useMutation<EndorsementResult, Error, EndorseVariables>({
    // SubprofileEndorse toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ currentEndorsementCount, note }) => {
      if (demoMode) {
        const { mockSetEndorsed } = await import("../data/subprofiles.data");
        return (
          mockSetEndorsed(subprofileId, true) ?? {
            endorsementCount: currentEndorsementCount + 1,
            viewerEndorsed: true,
          }
        );
      }
      return endorseSubprofile(subprofileId, note);
    },
    onSuccess: invalidate,
  });

  const withdraw = useMutation<EndorsementResult, Error, WithdrawVariables>({
    // SubprofileEndorse toasts its own error, so silence the global duplicate.
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
    onSuccess: invalidate,
  });

  return { endorse, withdraw };
}
