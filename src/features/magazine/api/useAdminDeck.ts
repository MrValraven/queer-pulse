import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { emptyDraft, deckDtoToDraft } from "../deckDraft";
import { type DeckLoad, loadMockDraft } from "../deckEditorLoad";
import { getAdminDeck } from "./magazine.api";

/** A brand-new deck, and the fallback when a demo deck id resolves to nothing. */
const EMPTY_LOAD: DeckLoad = {
  draft: emptyDraft(),
  published: false,
  publishedAt: null,
};

/**
 * Seeds the deck editor: the deck behind `?id=`, drafts included, or a blank
 * draft for the "new deck" flow. Demo mode reads the code-split mock deck
 * registry (dynamically imported so it never ships in the live bundle); live
 * mode calls the staff-guarded `GET /magazine/admin/decks/:id`.
 *
 * `publishedAt` rides along beside the `published` boolean because a FUTURE
 * instant means scheduled rather than live, and the publish rail says which
 * (PRD-131).
 */
export function useAdminDeck(id: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<DeckLoad>({
    queryKey: ["magazine-admin-deck", demoMode, id],
    queryFn: async () => {
      if (!id) return EMPTY_LOAD;
      if (demoMode) {
        return (await loadMockDraft(id)) ?? EMPTY_LOAD;
      }
      const dto = await getAdminDeck(id);
      return {
        draft: deckDtoToDraft(dto),
        published: Boolean(dto.publishedAt),
        publishedAt: dto.publishedAt,
      };
    },
  });
}
