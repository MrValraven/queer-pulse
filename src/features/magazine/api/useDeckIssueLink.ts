import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getDeckIssueLink, type DeckIssueLinkDTO } from "./deckAdmin.api";

const NO_LINK: DeckIssueLinkDTO = {
  pieceId: null,
  issueNumber: null,
  issueTitle: null,
};

/**
 * Which issue this deck ships with, for the deck editor's "With issue"
 * publish timing (PRD-131). Demo mode has no desk pieces or issues behind the
 * deck editor's local draft state, so it answers "no issue yet" rather than
 * inventing one: the rail then says the deck is not in an issue, which is the
 * truth in demo mode too.
 *
 * Disabled until the deck has a server id, since a never-saved draft cannot
 * be linked to anything.
 */
export function useDeckIssueLink(deckId: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<DeckIssueLinkDTO>({
    queryKey: ["magazine-deck-issue-link", demoMode, deckId],
    enabled: Boolean(deckId),
    queryFn: async () => {
      if (demoMode || !deckId) return NO_LINK;
      return getDeckIssueLink(deckId);
    },
  });
}
