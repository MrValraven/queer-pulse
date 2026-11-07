import type { CauseErrorCopy } from "../../shared/api/causeErrorKey";
import type { TFunction } from "../../shared/i18n/types";
import {
  causeErrorKeyWithSentences,
  type SentenceRule,
} from "../communities/causeBySentence";

/**
 * The cause lines for every failed governance write: filing a motion,
 * co-signing or withdrawing a signature, casting a vote, raising a concern.
 *
 * Offline, signed out, a moderation restriction (all four proposal writes sit
 * behind `NotRestrictedGuard`), an inactive membership (`ActiveMemberGuard`),
 * rate limited and a server fault resolve through the shared classifier. The
 * proposal rules below are thrown by `governance-proposal.service.ts` as plain
 * `BadRequestException` / `ForbiddenException` / `HttpException` strings with
 * no machine `code`, so they are matched by their exact sentence (a documented
 * exception); move each into overrides once the backend gives it a `code`.
 * The 429 for a fourth open motion is matched by sentence too, so a plain
 * throttle 429 still reads as the shared rate-limit line.
 */
export const GOVERNANCE_SENTENCE_RULES: readonly SentenceRule[] = [
  {
    pattern: /^voting is closed for this proposal/i,
    key: "governance:error.votingClosed",
  },
  {
    pattern: /^voting has not opened for this proposal yet/i,
    key: "governance:error.votingNotOpen",
  },
  {
    pattern: /^you cannot vote on a proposal about yourself/i,
    key: "governance:error.voteOnSelf",
  },
  { pattern: /^proposal not found/i, key: "governance:error.proposalGone" },
  {
    pattern: /^this proposal is not gathering co-signatures/i,
    key: "governance:error.notGathering",
  },
  {
    pattern: /^the co-signature window for this motion has closed/i,
    key: "governance:error.windowClosed",
  },
  {
    pattern: /^the member who filed a motion cannot withdraw/i,
    key: "governance:error.founderSignature",
  },
  {
    pattern: /^you already have \d+ motions gathering co-signatures/i,
    key: "governance:error.motionCap",
  },
];

/** The cause line for a failed governance write. */
export function governanceCause(error: unknown): CauseErrorCopy {
  return causeErrorKeyWithSentences(error, {
    sentences: GOVERNANCE_SENTENCE_RULES,
  });
}

/** The ready-to-show text for a failed governance write. */
export function governanceErrorText(t: TFunction, error: unknown): string {
  const cause = governanceCause(error);
  return t(cause.key, cause.values);
}
