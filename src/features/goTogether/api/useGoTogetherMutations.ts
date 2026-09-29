import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  demoAcceptPair,
  demoDeclinePair,
  demoOptIn,
  demoRevealGroup,
  demoWithdraw,
} from "../goTogether.mock";
import {
  acceptGoTogetherPair,
  declineGoTogetherPair,
  optInGoTogether,
  withdrawGoTogether,
} from "./goTogether.api";
import type {
  GoTogetherCardDTO,
  OptInBody,
  PairAnswersBody,
} from "./goTogether.types";
import { goTogetherKeys } from "./goTogetherKeys";

/**
 * The gathering card's writes. Each answers with the fresh card, which goes
 * straight into the card query. Demo mode moves `demoState` forward with no
 * I/O. Every hook sets `silentError` because the card shows its own error.
 */
function useSetCard(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return (card: GoTogetherCardDTO) =>
    queryClient.setQueryData(goTogetherKeys.card(slug, demoMode), card);
}

/** POST /events/:slug/go-together. Opting in marks the answers as used, so
 *  the profile query refreshes too. */
export function useOptInGoTogether(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const setCard = useSetCard(slug);
  return useMutation<GoTogetherCardDTO, Error, OptInBody>({
    meta: { silentError: true },
    mutationFn: async (body) =>
      demoMode ? demoOptIn(slug, body) : optInGoTogether(slug, body),
    onSuccess: (card) => {
      setCard(card);
      void queryClient.invalidateQueries({
        queryKey: goTogetherKeys.profileRoot,
      });
    },
  });
}

/** DELETE /events/:slug/go-together: back to `notOptedIn`. */
export function useWithdrawGoTogether(slug: string) {
  const { demoMode } = useDemoMode();
  const setCard = useSetCard(slug);
  return useMutation<GoTogetherCardDTO, Error, void>({
    meta: { silentError: true },
    mutationFn: async () =>
      demoMode ? demoWithdraw(slug) : withdrawGoTogether(slug),
    onSuccess: setCard,
  });
}

/** POST /events/:slug/go-together/pair/accept, with the invitee's own host
 *  answers and lens. */
export function useAcceptGoTogetherPair(slug: string) {
  const { demoMode } = useDemoMode();
  const setCard = useSetCard(slug);
  return useMutation<GoTogetherCardDTO, Error, PairAnswersBody>({
    meta: { silentError: true },
    mutationFn: async (body) =>
      demoMode ? demoAcceptPair(slug, body) : acceptGoTogetherPair(slug, body),
    onSuccess: setCard,
  });
}

/** POST /events/:slug/go-together/pair/decline. */
export function useDeclineGoTogetherPair(slug: string) {
  const { demoMode } = useDemoMode();
  const setCard = useSetCard(slug);
  return useMutation<GoTogetherCardDTO, Error, void>({
    meta: { silentError: true },
    mutationFn: async () =>
      demoMode ? demoDeclinePair(slug) : declineGoTogetherPair(slug),
    onSuccess: setCard,
  });
}

/**
 * Demo only: turns a waiting entry into a formed group so a demo member can
 * see the reveal without waiting for the cutoff. There is no live endpoint;
 * outside demo mode it does nothing and resolves undefined.
 */
export function useRevealDemoGoTogetherGroup(slug: string) {
  const { demoMode } = useDemoMode();
  const setCard = useSetCard(slug);
  return useMutation<GoTogetherCardDTO | undefined, Error, void>({
    meta: { silentError: true },
    mutationFn: () =>
      Promise.resolve(demoMode ? demoRevealGroup(slug) : undefined),
    onSuccess: (card) => {
      if (card) setCard(card);
    },
  });
}
