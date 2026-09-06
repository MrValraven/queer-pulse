import type { TFunction } from "../../../../shared/i18n/types";
import type { DeckDraft } from "../../deckDraft";
import { isFutureInstant } from "../editor/scheduleValidity";
import {
  buildDeckPublishChecklist,
  isDeckPublishReady,
} from "./deckPublishChecklist";

/** When the deck ships. See `isDeckPublishBlocked` for what each one costs. */
export type DeckPublishStatus = "now" | "schedule" | "issue";

export interface DeckPublishGateInput {
  draft: DeckDraft;
  /** Whether the deck already has a publish instant. */
  published: boolean;
  publishStatus: DeckPublishStatus;
  /** `"yyyy-mm-ddThh:mm"` local wall-clock, or `null` while unpicked. */
  scheduledAt: string | null;
  t: TFunction;
}

/**
 * Whether the deck editor's Publish button must refuse the current click.
 * Shared by `DeckPublishRail` and the page header's mirrored button, so the
 * two Publish affordances can never disagree about what is allowed, and it
 * is the same bar `MagazineService.updateDeck` re-checks server-side.
 *
 * Three reasons to refuse a publish (PRD-131):
 *
 *  - An open REQUIRED checklist item (no slides, or an image with no alt).
 *  - "Schedule" picked without a valid future instant.
 *  - "With issue" picked at all: that timing means the deck goes live when
 *    `shipIssue` runs, so publishing by hand would contradict the choice the
 *    writer just made.
 *
 * Unpublishing is never blocked. An editor must always be able to pull a live
 * deck back down whatever shape it is in.
 */
export function isDeckPublishBlocked({
  draft,
  published,
  publishStatus,
  scheduledAt,
  t,
}: DeckPublishGateInput): boolean {
  if (published) return false;
  if (publishStatus === "issue") return true;
  if (publishStatus === "schedule" && !isFutureInstant(scheduledAt)) {
    return true;
  }
  return !isDeckPublishReady(buildDeckPublishChecklist(draft, t));
}
