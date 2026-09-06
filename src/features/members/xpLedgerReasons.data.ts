/**
 * Display text for the `reason` column on an XP ledger row.
 *
 * A reason is written on a row the backend needs to explain rather than
 * merely list, and there are exactly two writers today:
 *
 *   - `moderation_removal` — `RecognitionAwardingService.writeLedgerEntries`
 *     (`queerpulse-backend/src/recognition/recognition-awarding.service.ts`).
 *     The one path that lowers a total: while a moderator takedown stands
 *     against the account, the no-regression floor is lifted, so whatever the
 *     takedown removed stops paying.
 *   - `xp_rebase_prd05` — the one-off rebase CLI
 *     (`recognition-xp-rebase-cli.ts`), which corrected totals earned before
 *     XP required a second person to be involved.
 *
 * Both used to reach the member as the raw snake_case code, printed under a
 * row whose own description was English no matter what language the page was
 * in. Same shape as `xpBreakdown.data.ts`: the wire carries the machine id,
 * the frontend owns the sentence, and an id this map has not caught up with
 * resolves to a plain human fallback so a new backend code can never print
 * itself on screen again.
 */
export interface XpLedgerReasonMeta {
  /** Replaces the row's backend-authored English description. */
  descriptionKey: string;
  /** The quieter "why" line under it. */
  explanationKey: string;
}

export const XP_LEDGER_REASON_META: Record<string, XpLedgerReasonMeta> = {
  moderation_removal: {
    descriptionKey: "members:badges.ledger.reason.moderationRemoval",
    explanationKey: "members:badges.ledger.reason.moderationRemovalWhy",
  },
  xp_rebase_prd05: {
    descriptionKey: "members:badges.ledger.reason.rebase",
    explanationKey: "members:badges.ledger.reason.rebaseWhy",
  },
};

const UNKNOWN_REASON_META: XpLedgerReasonMeta = {
  descriptionKey: "members:badges.ledger.reason.adjustment",
  explanationKey: "members:badges.ledger.reason.adjustmentWhy",
};

/**
 * A machine reason code is lowercase snake_case with no spaces. The demo
 * fixture writes a finished English sentence into the same field instead, and
 * that sentence is already readable, so it is passed through untouched. Any
 * value shaped like a code is resolved through the map, known or not, which
 * is what guarantees no member ever reads an identifier.
 */
const REASON_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;

export function isMachineReasonCode(reason: string): boolean {
  return REASON_CODE_PATTERN.test(reason);
}

export function xpLedgerReasonMetaFor(reasonCode: string): XpLedgerReasonMeta {
  return XP_LEDGER_REASON_META[reasonCode] ?? UNKNOWN_REASON_META;
}
