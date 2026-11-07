import type { Piece } from "../data/desk.data";

/** Fixtures for the unpublish flow tests (`unpublishFlowHarness.tsx`). */

export const UNPUBLISH_FLOW_PIECE_TITLE = "Letters from the coast";
export const UNPUBLISH_FLOW_PUBLISHED_AT = "2026-07-01T09:30:00.000Z";

export function makePublishedPiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: UNPUBLISH_FLOW_PIECE_TITLE,
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Rui Sol",
    editorId: "marta",
    stage: "Published",
    due: "ready",
    art: "in",
    issueId: "issue-1",
    publishedAt: UNPUBLISH_FLOW_PUBLISHED_AT,
    ...overrides,
  };
}
