import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getCardHolders,
  replaceCardCode,
  setCardHolderStatus,
  type IssuerCardDTO,
} from "./cards.api";
import { DEMO_CARD_HOLDERS } from "../cards.data";

export function useCardHolders(slug: string | undefined): {
  holders: IssuerCardDTO[];
  isLoading: boolean;
} {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["card-holders", slug, demoMode],
    enabled: !demoMode && Boolean(slug),
    queryFn: () => getCardHolders(slug!),
  });

  if (demoMode) return { holders: DEMO_CARD_HOLDERS, isLoading: false };
  return { holders: query.data ?? [], isLoading: query.isLoading };
}

export function useSetCardHolderStatus(slug: string | undefined) {
  const client = useQueryClient();
  const { demoMode } = useDemoMode();
  return useMutation({
    mutationFn: (input: {
      cardId: string;
      status: "active" | "suspended" | "revoked";
      reason?: string;
    }) =>
      demoMode
        ? Promise.resolve({ ok: true as const })
        : setCardHolderStatus(slug!, input.cardId, {
            status: input.status,
            reason: input.reason,
          }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["card-holders", slug] });
    },
  });
}

/**
 * Moves one card's code to a new generation, which voids every printed copy
 * of it. Nothing else about the card changes, so the holder's digital card
 * keeps working and simply starts showing the new code.
 */
export function useReplaceCardCode(slug: string | undefined) {
  const client = useQueryClient();
  const { demoMode } = useDemoMode();
  return useMutation({
    mutationFn: (input: { cardId: string }) =>
      demoMode
        ? Promise.resolve({ ok: true as const })
        : replaceCardCode(slug!, input.cardId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["card-holders", slug] });
    },
  });
}
