import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getCardProgram,
  issueAllCards,
  putCardProgram,
  type CardProgramDTO,
  type UpsertCardProgramBody,
} from "./cards.api";
import { DEMO_CARD_PROGRAM } from "../cards.data";

export function useCardProgram(slug: string | undefined): {
  program: CardProgramDTO | null;
  isLoading: boolean;
} {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["card-program", slug, demoMode],
    enabled: !demoMode && Boolean(slug),
    queryFn: () => getCardProgram(slug!),
  });

  if (demoMode) return { program: DEMO_CARD_PROGRAM, isLoading: false };
  return { program: query.data ?? null, isLoading: query.isLoading };
}

export function useUpsertCardProgram(slug: string | undefined) {
  const client = useQueryClient();
  const { demoMode } = useDemoMode();
  return useMutation({
    mutationFn: (body: UpsertCardProgramBody) => {
      if (demoMode) {
        return Promise.resolve({ ...DEMO_CARD_PROGRAM, ...body });
      }
      return putCardProgram(slug!, body);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["card-program", slug] });
      // The programme's skin and card name are baked into every member's own
      // card view, so that cache goes stale too.
      void client.invalidateQueries({ queryKey: ["my-cards"] });
    },
  });
}

export function useIssueAllCards(slug: string | undefined) {
  const client = useQueryClient();
  const { demoMode } = useDemoMode();
  return useMutation({
    mutationFn: () =>
      demoMode
        ? Promise.resolve({
            issued: 12,
            renewed: 0,
            skipped: 1,
            unchanged: 4,
          })
        : issueAllCards(slug!),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["card-holders", slug] });
    },
  });
}
