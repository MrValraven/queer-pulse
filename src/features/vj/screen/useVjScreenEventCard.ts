/**
 * The active pack's event card for the projector (contract 6.2 "Pack event
 * card"). The library's one query answers it; while that query has no answer
 * (an offline start, or the first fetch still going) the card the record
 * saved for this pack stands in, so an offline reload still shows it.
 */
import type {
  VjEventCardDTO,
  VjEventCardUnavailableReason,
} from "../../../shared/contracts/vj";
import { useVjPackEvent } from "../api/useVjPackEvent";

export interface VjScreenEventCard {
  card: VjEventCardDTO | null;
  /** Set when the pack links an event the card may not show. */
  unavailableReason: VjEventCardUnavailableReason | null;
  /** True once the server said the pack links no event. */
  isUnlinked: boolean;
}

export function useVjScreenEventCard(
  packId: string | null,
  recordCard: VjEventCardDTO | null,
): VjScreenEventCard {
  const packEvent = useVjPackEvent(packId, { isEnabled: packId !== null }).data;
  if (packId === null) {
    return { card: null, unavailableReason: null, isUnlinked: false };
  }
  if (packEvent === undefined || packEvent.packId !== packId) {
    return { card: recordCard, unavailableReason: null, isUnlinked: false };
  }
  const { card, unavailableReason } = packEvent;
  return {
    card,
    unavailableReason,
    isUnlinked: card === null && unavailableReason === null,
  };
}
