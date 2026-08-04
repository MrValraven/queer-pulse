import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SlideDeck } from "../data/decks";
import { deckListItemToDeck, deckResponseToDeck } from "./magazine.adapters";
import { getDeck, getDecks } from "./magazine.api";

export interface DeckData {
  deck: SlideDeck | null;
  related: SlideDeck[];
}

/**
 * Resolves a slide deck by id. Demo mode reads the code-split mock registry
 * (dynamically imported so it never ships in the live bundle). Live mode
 * calls GET /magazine/decks/:slug for the deck and GET
 * /magazine/decks?tag=<firstTag> for the related rail, excluding the current
 * slug. `language` is in the key so a locale switch re-derives (the adapters
 * locale-format each deck's `date` via `fmt`).
 */
export function useDeck(id: string) {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { language } = useTranslation();
  return useQuery<DeckData>({
    queryKey: ["magazine-deck", demoMode, language, id],
    queryFn: async () => {
      if (demoMode) {
        const { decks } = await import("../data/decks.mock");
        const deck = decks[id] ?? null;
        const related = deck
          ? deck.related
              .map((relatedId) => decks[relatedId])
              .filter((candidate): candidate is SlideDeck => Boolean(candidate))
          : [];
        return { deck, related };
      }

      const dto = await getDeck(id).catch(() => null);
      if (!dto) return { deck: null, related: [] };

      const deck = deckResponseToDeck(dto, fmt);

      const tag = dto.tags[0];
      const relatedPage = tag
        ? await getDecks({ tag }).catch(() => null)
        : null;
      const related = (relatedPage?.items ?? [])
        .filter((item) => item.slug !== dto.slug)
        .slice(0, 3)
        .map((item) => deckListItemToDeck(item, fmt));

      return { deck, related };
    },
  });
}
