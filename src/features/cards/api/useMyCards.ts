import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  deleteMyCard,
  getMyCards,
  renewMyCard,
  updateMyCard,
  type MyCardDTO,
  type RenewedCardDTO,
} from "./cards.api";
import { DEMO_MY_CARDS } from "../cards.data";

export interface MyCardsResult {
  cards: MyCardDTO[];
  isLoading: boolean;
  /** True when the request failed, so the wallet can say so instead of
   *  telling the member they hold no cards (DES-22). */
  isError: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

/**
 * Every card the member holds, newest first.
 *
 * `isError` is part of the contract because a failed fetch here used to land
 * in the same empty array as a successful one: a member opening their wallet
 * during an outage was told their community had never issued them a card.
 * Callers must branch on it before rendering the empty state.
 */
export function useMyCards(): MyCardsResult {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["my-cards", demoMode],
    enabled: !demoMode,
    queryFn: getMyCards,
  });

  if (demoMode) {
    return {
      cards: DEMO_MY_CARDS,
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }
  return {
    cards: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
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
 * The vetoes a member holds over their own card: their photo and their
 * pronouns. Either may be sent on its own, and an omitted one is left alone.
 *
 * Invalidates rather than patching the cache: both values are resolved
 * server-side behind two switches each (see `MyCardDTO.holderAvatarUrl` and
 * `holderPronouns`), so the client cannot compute the next state of the card
 * on its own.
 */
export function useUpdateMyCard() {
  const client = useQueryClient();
  const { demoMode } = useDemoMode();
  return useMutation({
    mutationFn: ({
      cardId,
      ...settings
    }: {
      cardId: string;
      isPhotoHidden?: boolean;
      isPronounsHidden?: boolean;
    }) =>
      demoMode
        ? Promise.resolve({ ok: true as const })
        : updateMyCard(cardId, settings),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["my-cards"] });
    },
  });
}

/**
 * Puts one of the member's own cards back in date, in its last 30 days
 * (SUS-07).
 *
 * Invalidates rather than patching the cache, like `useUpdateMyCard`: the
 * card's effective status is resolved server-side from the programme and the
 * community's lifecycle as well as the expiry clock, so the client cannot
 * compute the card's next state on its own.
 *
 * In demo mode this resolves without a request and the wallet keeps its
 * fixture dates, so the demo shows the flow without pretending a write
 * happened.
 */
export function useRenewMyCard() {
  const client = useQueryClient();
  const { demoMode } = useDemoMode();
  return useMutation({
    mutationFn: (cardId: string): Promise<RenewedCardDTO> =>
      demoMode
        ? Promise.resolve({
            id: cardId,
            status: "active",
            expiresAt: demoRenewalExpiry(),
          })
        : renewMyCard(cardId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["my-cards"] });
    },
  });
}

/** A twelve-month term from today, which is what the demo programme's
 *  `validityMonths` would stamp. Demo mode writes nothing, so the page keeps
 *  this value itself rather than reading it back from a server. */
function demoRenewalExpiry(): string {
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 12);
  return expiry.toISOString();
}
