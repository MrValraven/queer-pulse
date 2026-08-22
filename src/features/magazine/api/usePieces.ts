import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPieces,
  PIECE_PAGE_SIZE_MAX,
} from "./pieces.api";
import type { PieceFormat, PieceStage, SavedViewId } from "./pieces.api";
import { pieceDtoToView, STAGE_DTO_TO_VIEW } from "./pieces.adapters";
import { DEMO_PIECES, type Piece } from "../data/desk.data";
import { VIEW_TEST } from "../data/desk.copy";

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
  savedView?: SavedViewId;
}

function matchesFilters(piece: Piece, filters: PieceFilters): boolean {
  if (filters.format && piece.format !== filters.format) return false;
  if (filters.editor && piece.editorId !== filters.editor) return false;
  if (filters.stage && piece.stage !== STAGE_DTO_TO_VIEW[filters.stage]) return false;
  if (filters.section && piece.section !== filters.section) return false;
  if (filters.savedView) {
    const viewTest = VIEW_TEST[filters.savedView];
    if (!viewTest(piece)) return false;
  }
  if (filters.q) {
    const query = filters.q.toLowerCase();
    const haystack = `${piece.title} ${piece.byline} ${piece.section}`.toLowerCase();
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

      // The desk board has no pager yet, so ask for the server's maximum page
      // rather than silently rendering the first 50 as if it were the whole
      // board. Add a pager here when a real desk outgrows 200 open pieces.
      const page = await getPieces({
        ...filters,
        pageSize: PIECE_PAGE_SIZE_MAX,
      });
      return page.items.map(pieceDtoToView);
    },
  });

  return { pieces: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
}
