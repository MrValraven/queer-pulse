import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  fileDraft as sendFileDraft,
  submitPitch as sendSubmitPitch,
  updateMyByline as sendUpdateMyByline,
  type FileDraftBody,
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
  const { t } = useTranslation();

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
        showToast(t("magazine:writer.pitches.sentToast"), "success");
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
        showToast(t("magazine:writer.byline.updatedToast"), "success");
        return null;
      }
      return sendUpdateMyByline(pieceId, body);
    },
    onSuccess: invalidateWorkspace,
  });

  /** POST /magazine/writer/pieces/:id/file — file a draft for review.
   *  `body.blocks`, when present, is a whole pasted draft already converted to
   *  paragraph blocks (`FileDraftModal`'s data-loss fix), written into the
   *  article draft before the piece advances stage.
   *
   *  `body.mode` picks how: `append` (the default, and what older clients get
   *  by omitting it) adds only the paragraphs the draft does not already end
   *  with, so refiling the same text is a true no-op rather than doubling the
   *  article; `replace` swaps the body wholesale, snapshotting the previous
   *  one as an article version first. `body.expectedVersion` is the version
   *  the writer last read, so a filing answers 409 rather than overwriting an
   *  editor who saved in the meantime. */
  const fileDraft = useMutation<
    WriterAssignmentDto | null,
    Error,
    { pieceId: string; body?: FileDraftBody }
  >({
    mutationFn: async ({ pieceId, body }) => {
      if (demoMode) {
        showToast(t("magazine:writer.fileDraft.filedToast"), "success");
        return null;
      }
      return sendFileDraft(pieceId, body);
    },
    onSuccess: invalidateWorkspace,
  });

  return { submitPitch, updateByline, fileDraft };
}
