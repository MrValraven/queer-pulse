import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  upsertFlatmateProfile,
  type FlatmateProfileDTO,
  type UpsertFlatmateProfileBody,
} from "./flatmateProfile.api";

/** PUT /flatmate-profiles/mine (create-or-replace). Demo fakes success. */
export function useUpsertFlatmateProfile() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    FlatmateProfileDTO | null,
    Error,
    UpsertFlatmateProfileBody
  >({
    // PostProfileModal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return null;
      }
      return upsertFlatmateProfile(body);
    },
    onSuccess: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: ["flatmate-profiles"] });
        void queryClient.invalidateQueries({
          queryKey: ["my-flatmate-profile"],
        });
      }
    },
  });
}
