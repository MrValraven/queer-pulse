import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { publishDeck, type PublishDeckDto } from "./deckAdmin.api";
import {
  convertDeckToArticle,
  createDeck,
  deleteDeck,
  updateDeck,
  type ConvertDeckToArticleDto,
  type CreateDeckDto,
  type UpdateDeckDto,
} from "./magazine.api";

/**
 * Each mutation branches on `demoMode`: demo is a no-op (the deck editor keeps
 * its own local draft state — there's no backend to persist to), and live
 * calls the admin decks API then invalidates the affected query keys. Demo
 * mode never hits the network. Mirrors `economy/api/useJobMutations.ts`.
 */

/** POST /magazine/admin/decks — create a draft deck. */
export function useCreateDeck() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<{ id: string; slug: string }, Error, CreateDeckDto>({
    // DeckEditorPage toasts its own result on the mutateAsync call; silence
    // the global MutationCache handler's duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) return { id: "demo", slug: dto.slug };
      const deck = await createDeck(dto);
      return { id: deck.id, slug: deck.slug };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["magazine-admin-decks"],
      });
    },
  });
}

/** PATCH /magazine/admin/decks/:id — update metadata/slides/publish state. */
export function useUpdateDeck() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    { id: string; slug: string },
    Error,
    { id: string; dto: UpdateDeckDto }
  >({
    meta: { silentError: true },
    mutationFn: async ({ id, dto }) => {
      if (demoMode) return { id, slug: dto.slug ?? "" };
      const deck = await updateDeck(id, dto);
      return { id: deck.id, slug: deck.slug };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["magazine-admin-decks"],
      });
      void queryClient.invalidateQueries({ queryKey: ["magazine-deck"] });
    },
  });
}

/**
 * PATCH /magazine/admin/decks/:id carrying the richer publish control
 * (PRD-131): an ISO instant publishes or schedules, `null` unpublishes. Kept
 * apart from `useUpdateDeck` because that hook is the plain save the autosave
 * loop fires many times a session, while this one is the explicit,
 * server-gated act that changes what readers can see.
 */
export function usePublishDeck() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    { id: string; publishedAt: string | null },
    Error,
    { id: string; dto: PublishDeckDto }
  >({
    meta: { silentError: true },
    mutationFn: async ({ id, dto }) => {
      if (demoMode) return { id, publishedAt: dto.publishedAt ?? null };
      const deck = await publishDeck(id, dto);
      return { id: deck.id, publishedAt: deck.publishedAt };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["magazine-admin-decks"],
      });
      void queryClient.invalidateQueries({ queryKey: ["magazine-deck"] });
    },
  });
}

/** DELETE /magazine/admin/decks/:id — remove a deck. */
export function useDeleteDeck() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    meta: { silentError: true },
    mutationFn: async (id) => {
      if (demoMode) return;
      await deleteDeck(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["magazine-admin-decks"],
      });
      void queryClient.invalidateQueries({ queryKey: ["magazine-deck"] });
    },
  });
}

/** POST /magazine/admin/decks/:id/convert-to-article — CNT-6 "Convert": a
 *  one-way, one-time transform of the deck into an article draft. Demo mode
 *  has no deck→piece link to resolve (the deck editor's own local draft
 *  state is all there is), so it fabricates a stable fake piece id — the
 *  article editor's demo fixture is a single fixed record regardless of id
 *  (see `useArticleDraft`'s doc comment), so this still lands somewhere real. */
export function useConvertDeckToArticle() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<ConvertDeckToArticleDto, Error, string>({
    meta: { silentError: true },
    mutationFn: async (id) => {
      if (demoMode)
        return { pieceId: "demo", articleId: "demo", droppedSlideKinds: [] };
      return convertDeckToArticle(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["magazine-admin-decks"],
      });
      void queryClient.invalidateQueries({ queryKey: ["magazine-deck"] });
    },
  });
}
