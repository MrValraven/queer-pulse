import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPiece } from "./pieces.api";
import type { PieceRecordPublishFields } from "./piecePublish.api";
import {
  demoRecordForPiece,
  type PieceRecordView,
} from "../data/pieceRecord.data";
import { DEMO_PIECES } from "../data/desk.data";

/**
 * What `PieceRecordPage` actually renders: the record plus the publish state
 * from CONTRACT §3 (`isPublished` / `publishedAt` / `publicHref`). The publish
 * fields are optional here on purpose: the demo fixture predates them and a
 * backend that has not shipped them yet must not blank the whole page, so
 * every reader treats an absent field as "not published".
 */
export type PieceRecordWithPublish = PieceRecordView & PieceRecordPublishFields;

/**
 * The full piece record: brief/care/payment/audit/letters/corrections/
 * publishGate, behind `/magazine/editor/piece/:id`. Demo mode still has no
 * per-piece record registry the way `useDeck` has `decks.mock` (see that
 * file's comment for the same one-record limitation on this Phase 1/2
 * slice), so most of the fixture stays fixed regardless of `id`; but
 * `demoRecordForPiece` lets the filed word count and the money status vary
 * with whichever `DEMO_PIECES` row `id` names, so a piece's own peek at
 * least agrees with its own row there. Live mode
 * calls `GET /magazine/admin/pieces/:id`, which already returns the full
 * shape (`PieceRecordFull` on the backend), and adds an empty `similar` list
 * since the backend has no similar-pieces endpoint yet.
 *
 * The query key includes `id` (so navigating between pieces in live mode
 * refetches) and `demoMode` (mirrors `usePieces`/`useDeck`), and is prefixed
 * `["magazine-piece", id]` so `usePieceMutations`'s `invalidateDesk`, which
 * invalidates that exact prefix, still busts this cache.
 */
export function usePieceRecord(id: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<PieceRecordWithPublish>({
    queryKey: ["magazine-piece", id, demoMode],
    queryFn: async () => {
      if (demoMode) {
        return demoRecordForPiece(DEMO_PIECES.find((piece) => piece.id === id));
      }
      const record = await getPiece(id);
      return { ...record, similar: [] };
    },
  });

  return {
    record: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
