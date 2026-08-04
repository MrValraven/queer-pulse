import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createDeck,
  deleteDeck,
  updateDeck,
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
      void queryClient.invalidateQueries({ queryKey: ["magazine-admin-decks"] });
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
      void queryClient.invalidateQueries({ queryKey: ["magazine-admin-decks"] });
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
      void queryClient.invalidateQueries({ queryKey: ["magazine-admin-decks"] });
      void queryClient.invalidateQueries({ queryKey: ["magazine-deck"] });
    },
  });
}
