import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  deleteMyFlatmateProfile,
  type FlatmateProfileDTO,
} from "./flatmateProfile.api";

/**
 * DELETE /flatmate-profiles/mine — the member takes their own flatmate profile
 * down. Demo fakes success (demo has no "my profile" concept, so nothing is
 * read from the mock registry and no request is made).
 *
 * Mirrors `useUpsertFlatmateProfile`: `meta.silentError` because the caller
 * (`FlatmateProfileDangerZone`) owns the failure UI, and the same two query
 * keys are invalidated. It additionally writes `null` into the "do I have a
 * profile?" cache first, so the board and the editor read "no profile" on the
 * very next render rather than after the refetch lands. Neither read path sets
 * a stale-while-revalidate cache header, so invalidation is enough.
 */
export function useDeleteFlatmateProfile() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    meta: { silentError: true },
    mutationFn: async () => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return;
      }
      await deleteMyFlatmateProfile();
    },
    onSuccess: () => {
      if (demoMode) return;
      queryClient.setQueryData<FlatmateProfileDTO | null>(
        ["my-flatmate-profile", demoMode],
        null,
      );
      void queryClient.invalidateQueries({
        queryKey: ["my-flatmate-profile"],
      });
      void queryClient.invalidateQueries({ queryKey: ["flatmate-profiles"] });
    },
  });
}
