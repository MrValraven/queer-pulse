import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getMyFlatmateProfile,
  type FlatmateProfileDTO,
} from "./flatmateProfile.api";

/** The caller's own flatmate profile (raw DTO — the post-profile form prefills
 * from it). Demo has no "my profile" concept → null. */
export function useMyFlatmateProfile() {
  const { demoMode } = useDemoMode();
  return useQuery<FlatmateProfileDTO | null>({
    queryKey: ["my-flatmate-profile", demoMode],
    initialData: demoMode ? null : undefined,
    queryFn: async () => {
      if (demoMode) return null;
      return getMyFlatmateProfile();
    },
  });
}
