import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  deleteMyCard,
  getMyCards,
  updateMyCard,
  type MyCardDTO,
} from "./cards.api";
import { DEMO_MY_CARDS } from "../cards.data";

/** Every card the member holds, newest first. */
export function useMyCards(): { cards: MyCardDTO[]; isLoading: boolean } {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["my-cards", demoMode],
    enabled: !demoMode,
    queryFn: getMyCards,
  });

  if (demoMode) return { cards: DEMO_MY_CARDS, isLoading: false };
  return { cards: query.data ?? [], isLoading: query.isLoading };
}

/** Permanently removes one of the member's own cards from their wallet
 *  (spec §K.4). Irreversible — callers must confirm before calling this. */
export function useDeleteMyCard() {
  const client = useQueryClient();
  const { demoMode } = useDemoMode();
  return useMutation({
    mutationFn: (cardId: string) =>
      demoMode ? Promise.resolve({ ok: true as const }) : deleteMyCard(cardId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["my-cards"] });
    },
  });
}

/**
 * The member's veto over their own photo on one card they hold.
 *
 * Invalidates rather than patching the cache: the avatar itself is resolved
 * server-side behind both switches (see `MyCardDTO.holderAvatarUrl`), so the
 * client cannot compute the next state of the card on its own.
 */
export function useUpdateMyCard() {
  const client = useQueryClient();
  const { demoMode } = useDemoMode();
  return useMutation({
    mutationFn: ({
      cardId,
      isPhotoHidden,
    }: {
      cardId: string;
      isPhotoHidden: boolean;
    }) =>
      demoMode
        ? Promise.resolve({ ok: true as const })
        : updateMyCard(cardId, { isPhotoHidden }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["my-cards"] });
    },
  });
}
