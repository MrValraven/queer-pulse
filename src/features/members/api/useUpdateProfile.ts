import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  updateProfile,
  type ProfileDTO,
  type UpdateProfileDTO,
} from "./members.api";

/**
 * Save edits to the logged-in member's own profile. In demo mode this is a
 * no-op (the ProfileProvider keeps the change in local state) and resolves to
 * `undefined`; in live mode it PATCHes /profiles/me, refreshes any cached
 * profile/directory views, and resolves to the saved `ProfileDTO` — the caller
 * needs this to read back server-computed fields such as `avatarUrl`, which
 * the backend turns from a storage key into a fetchable files URL.
 */
export function useUpdateProfile() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<ProfileDTO | undefined, Error, UpdateProfileDTO>({
    mutationFn: async (dto) => {
      if (demoMode) return undefined;
      return updateProfile(dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
