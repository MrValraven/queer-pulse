import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  leaveSubprofile,
  listSubprofileMembers,
  type MemberDTO,
} from "./subprofiles.api";

/** A persona's co-owners (creator + accepted invitees), for the owner-facing
 *  "manage co-owners" surface. Demo reads the mock registry by id; live calls
 *  GET /subprofiles/:id/members. Also exposes `leave`, the current member's own
 *  exit from a shared persona (the backend rejects it for the sole/last owner
 *  with a 409 whose message the caller should surface verbatim). */
export function useSubprofileMembers(id: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const query = useQuery<MemberDTO[]>({
    queryKey: ["subprofile-members", demoMode, id],
    enabled: Boolean(id),
    queryFn: async ({ signal }) => {
      if (!id) return [];
      if (demoMode) {
        const { mockPersonaMembers } = await import("../data/subprofiles.data");
        return mockPersonaMembers(id);
      }
      return listSubprofileMembers(id, signal);
    },
  });

  const leave = useMutation<{ ok: true }, Error, void>({
    // SubprofileOwnersPanel toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async () => {
      if (!id) throw new Error("Subprofile id required");
      if (!demoMode) return leaveSubprofile(id);
      return { ok: true };
    },
    onSuccess: () => {
      // Narrow, id-scoped invalidation — NOT the broad `["subprofile"]` prefix
      // (which matches every persona query app-wide). Leaving affects: the
      // owner dashboard/list (`["subprofiles"]` plural), this persona's owner
      // editor query (`["subprofile", demoMode, id]`), its public view
      // (viewerIsMember flips — `["subprofile","public"]`, keyed by handle/slug
      // not id so it can't be id-scoped), and the members list.
      void queryClient.invalidateQueries({ queryKey: ["subprofiles"] });
      if (id) {
        void queryClient.invalidateQueries({
          queryKey: ["subprofile", demoMode, id],
        });
      }
      void queryClient.invalidateQueries({
        queryKey: ["subprofile", "public"],
      });
      void queryClient.invalidateQueries({ queryKey: ["subprofile-members"] });
    },
  });

  return { ...query, leave };
}
