import {
  causeErrorKey,
  SHARED_CAUSE_KEY,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";
import type { TFunction } from "../../shared/i18n/types";
import {
  causeErrorKeyWithSentences,
  type SentenceRule,
} from "./causeBySentence";

/**
 * The cause lines for every failed community write (posting, reacting,
 * joining, leaving, roster and role changes, bans, invitations, settings and
 * the owner's danger zone). One table here instead of a switch in each
 * component; a component calls `communityErrorText(t, error)` and shows the
 * result.
 *
 * Coded refusals come first. The sentence table below covers the refusals
 * the backend words only in English (`communities.service.ts`,
 * `community-posts.service.ts` and friends throw plain `ForbiddenException`
 * or `BadRequestException` strings with no `code`), matched whole so a
 * reworded server sentence falls back to the plain status line. Everything
 * else resolves through the shared classifier: offline, signed out,
 * moderation restriction, inactive membership, rate limited, server fault.
 */

/** Backend machine `code` to catalog key. */
export const COMMUNITY_CODE_OVERRIDES: CauseErrorOverrides = {
  COMMUNITY_MEMBERS_ONLY: "communities:error.membersOnly",
  COMMUNITY_FROZEN: "communities:error.frozen",
  BANNED_FROM_COMMUNITY: "communities:error.banned",
  REAPPLY_TOO_SOON: "communities:error.reapplyTooSoon",
  COMMUNITY_JOIN_REQUEST_PENDING: "communities:error.requestPending",
  JOIN_REQUEST_ALREADY_ANSWERED: "communities:error.requestResolved",
  PARENT_MEMBERSHIP_REQUIRED: "communities:error.parentRequired",
  RULES_ACCEPTANCE_REQUIRED: "communities:error.rulesChanged",
  SUBCOMMUNITY_TIER_TOO_OPEN: "communities:error.spaceTierTooOpen",
};

/** Refusals sent as an English sentence only, so matched by their exact text
 *  (apostrophes may be straight or curly). */
export const COMMUNITY_SENTENCE_RULES: readonly SentenceRule[] = [
  {
    pattern: /^this community has been archived/i,
    key: "communities:error.archived",
  },
  {
    pattern: /^an archived community cannot be edited/i,
    key: "communities:error.archived",
  },
  {
    pattern: /^this community is frozen while moderators review/i,
    key: "communities:error.frozen",
  },
  {
    pattern: /^this community is paused and is taking no new members/i,
    key: "communities:error.frozen",
  },
  {
    pattern: /^this space is paused because its parent community is paused/i,
    key: "communities:error.parentPaused",
  },
  {
    pattern: /^this community was frozen by moderation/i,
    key: "communities:error.frozenByModeration",
  },
  {
    pattern: /^only roster members can do that/i,
    key: "communities:error.notOnRoster",
  },
  {
    pattern: /^you are already a member of this community/i,
    key: "communities:error.alreadyMember",
  },
  {
    pattern: /^the owner cannot be removed/i,
    key: "communities:error.ownerCannotLeave",
  },
  {
    pattern: /^the owner['’]s role cannot be changed/i,
    key: "communities:error.ownerRoleFixed",
  },
  {
    pattern: /^you cannot change your own role/i,
    key: "communities:error.ownRoleFixed",
  },
  {
    pattern: /^(you already own this community|that member already owns)/i,
    key: "communities:error.alreadyOwner",
  },
  {
    pattern: /^ownership cannot be transferred to the house account/i,
    key: "communities:error.houseAccountOwner",
  },
  {
    pattern:
      /^(a space cannot be publicly listed|a community can only be publicly listed)/i,
    key: "communities:error.cannotBeListed",
  },
  {
    pattern:
      /^only (the owner|an owner or co-owner) can (remove a co-owner|remove a moderator|change a co-owner|change a moderator|appoint a co-owner|change who can see)/i,
    key: "communities:error.needsHigherRole",
  },
  {
    pattern: /^only the owner can do that/i,
    key: "communities:error.ownerOnly",
  },
  {
    pattern:
      /^only (the owner or a moderator can do that|an owner or mod can (un)?freeze)/i,
    key: "communities:error.needsStaffRole",
  },
  {
    pattern: /^only a community owner\/mod can post an announcement/i,
    key: "communities:error.announcementStaffOnly",
  },
  {
    pattern: /^community not found/i,
    key: "communities:error.communityGone",
  },
  {
    pattern: /^(post|reply) not found/i,
    key: "communities:error.postGone",
  },
  { pattern: /^member not found/i, key: "communities:error.memberGone" },
  {
    pattern: /^invitation not found/i,
    key: "communities:error.inviteGone",
  },
  {
    pattern: /^this invitation has already been answered/i,
    key: "communities:error.inviteAnswered",
  },
  {
    pattern: /^this offer has already been answered/i,
    key: "communities:error.offerAnswered",
  },
  {
    pattern: /^join request already resolved/i,
    key: "communities:error.requestResolved",
  },
  {
    pattern: /^this community requires a vouch/i,
    key: "communities:error.needsVouch",
  },
  {
    pattern: /^no ban found for that member/i,
    key: "communities:error.banGone",
  },
  {
    pattern: /^that rule is outside this community['’]s current rules/i,
    key: "communities:error.banRuleStale",
  },
  {
    pattern: /^a community['’]s resource shelf holds at most/i,
    key: "communities:error.shelfFull",
  },
  {
    pattern: /^you can file one owner review a day/i,
    key: "communities:error.ownerReviewDaily",
  },
  {
    pattern: /^this community already has an open owner review/i,
    key: "communities:error.ownerReviewOpen",
  },
];

/**
 * The cause line for a failed community write. `extraOverrides` lets one call
 * site say more than the table does for a code or status (a join's 404, say);
 * a code entry there wins over the table's entry for the same code.
 */
export function communityCause(
  error: unknown,
  extraOverrides?: CauseErrorOverrides,
): CauseErrorCopy {
  return causeErrorKeyWithSentences(error, {
    overrides: { ...COMMUNITY_CODE_OVERRIDES, ...extraOverrides },
    sentences: COMMUNITY_SENTENCE_RULES,
  });
}

/** The ready-to-show text for a failed community write. */
export function communityErrorText(
  t: TFunction,
  error: unknown,
  extraOverrides?: CauseErrorOverrides,
): string {
  const cause = communityCause(error, extraOverrides);
  return t(cause.key, cause.values);
}

/**
 * True when the failure is about the account itself (a moderation restriction
 * or an inactive membership) rather than the thing acted on. A surface with
 * its own status-based refusal lines checks this first so a restricted
 * member's 403 never reads as the surface's own 403 reason.
 */
export function isAccountLevelCause(error: unknown): boolean {
  const key = causeErrorKey(error).key;
  return (
    key === SHARED_CAUSE_KEY.accountRestricted ||
    key === SHARED_CAUSE_KEY.notActive
  );
}
