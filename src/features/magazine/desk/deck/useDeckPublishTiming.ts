import { useState } from "react";
import type { TFunction } from "../../../../shared/i18n/types";
import type { DeckDraft } from "../../deckDraft";
import {
  isDeckPublishBlocked,
  type DeckPublishStatus,
} from "./deckPublishGate";

export interface UseDeckPublishTimingArgs {
  draft: DeckDraft;
  published: boolean;
  t: TFunction;
}

/**
 * The deck editor's publish-timing choice (PRD-131): which of Now / Schedule
 * / With-issue is selected, the instant picked for Schedule, and whether that
 * combination may be published right now.
 *
 * Local UI state, never part of the persisted draft: it describes the click
 * the editor is about to make, and the deck itself only ever stores the
 * resulting `publishedAt`.
 *
 * Kept in one hook so the page header's Publish button and the rail's own
 * Publish button read the same answer from the same place. They used to
 * derive it separately, which is how they could disagree.
 */
export function useDeckPublishTiming({
  draft,
  published,
  t,
}: UseDeckPublishTimingArgs) {
  const [publishStatus, setPublishStatus] = useState<DeckPublishStatus>("now");
  // `"yyyy-mm-ddThh:mm"` local wall-clock, the `DatePicker` `datetime` shape.
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);

  return {
    publishStatus,
    setPublishStatus,
    scheduledAt,
    setScheduledAt,
    isPublishBlocked: isDeckPublishBlocked({
      draft,
      published,
      publishStatus,
      scheduledAt,
      t,
    }),
  };
}
