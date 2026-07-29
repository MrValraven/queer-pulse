import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createLandlord,
  type CreateLandlordBody,
  type LandlordDetailDTO,
} from "./landlord.api";

/** POST /landlords. Demo fakes a short "sending…" beat with no network; live
 * creates the landlord (→ review) and invalidates the board list. */
export function useSuggestLandlord() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<LandlordDetailDTO | null, Error, CreateLandlordBody>({
    // SuggestLandlordModal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return null;
      }
      return createLandlord(body);
    },
    onSuccess: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: ["landlords"] });
      }
    },
  });
}
