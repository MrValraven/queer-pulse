import {
  causeErrorKey,
  type CauseErrorCopy,
} from "../../shared/api/causeErrorKey";
import type { TFunction } from "../../shared/i18n/types";
import { causeErrorKeyWithSentences } from "../communities/causeBySentence";
import { communityCause } from "../communities/communityErrors";

/**
 * The cause lines for the community-programme writes: nominating a change
 * maker, requesting a place in a reading group, proposing a reading group.
 *
 * A reading group IS a community, so its join request resolves through the
 * communities table (ban, paused community, a join already pending, a
 * community that is gone, offline) with no second copy of those sentences.
 * The nomination route refuses a self-nomination and an unknown member as
 * plain 400 strings with no `code` (`changemaker-nominations.service.ts`),
 * so those two are matched by their exact sentence, a documented exception.
 */

/** The cause for a failed change-maker nomination. */
export function nominationCause(error: unknown): CauseErrorCopy {
  return causeErrorKeyWithSentences(error, {
    sentences: [
      {
        pattern: /^you cannot nominate yourself/i,
        key: "community:changemakers.nominate.errorSelf",
      },
      {
        pattern: /^that member could not be found/i,
        key: "community:changemakers.nominate.errorMemberGone",
      },
    ],
  });
}

/** The ready-to-show text for a failed nomination. */
export function nominationErrorText(t: TFunction, error: unknown): string {
  const cause = nominationCause(error);
  return t(cause.key, cause.values);
}

/** The ready-to-show text for a failed reading-group join request. */
export function readingGroupJoinErrorText(
  t: TFunction,
  error: unknown,
): string {
  const cause = communityCause(error);
  return t(cause.key, cause.values);
}

/** The ready-to-show text for a failed reading-group proposal (offline,
 *  signed out, restricted, too many attempts, a server fault). */
export function readingGroupProposalErrorText(
  t: TFunction,
  error: unknown,
): string {
  const cause = causeErrorKey(error);
  return t(cause.key, cause.values);
}
