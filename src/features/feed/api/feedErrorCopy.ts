import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../../shared/api/causeErrorKey";

/**
 * The words a failed feed action says. Each map holds only what the action
 * itself can say; every other failure (offline, signed out, a restricted
 * account, an inactive membership, a rate limit, a server fault) reads as the
 * shared `shared:apiError.*` cause. Resolve a result with
 * `t(copy.key, copy.values)`.
 *
 * `POST /community-posts/:id/like` and `/replies` send no machine `code`, so
 * their statuses are the whole signal: a 403 means the post's community is
 * one the member has not joined, or one that is archived or paused (the
 * backend words the three differently but sends the same status), and a 404
 * means the post is gone.
 */
export const FEED_REPLY_CAUSE_OVERRIDES: CauseErrorOverrides = {
  403: "feed:action.replyForbidden",
  404: "feed:action.postGone",
};

export const FEED_REACTION_CAUSE_OVERRIDES: CauseErrorOverrides = {
  403: "feed:action.reactionForbidden",
  404: "feed:action.postGone",
};

/**
 * A like on a forum-thread card goes through the forum's own vote route, whose
 * 403 has more than one cause the backend does not tell apart, so only the 404
 * gets a line of its own and the 403 reads as the shared "no access" line.
 */
export const FEED_THREAD_REACTION_CAUSE_OVERRIDES: CauseErrorOverrides = {
  404: "feed:action.postGone",
};

/**
 * Muting or unmuting a source. `POST /feed/mutes` answers an uncoded 404 for a
 * source that no longer exists.
 */
export const FEED_MUTE_CAUSE_OVERRIDES: CauseErrorOverrides = {
  404: "feed:mute.sourceGone",
};

export function feedReplyCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, FEED_REPLY_CAUSE_OVERRIDES);
}

export function feedReactionCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, FEED_REACTION_CAUSE_OVERRIDES);
}

export function feedMuteCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, FEED_MUTE_CAUSE_OVERRIDES);
}

export function feedThreadReactionCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, FEED_THREAD_REACTION_CAUSE_OVERRIDES);
}
