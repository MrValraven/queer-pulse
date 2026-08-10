import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  fileDraft as sendFileDraft,
  submitPitch as sendSubmitPitch,
  updateMyByline as sendUpdateMyByline,
  type SubmitWriterPitchDto,
  type UpdateWriterBylineDto,
  type WriterAssignmentDto,
  type WriterPitchDto,
} from "./writerWorkspace.api";

/**
 * Writer-workspace mutations for `WriterWorkspacePage` (pitching, choosing a
 * byline, filing a draft), dual-mode. Demo never touches the network — each
 * mutation resolves immediately with a toast describing what would have
 * happened (the page keeps rendering the static `DEMO_WRITER` fixture). Live
 * calls the matching `magazine/writer` endpoint, then invalidates every
 * `useWriterWorkspace` query so the workspace reflects the change. Mirrors
 * `useRecordMutations.ts`.
 */
export function useWriterMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  function invalidateWorkspace(): void {
    void queryClient.invalidateQueries({ queryKey: ["magazine-writer"] });
  }

  /** POST /magazine/writer/pitches — pitch a new idea. */
  const submitPitch = useMutation<
    WriterPitchDto | null,
    Error,
    SubmitWriterPitchDto
  >({
    mutationFn: async (body) => {
      if (demoMode) {
        showToast("Pitch sent", "success");
        return null;
      }
      return sendSubmitPitch(body);
    },
    onSuccess: invalidateWorkspace,
  });

  /** PATCH /magazine/writer/pieces/:id/byline — choose the byline for a piece. */
  const updateByline = useMutation<
    WriterAssignmentDto | null,
    Error,
    { pieceId: string; body: UpdateWriterBylineDto }
  >({
    mutationFn: async ({ pieceId, body }) => {
      if (demoMode) {
        showToast("Byline updated", "success");
        return null;
      }
      return sendUpdateMyByline(pieceId, body);
    },
    onSuccess: invalidateWorkspace,
  });

  /** POST /magazine/writer/pieces/:id/file — file a draft for review. */
  const fileDraft = useMutation<WriterAssignmentDto | null, Error, string>({
    mutationFn: async (pieceId) => {
      if (demoMode) {
        showToast("Draft filed", "success");
        return null;
      }
      return sendFileDraft(pieceId);
    },
    onSuccess: invalidateWorkspace,
  });

  return { submitPitch, updateByline, fileDraft };
}
