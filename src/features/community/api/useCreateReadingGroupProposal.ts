import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createReadingGroupProposal,
  type CreateReadingGroupProposalDto,
  type ReadingGroupProposalResponseDTO,
} from "./community.api";

/**
 * POST /reading-groups/proposals — `ListGroupStrip`'s "List my group".
 *
 * Demo mode keeps the prototype's instant simulated success (the strip
 * already builds a client-side `Group` to prepend to the directory). Live
 * mode calls the API (mirrors `useCreateCommissionInterest`'s demo/live
 * split) so the proposal actually reaches the team that matches readers.
 */
export function useCreateReadingGroupProposal() {
  const { demoMode } = useDemoMode();
  return useMutation<
    ReadingGroupProposalResponseDTO | null,
    Error,
    CreateReadingGroupProposalDto
  >({
    mutationFn: async (dto) => {
      if (demoMode) {
        return null;
      }
      return createReadingGroupProposal(dto);
    },
  });
}
