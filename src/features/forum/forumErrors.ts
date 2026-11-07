import {
  SHARED_CAUSE_KEY,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";
import type { TFunction } from "../../shared/i18n/types";
import {
  causeErrorKeyWithSentences,
  type SentenceRule,
} from "../communities/causeBySentence";
import {
  FUNDING_ERROR_MESSAGE_KEYS,
  FUNDING_ERROR_MESSAGE_VALUES,
} from "./funding/fundingErrors";

/**
 * The cause lines for every failed forum write: starting a thread, replying,
 * voting on a poll, following, closing, editing a title or tags, accepting an
 * answer, removing a co-author credit, ending a fundraiser. One table here
 * instead of a `forum:toast.error` in each hook.
 *
 * Resolution, first match wins: a funding contract code (`funding_*`, each
 * with its own sentence), then the English-only sentences below, then the
 * shared causes (offline, signed out, moderation restriction, inactive
 * membership, rate limited, server fault) from `causeErrorKey`.
 *
 * The thread routes refuse with plain `ForbiddenException("...")` strings and
 * no machine `code` (`forum-posts.service.ts`, `forum-threads.service.ts`,
 * `forum-polls.service.ts`), so a status alone cannot tell a thread a
 * moderator locked from one its author closed from one in a community the
 * member has not joined. Those are matched by their exact sentence, a
 * documented exception; move a rule into `FORUM_CODE_OVERRIDES` once the
 * backend adds a `code` for it.
 */

/** Funding contract codes to their existing refusal sentences. */
export const FORUM_CODE_OVERRIDES: CauseErrorOverrides = {
  ...FUNDING_ERROR_MESSAGE_KEYS,
};

/** Refusals the thread, post and poll routes send as an English sentence only. */
export const FORUM_SENTENCE_RULES: readonly SentenceRule[] = [
  // A moderator locked the thread.
  { pattern: /^this thread is locked/i, key: "forum:locked.replyBlockedToast" },
  // The author's own closing date has passed.
  {
    pattern: /^this thread has closed to new replies/i,
    key: "forum:error.closedByAuthor",
  },
  // A community-scoped thread takes replies and new posts from its roster
  // only (`assertCanReplyInThread`, `assertMemberBySlug`).
  {
    pattern: /^only members of this community can reply in its threads/i,
    key: "forum:error.notCommunityMember",
  },
  {
    pattern: /^only roster members can do that/i,
    key: "forum:error.notCommunityMember",
  },
  {
    pattern: /^(cannot reply to a deleted post|parent post not found)/i,
    key: "forum:error.replyToDeleted",
  },
  { pattern: /^community not found/i, key: "forum:error.communityGone" },
  { pattern: /^thread not found/i, key: "forum:error.threadGone" },
  { pattern: /^post not found/i, key: "forum:error.postGone" },
  {
    pattern: /^could not allocate a unique thread slug/i,
    key: "forum:error.slugBusy",
  },
  {
    pattern: /^a thread can only be moved to another category/i,
    key: "forum:error.moveWindowClosed",
  },
  {
    pattern: /^no member with that handle to credit as co-author/i,
    key: "forum:error.coAuthorUnknown",
  },
  {
    pattern: /^you are already credited on this thread/i,
    key: "forum:error.coAuthorSelf",
  },
  // The ballot.
  { pattern: /^this poll has closed/i, key: "forum:poll.voteFailedClosed" },
  {
    pattern: /^this poll takes exactly one answer/i,
    key: "forum:poll.errorSingleChoice",
  },
  {
    pattern: /^pick at least one option/i,
    key: "forum:poll.errorNoChoice",
  },
  {
    pattern: /^(this thread has no poll|that option is not on this poll)/i,
    key: "forum:poll.errorOptionGone",
  },
  // Accepting an answer.
  {
    pattern: /^a deleted post cannot be the answer/i,
    key: "forum:answer.errorDeleted",
  },
];

/** The cause line for a failed forum write, with the tokens a funding
 *  refusal interpolates. `extraOverrides` adds a call site's own code or
 *  status line. */
export function forumCause(
  error: unknown,
  extraOverrides?: CauseErrorOverrides,
): CauseErrorCopy {
  const cause = causeErrorKeyWithSentences(error, {
    overrides: { ...FORUM_CODE_OVERRIDES, ...extraOverrides },
    sentences: FORUM_SENTENCE_RULES,
  });
  return {
    key: cause.key,
    values: { ...FUNDING_ERROR_MESSAGE_VALUES, ...cause.values },
  };
}

/** The ready-to-show text for a failed forum write. */
export function forumErrorText(
  t: TFunction,
  error: unknown,
  extraOverrides?: CauseErrorOverrides,
): string {
  const cause = forumCause(error, extraOverrides);
  return t(cause.key, cause.values);
}

/**
 * The cause for a failed reply. A bare 403 on a thread the page already knows
 * a moderator closed keeps the locked line even when the server's sentence did
 * not match (a reworded guard), so the member never reads a generic refusal on
 * a locked thread.
 */
export function replyCause(
  error: unknown,
  isKnownLocked: boolean,
): CauseErrorCopy {
  const cause = forumCause(error);
  if (isKnownLocked && cause.key === SHARED_CAUSE_KEY.forbidden) {
    return { key: "forum:locked.replyBlockedToast" };
  }
  return cause;
}

/** The ready-to-show text for a failed reply. */
export function replyErrorText(
  t: TFunction,
  error: unknown,
  isKnownLocked: boolean,
): string {
  const cause = replyCause(error, isKnownLocked);
  return t(cause.key, cause.values);
}
