import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getCardHolders,
  replaceCardCode,
  setCardHolderStatus,
  type IssuerCardDTO,
} from "./cards.api";
import { DEMO_CARD_HOLDERS } from "../cards.data";

export interface CardHoldersResult {
  holders: IssuerCardDTO[];
  isLoading: boolean;
  /** True when the request failed, so the issuer panel can say so instead of
   *  reporting that the programme has no holders (DES-22). */
  isError: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

/**
 * Every card this community has issued. `isError` is surfaced rather than
 * swallowed: an outage and a programme nobody has joined yet both used to
 * arrive as the same empty array, and an owner would read the first as the
 * second.
 */
export function useCardHolders(slug: string | undefined): CardHoldersResult {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["card-holders", slug, demoMode],
    enabled: !demoMode && Boolean(slug),
    queryFn: () => getCardHolders(slug!),
  });

  if (demoMode) {
    return {
      holders: DEMO_CARD_HOLDERS,
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }
  return {
    holders: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
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
