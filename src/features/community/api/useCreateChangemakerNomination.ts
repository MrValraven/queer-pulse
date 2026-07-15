import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createChangemakerNomination,
  type ChangemakerNominationResponseDTO,
  type CreateChangemakerNominationDto,
} from "./community.api";

/**
 * POST /changemakers/nominations — the Change Makers page's "Nominate them"
 * form.
 *
 * Demo mode keeps the prototype's instant simulated success toast. Live mode
 * calls the API (mirrors `useCreateCommissionInterest`'s demo/live split) so
 * the nomination actually reaches the team curating the directory.
 */
export function useCreateChangemakerNomination() {
  const { demoMode } = useDemoMode();
  return useMutation<
    ChangemakerNominationResponseDTO | null,
    Error,
    CreateChangemakerNominationDto
  >({
    mutationFn: async (dto) => {
      if (demoMode) {
        return null;
      }
      return createChangemakerNomination(dto);
    },
  });
}
