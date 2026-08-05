import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  submitSafeSpaceNomination,
  type CreateSafeSpaceNominationBody,
  type SafeSpaceNominationDTO,
} from "./safeSpaces.api";

/**
 * POST /safe-space-nominations — nominate a place for a safe-space review.
 *
 * Dual-mode: demo keeps the prototype's short "sending…" beat with no network
 * (so the static tour still shows the thank-you panel), while live records the
 * nomination in the moderation queue. Returns `null` in demo so callers can
 * treat both the same.
 */
export function useSubmitNomination() {
  const { demoMode } = useDemoMode();
  return useMutation<
    SafeSpaceNominationDTO | null,
    Error,
    CreateSafeSpaceNominationBody
  >({
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        return null;
      }
      return submitSafeSpaceNomination(body);
    },
  });
}
