import { ApiError } from "../../shared/api/client";
import {
  apiErrorCode,
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";

/**
 * One refusal the backend words only in English prose, with no machine `code`
 * on the response body. `pattern` is tested against the trimmed `message`.
 */
export interface SentenceRule {
  pattern: RegExp;
  /** The full catalog key to show, e.g. `"communities:error.archived"`. */
  key: string;
}

/** What a feature hands the classifier on top of the shared causes. */
export interface CauseRules {
  /** Overrides by backend `code` or HTTP status, as `causeErrorKey` takes. */
  overrides?: CauseErrorOverrides;
  /** Prose-only refusals, consulted first and only for uncoded errors. */
  sentences?: readonly SentenceRule[];
}

/**
 * `causeErrorKey` plus a documented escape hatch for the refusals the backend
 * only words as an English sentence.
 *
 * The shared classifier reads machine codes and statuses only. Several of the
 * forum, community, governance and nomination writes refuse with a bare
 * `ForbiddenException("This thread is locked")` and no `code`, so a status
 * alone cannot tell a locked thread from a thread in a community the member
 * has not joined. For those the feature lists the exact sentence here, which
 * keeps the matching in one reviewed table instead of inline checks. Rules
 * run only when the response carries no `code`: a coded refusal (a
 * moderation restriction, `BANNED_FROM_COMMUNITY`) always resolves through
 * `causeErrorKey`, so a prose rule can never shadow it. Remove a rule once the
 * backend puts a `code` on that refusal and move it into `overrides`.
 */
export function causeErrorKeyWithSentences(
  error: unknown,
  rules: CauseRules,
): CauseErrorCopy {
  if (error instanceof ApiError && apiErrorCode(error) === null) {
    const message = error.message.trim();
    const matched = rules.sentences?.find((rule) => rule.pattern.test(message));
    if (matched) return { key: matched.key };
  }
  return causeErrorKey(error, rules.overrides);
}
