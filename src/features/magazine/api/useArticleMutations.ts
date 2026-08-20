import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  publishArticle,
  updateArticleDraft,
  type ArticleDraftDto,
  type PublishArticleDto,
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
 *
 * `publish` is the explicit, user-triggered counterpart (CNT-1 fix) — mirrors
 * the deck editor's `useUpdateDeck`/`handleTogglePublish` pair, but hits the
 * dedicated `PATCH .../article/publish` route (`publishArticle`) rather than
 * `updateArticleDraft`, since `UpdateArticleDto` has no publish field of its
 * own. Unlike `save` it writes the response straight into the
 * `useArticleDraft` cache (rather than only invalidating) so the header/
 * rail's Publish/Unpublish relabel and disabled state flip the instant the
 * request resolves, with no extra refetch round trip. Demo mode resolves to
 * `null` (nowhere to persist to, same as `save`) — the caller decides what to
 * show for that case.
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
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["magazine-article-draft", pieceId] });
      // A title edit also syncs server-side onto `MagazinePiece.title` (and
      // can regenerate the draft's slug) — invalidate the piece list/record
      // caches too, or the command palette/piece board/piece record keep
      // showing the stale commission-time title.
      if (variables.title !== undefined) {
        void queryClient.invalidateQueries({ queryKey: ["magazine-pieces"] });
        void queryClient.invalidateQueries({ queryKey: ["magazine-piece", pieceId] });
      }
    },
  });

  const publish = useMutation<ArticleDraftDto | null, Error, PublishArticleDto>({
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        return null;
      }
      return publishArticle(pieceId, body);
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(["magazine-article-draft", pieceId, demoMode], data);
      }
      void queryClient.invalidateQueries({ queryKey: ["magazine-article-draft", pieceId] });
    },
  });

  return { save, publish };
}
