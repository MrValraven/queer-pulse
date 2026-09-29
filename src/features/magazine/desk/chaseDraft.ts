/**
 * A chase should not start from a blank box. When `ChaseModal` opens for a
 * piece, the composer seeds a short, editable draft in the editor's own
 * voice, built from the piece it's for. Sending it IS the chase (the
 * composer posts straight into the piece's real thread), so the draft only
 * needs to read like something an editor would actually type.
 *
 * A draft is a greeting plus a body, joined by one space:
 * - The greeting is its own key (`greetingNamed` / `greetingAnonymous`), so a
 *   writer with no readable name in the byline gets a complete, correctly
 *   punctuated opener ("Hi," / "Olá!") instead of a name-shaped word plugged
 *   into a name-shaped slot.
 * - The body is one of three shapes (`dueSoon` / `late` / `noDate`), picked
 *   from `describeDue`'s own read of the piece, each written as one natural
 *   message around its own `{dueClause}`: a full clause ("is due
 *   tomorrow", "was due 3 days ago") that a body template can place directly.
 *   The due clause has its own keys, separate from `desk.due.*` (the status
 *   chip's short, stand-alone labels): a chip reads "3 days late" on its
 *   own fine, but "It's due 3 days late." does not.
 */

import type { Language, TFunction } from "../../../shared/i18n/types";
import type { Piece } from "../data/desk.data";
import { firstName } from "../data/desk.copy";
import { describeDue, type DeskDueDescription } from "./deskDue";

export type ChaseDraftKind = "dueSoon" | "late" | "noDate";

/** Which of the three bodies a piece calls for, from its own due state.
 *  A piece with nothing left to chase (Ready, Published) or no due date at
 *  all reads as `noDate`, same as it would carry no due clause to embed. */
function chaseDraftKind(due: DeskDueDescription): ChaseDraftKind {
  if (due.kind === "none" || due.kind === "ready") return "noDate";
  return due.isLate ? "late" : "dueSoon";
}

/**
 * The due phrase as a complete clause ("is due tomorrow", "was due 3 days
 * ago"), so a body template only has to place it as it stands.
 * `describeDue`'s own `"raw"` kind (a due string the app could not parse as
 * a date) gets the same clause shape around the author's own text.
 */
function dueClause(due: DeskDueDescription, t: TFunction): string {
  if (due.kind === "raw") {
    const text = due.text ?? "";
    return due.isLate
      ? t("magazine:desk.chase.draft.dueLateRaw", { text })
      : t("magazine:desk.chase.draft.dueRaw", { text });
  }
  switch (due.labelKey) {
    case "magazine:desk.due.today":
      return t("magazine:desk.chase.draft.dueToday");
    case "magazine:desk.due.tomorrow":
      return t("magazine:desk.chase.draft.dueTomorrow");
    case "magazine:desk.due.inDays":
      return t("magazine:desk.chase.draft.dueInDays", due.values);
    default:
      // "magazine:desk.due.daysLate"
      return t("magazine:desk.chase.draft.dueLate", due.values);
  }
}

/**
 * The draft, seeded once when `ChaseModal` opens for a piece. `today` is a
 * parameter so tests pin the clock, same as `describeDue`. `language` stays
 * in the signature so `ChaseModal`'s call site does not need to change; the
 * greeting and the due clause now resolve entirely through `t()`, so it goes
 * unread here.
 */
export function buildChaseDraft(
  piece: Piece,
  today: Date,
  t: TFunction,
  _language: Language,
): string {
  const due = describeDue(piece, today);
  const kind = chaseDraftKind(due);
  const writer = firstName(piece.byline);
  const greeting = writer
    ? t("magazine:desk.chase.draft.greetingNamed", { writer })
    : t("magazine:desk.chase.draft.greetingAnonymous");
  const body =
    kind === "noDate"
      ? t("magazine:desk.chase.draft.noDate", { title: piece.title })
      : t(`magazine:desk.chase.draft.${kind}`, {
          title: piece.title,
          dueClause: dueClause(due, t),
        });
  return `${greeting} ${body}`;
}
