import { ACTION_CODE } from "./moderationQueue.types";

/** `restrict`'s duration options. The backend always requires one (P0-15):
 *  unlike `ban`, there is no permanent restriction. */
export const RESTRICT_DURATIONS = ["24h", "7d", "30d"] as const;
export const DEFAULT_RESTRICT_DURATION: (typeof RESTRICT_DURATIONS)[number] =
  "7d";

/** The drawer holds a MOD_ACTIONS tile id ("hide"); the saved-response library
 *  is keyed by the server action code ("hide_content"). `ACTION_CODE` is the
 *  same map `useModerationQueue` uses when it files the action, so the picker
 *  filters on exactly the code the report will be resolved with. */
export function modActionCodeFor(action: string | null) {
  return action ? (ACTION_CODE[action] ?? null) : null;
}

/**
 * The decisions whose note a member reads, or argues against in an appeal.
 *
 * Mirrors `MEMBER_FACING_MOD_ACTIONS` in the backend's
 * `moderation/dto/member-facing-note.ts`, which refuses the request outright
 * (PRD-287). `warn`/`restrict`/`suspend`/`ban` are exactly
 * `ModerationService.OUTCOME_ACTIONS`, the set that reaches the member's
 * `moderation_outcome` notification; `hide_content`/`remove_content` write the
 * only durable record of why a takedown happened
 * (`content_moderation.note` and `reports.resolution_note`), which is what the
 * second moderator hearing an appeal has to read.
 *
 * `dismiss` and `escalate` are deliberately absent, on both sides. Nothing
 * lands on anybody: a dismissal is the queue's commonest outcome and an
 * escalation is an internal handoff by a moderator whose whole position is
 * that they cannot yet write the member's explanation.
 *
 * Server action CODES, never a `MOD_ACTIONS` tile id. Run a tile id through
 * {@link modActionCodeFor} first.
 *
 * This lives here, in the drawer's non-component options module, rather than
 * in either component, because BOTH the single-report drawer and the bulk
 * modal are held to it and the backend applies it to `ModActionDto` and
 * `ModBulkActionDto` alike. Two spellings of one rule is how a gate drifts
 * loose on the surface nobody re-checked.
 */
const MEMBER_FACING_MOD_ACTION_CODES: ReadonlySet<string> = new Set([
  "warn",
  "restrict",
  "suspend",
  "ban",
  "hide_content",
  "remove_content",
]);

/**
 * The floor the backend enforces on a member-facing note, in characters after
 * trimming, mirrored here so a moderator is stopped while the words are still
 * in front of them rather than by a 400 once the decision is written. It
 * matters most in bulk, where one refusal takes the whole batch down and the
 * moderator cannot tell which row caused it.
 *
 * Twenty is the same minimum this codebase demands of `CreateAppealDto.reason`,
 * the member's case against this very decision. Demanding twenty characters of
 * the person appealing and none of the person deciding was the defect.
 */
export const MIN_MEMBER_FACING_NOTE_LENGTH = 20;

/** Whether `actionCode` is one whose reason a member reads or appeals against,
 *  and therefore one that {@link MIN_MEMBER_FACING_NOTE_LENGTH} binds. */
export function isMemberFacingModAction(actionCode: string | null): boolean {
  return actionCode !== null && MEMBER_FACING_MOD_ACTION_CODES.has(actionCode);
}
