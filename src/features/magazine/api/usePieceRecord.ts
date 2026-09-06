import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPiece } from "./pieces.api";
import type { PieceRecordPublishFields } from "./piecePublish.api";
import { DEMO_RECORD, type PieceRecordView } from "../data/pieceRecord.data";

/**
 * What `PieceRecordPage` actually renders: the record plus the publish state
 * from CONTRACT §3 (`isPublished` / `publishedAt` / `publicHref`). The publish
 * fields are optional here on purpose: the demo fixture predates them and a
 * backend that has not shipped them yet must not blank the whole page, so
 * every reader treats an absent field as "not published".
 */
export type PieceRecordWithPublish = PieceRecordView & PieceRecordPublishFields;

/**
 * The full piece record — brief/care/payment/audit/letters/corrections/
 * publishGate — behind `/magazine/editor/piece/:id`. Demo mode always
 * returns the single `DEMO_RECORD` fixture regardless of `id` (there's no
 * demo registry of records the way `useDeck` has `decks.mock`; see that
 * file's comment for the same one-record limitation on this Phase 1/2 slice).
 * Live mode calls `GET /magazine/admin/pieces/:id`, which already returns the
 * full shape (`PieceRecordFull` on the backend), and adds an empty `similar`
 * list since the backend has no similar-pieces endpoint yet.
 *
 * The query key includes `id` (so navigating between pieces in live mode
 * refetches) and `demoMode` (mirrors `usePieces`/`useDeck`), and is prefixed
 * `["magazine-piece", id]` so `usePieceMutations`' `invalidateDesk` — which
 * invalidates that exact prefix — still busts this cache.
 */
export function usePieceRecord(id: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<PieceRecordWithPublish>({
    queryKey: ["magazine-piece", id, demoMode],
    queryFn: async () => {
      if (demoMode) return DEMO_RECORD;
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
