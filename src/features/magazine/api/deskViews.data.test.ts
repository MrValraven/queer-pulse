import { describe, expect, it } from "vitest";
import { DEMO_ISSUE, DEMO_PIECES, type Piece } from "../data/desk.data";
import { matchesAllFocus } from "../desk/deskFocus";
import { DEMO_DESK_VIEW_SEEDS } from "./deskViews.data";
import type { DeskViewQuery } from "./deskViews.api";

const DEMO_VIEWER_ID = "marta";

/** The same partition `useDeskTracks` computes against `pieces`, replayed
 *  here against the demo issue so a seed's `track` can be checked without
 *  mounting the hook. */
function pieceIsInTrack(piece: Piece, track: DeskViewQuery["track"]): boolean {
  if (track === "unassigned") return piece.issueId === null;
  if (track === "issue") return piece.issueId === DEMO_ISSUE.id;
  if (track === "everything") return piece.stage !== "Published";
  return true;
}

/** Whether a seeded view's query would show `piece`, mirroring the desk's
 *  own filter pipeline (`useDeskState.visiblePieces`, `deskViewQuery.ts`'s
 *  `deskViewTableState`). A view that fails to match a single demo piece
 *  looks broken the moment an editor opens it, so a seed carrying a "no
 *  match" combination has to fail this before it ships. */
function pieceMatchesSeedQuery(piece: Piece, query: DeskViewQuery): boolean {
  if (!pieceIsInTrack(piece, query.track)) return false;
  if (query.sections && query.sections.length > 0) {
    if (!query.sections.includes(piece.section)) return false;
  }
  if (query.stages && query.stages.length > 0) {
    if (!query.stages.includes(piece.stage)) return false;
  }
  if (query.editor && piece.editorId !== query.editor) return false;
  if (query.format && query.format !== "all" && piece.format !== query.format) {
    return false;
  }
  const focusIds = query.focus ?? [];
  const closesOn =
    query.track === "issue" ? (DEMO_ISSUE.closesOn ?? null) : null;
  return matchesAllFocus(piece, DEMO_VIEWER_ID, focusIds, undefined, closesOn);
}

describe("DEMO_DESK_VIEW_SEEDS", () => {
  it("has at least one seed", () => {
    expect(DEMO_DESK_VIEW_SEEDS.length).toBeGreaterThan(0);
  });

  it.each(DEMO_DESK_VIEW_SEEDS)(
    "$name matches at least one demo piece",
    (view) => {
      const matchCount = DEMO_PIECES.filter((piece) =>
        pieceMatchesSeedQuery(piece, view.query),
      ).length;
      expect(matchCount).toBeGreaterThan(0);
    },
  );
});
