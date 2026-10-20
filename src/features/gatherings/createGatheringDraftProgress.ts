import type { CreatorDraftProgress } from "../creatorDrafts/api/creatorDrafts.types";
import {
  chapterIndexOf,
  CREATE_GATHERING_CHAPTERS,
  type CreateGatheringChapterId,
} from "./createGathering.data";
import { isChapterComplete } from "./createGatheringChapters";
import type { GatheringDraftSnapshot, GatheringForm } from "./useGatheringForm";

type AskingChapterId = Exclude<CreateGatheringChapterId, "review">;

function isAskingChapterId(
  chapterId: CreateGatheringChapterId,
): chapterId is AskingChapterId {
  return chapterId !== "review";
}

/** The five chapters that ask the host something: what, whenWhere, who,
 *  access and care. The review chapter only recaps them. */
export const EVENT_DRAFT_CHAPTER_IDS: readonly AskingChapterId[] =
  CREATE_GATHERING_CHAPTERS.map((chapter) => chapter.id)
    .filter(isAskingChapterId)
    .slice(0, 5);

/** How far an event draft got, for the server copy our team can read: the
 *  asking chapters whose checks pass out of five, and the ids of the ones
 *  that still fail. */
export function eventDraftProgress(form: GatheringForm): {
  progress: CreatorDraftProgress;
  missing: string[];
} {
  const missing = EVENT_DRAFT_CHAPTER_IDS.filter(
    (chapterId) => !isChapterComplete(form, chapterIndexOf(chapterId)),
  );
  return {
    progress: {
      done: EVENT_DRAFT_CHAPTER_IDS.length - missing.length,
      total: EVENT_DRAFT_CHAPTER_IDS.length,
    },
    missing,
  };
}

function isFilledId(listingId: string | null | undefined): boolean {
  return typeof listingId === "string" && listingId.length > 0;
}

/** True when the event names a community, a run-by business or a venue
 *  listing: those drafts are the ones our team can see. */
export function isEventDraftMadeFor(
  snapshot: Pick<
    GatheringDraftSnapshot,
    "communitySlug" | "runByListingId" | "venueListingId"
  >,
): boolean {
  return (
    snapshot.communitySlug.trim().length > 0 ||
    isFilledId(snapshot.runByListingId) ||
    isFilledId(snapshot.venueListingId)
  );
}
