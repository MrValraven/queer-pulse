import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  updateArticleDraft,
  type ArticleDraftDto,
  type UpdateArticleDraftDto,
} from "./pieces.api";

/**
 * The article editor's single save path, dual-mode. `save` is meant to be
 * called by the editor's own debounce (Task 8 wires ~1.2s after a block/
 * title/standfirst change) — this hook just fires the mutation, it does not
 * debounce itself. Demo never touches the network (there's nowhere to
 * persist to) and resolves silently — unlike `useRecordMutations`'s
 * explicit-action mutations, this fires on every autosave tick (~1.2s of
 * pause), and the editor header already renders the save status ("All
 * changes saved"/"Saving…"), so a toast per tick would be redundant and
 * spammy. Live calls `PATCH /magazine/admin/pieces/:id/article` then
 * invalidates this piece's `useArticleDraft` cache.
 */
export function useArticleMutations(pieceId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const save = useMutation<ArticleDraftDto | null, Error, UpdateArticleDraftDto>({
    mutationFn: async (body) => {
      if (demoMode) {
        return null;
      }
      return updateArticleDraft(pieceId, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["magazine-article-draft", pieceId] });
    },
  });

  return { save };
}
