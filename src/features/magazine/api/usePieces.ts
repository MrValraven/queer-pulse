import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPieces, PIECE_PAGE_SIZE_MAX } from "./pieces.api";
import type { PieceFormat, PieceStage } from "./pieces.api";
import { pieceDtoToView, STAGE_DTO_TO_VIEW } from "./pieces.adapters";
import { DEMO_PIECES, type Piece } from "../data/desk.data";

/**
 * Filters shared by the desk toolbar/board/pipeline. Shaped to match
 * `ListPiecesFilters` (Task 9's `pieces.api.ts`) field-for-field so it can
 * be passed straight through to `getPieces` in live mode.
 */
export interface PieceFilters {
  format?: PieceFormat;
  editor?: string;
  stage?: PieceStage;
  section?: string;
  issue?: string;
  q?: string;
}

/**
 * Ceiling on how many pages `usePieces` will fetch for one desk load. Guards
 * against an unbounded fan-out of requests if the desk's piece count ever
 * grows far past what a single editor's board can hold.
 */
const MAX_DESK_PAGES = 50;

function matchesFilters(piece: Piece, filters: PieceFilters): boolean {
  if (filters.format && piece.format !== filters.format) return false;
  if (filters.editor && piece.editorId !== filters.editor) return false;
  if (filters.stage && piece.stage !== STAGE_DTO_TO_VIEW[filters.stage])
    return false;
  if (filters.section && piece.section !== filters.section) return false;
  if (filters.q) {
    const query = filters.q.toLowerCase();
    const haystack =
      `${piece.title} ${piece.byline} ${piece.section}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  // `issue` is not modeled on the demo `Piece` view yet, so it's a no-op in demo mode.
  return true;
}

/**
 * Editor desk's pieces list, filtered by pipeline/board/toolbar controls.
 * Demo mode filters the static mock client-side; live mode sends the same
 * filters to `GET /magazine/admin/pieces` and adapts the DTOs to the view
 * shape shared with demo mode.
 */
export function usePieces(filters: PieceFilters = {}) {
  const { demoMode } = useDemoMode();
  const query = useQuery<Piece[]>({
    queryKey: ["magazine-pieces", demoMode, filters],
    queryFn: async () => {
      if (demoMode) {
        return DEMO_PIECES.filter((piece) => matchesFilters(piece, filters));
      }

      // The desk board renders the whole result set, so this pages through
      // every page the server holds. Page 1 (fetched at the server's
      // maximum page size) carries `total`, which sizes the
      // rest of the pages; those are then fetched together and capped at
      // `MAX_DESK_PAGES` so a runaway total can never fan out into an
      // unbounded burst of requests. Pages are concatenated in page order,
      // which keeps the newest-first ordering `MagazineSidebarRecents`
      // relies on, and any id repeated across pages (a piece that moved
      // while paging was in flight) is kept only on its first occurrence.
      const firstPage = await getPieces({
        ...filters,
        page: 1,
        pageSize: PIECE_PAGE_SIZE_MAX,
      });
      const pageCount = Math.min(
        Math.ceil(firstPage.total / PIECE_PAGE_SIZE_MAX),
        MAX_DESK_PAGES,
      );
      const restPageNumbers = Array.from(
        { length: Math.max(pageCount - 1, 0) },
        (_unused, index) => index + 2,
      );
      const restPages = await Promise.all(
        restPageNumbers.map((page) =>
          getPieces({ ...filters, page, pageSize: PIECE_PAGE_SIZE_MAX }),
        ),
      );
      const items = [firstPage, ...restPages].flatMap((page) => page.items);
      const seenIds = new Set<string>();
      const dedupedItems = items.filter((item) => {
        if (seenIds.has(item.id)) return false;
        seenIds.add(item.id);
        return true;
      });
      return dedupedItems.map(pieceDtoToView);
    },
  });

  return {
    pieces: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
