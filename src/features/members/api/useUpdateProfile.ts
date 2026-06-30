import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { updateProfile, type UpdateProfileDTO } from "./members.api";

/**
 * Save edits to the logged-in member's own profile. In demo mode this is a
 * no-op (the ProfileProvider keeps the change in local state); in live mode it
 * PATCHes /profiles/me and refreshes any cached profile/directory views.
 */
export function useUpdateProfile() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateProfileDTO>({
    mutationFn: async (dto) => {
      if (demoMode) return;
      await updateProfile(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
