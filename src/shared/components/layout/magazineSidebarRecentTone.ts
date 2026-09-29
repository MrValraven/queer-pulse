import {
  describeWaitingOn,
  isWaitingOnViewer,
  pieceHolder,
  waitingOnLabel,
} from "../../../features/magazine/desk/deskWaitingOn";
import type { Editor, Piece } from "../../../features/magazine/data/desk.data";
import type { TFunction } from "../../i18n/types";

/** The states the "Open now" dot can carry. Narrower than `DeskTone`: this
 *  list never needs "late" or "ready", so it only names what it uses. */
export type RecentTone = "writer" | "you" | "neutral";

/**
 * The "Open now" dot's fill, always readable on the rail's own plum surface.
 * `--desk-tone-*` is only guaranteed against `--paper`/`--cream`; its
 * light-mode values are dark, saturated colours that all but disappear on
 * plum, which never lightens in dark mode either. `--amber` and the cream
 * channels are the one pair of tokens this rail already knows hold their
 * value in both themes (`.navCount` in `MagazineSidebar.module.css` relies
 * on the same cream/plum guarantee), so the three states below are built
 * from those instead of the flipping tone tokens.
 */
export const RECENT_TONE_FILL: Record<RecentTone, string> = {
  writer: "var(--amber)",
  you: "rgba(var(--cream-rgb), 1)",
  neutral: "rgba(var(--cream-rgb), 0.5)",
};

/**
 * The dot's three-way fill, read from the desk's one waiting-on rule
 * (`pieceHolder` / `isWaitingOnViewer` in `deskWaitingOn.ts`): a piece with
 * its writer or its sensitivity reader is amber, the viewer's own turn is
 * full cream, and everything else (another editor's turn, nobody) is the
 * quiet half cream.
 */
export function recentToneFor(piece: Piece, me: string): RecentTone {
  const holder = pieceHolder(piece);
  if (holder === "writer" || holder === "reader") return "writer";
  return isWaitingOnViewer(piece, me) ? "you" : "neutral";
}

/**
 * The row's screen reader text, one whole sentence per holder. The dot has
 * three fills, but the words name the holder exactly as the desk's own
 * "Waiting on" column does (`describeWaitingOn`): the writer, the reader,
 * another editor by first name, or nobody. The viewer's own turn has its
 * own sentence, because some languages phrase it apart from the rest (PT
 * "À tua espera").
 */
export function recentWaitingOnText(
  piece: Piece,
  me: string,
  editors: readonly Editor[],
  translate: TFunction,
): string {
  if (isWaitingOnViewer(piece, me)) {
    return translate("magazine:desk.pieceRow.waitingOnYouAria");
  }
  const display = describeWaitingOn(piece, me, editors);
  return translate("magazine:desk.pieceRow.waitingOnAria", {
    who: waitingOnLabel(display, translate),
  });
}
