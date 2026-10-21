import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { SavedItem } from "../../../app/providers/useSaved";
import { apiGet } from "../../../shared/api/client";
import { dtoToSavedItem, type SavedItemDTO } from "../../members/api/saved.api";
import { DEMO_LIBRARY_SAVES } from "../studioLibrary.data";
import type { StudioPageDTO } from "./studio.types";
import {
  useStudioCursorPages,
  type StudioCursorPagesResult,
} from "./useStudioCursorPages";
import { useStudioAccess } from "./useStudioAccess";

/** ENG-04: the Library kinds that page from the server. */
export type StudioSavedPageKind = "studio_release" | "studio_playlist";

/** `GET /me/saved?kind=&cursor=`: the page-number envelope plus the next
 *  page's cursor, null on the last page. `total` counts the whole kind. */
interface StudioSavedPageDTO {
  items: SavedItemDTO[];
  total: number;
  page: number;
  pageSize: number;
  nextCursor: string | null;
}

/** The server's page size, which the demo pages by too. */
const SAVED_PAGE_SIZE = 20;
const DEMO_CURSOR_PREFIX = "demo:";

export const studioSavedPageKey = (
  demoMode: boolean,
  kind: StudioSavedPageKind,
) => ["studio", "savedPage", demoMode, kind] as const;

async function getStudioSavedPage(
  kind: StudioSavedPageKind,
  cursor: string | null,
): Promise<StudioPageDTO<SavedItemDTO>> {
  const query = new URLSearchParams({ kind });
  if (cursor) query.set("cursor", cursor);
  const page = await apiGet<StudioSavedPageDTO>(`/me/saved?${query}`);
  return {
    items: page.items,
    pageInfo: {
      nextCursor: page.nextCursor,
      hasMore: page.nextCursor !== null,
    },
  };
}

/** The demo pages the library fixture by 20, with an offset cursor. */
function demoStudioSavedPage(
  kind: StudioSavedPageKind,
  cursor: string | null,
): StudioPageDTO<SavedItem> {
  const offsetText = cursor?.startsWith(DEMO_CURSOR_PREFIX)
    ? cursor.slice(DEMO_CURSOR_PREFIX.length)
    : "0";
  const offset = Number.parseInt(offsetText, 10) || 0;
  const kindSaves = DEMO_LIBRARY_SAVES.filter((item) => item.kind === kind);
  const nextOffset = offset + SAVED_PAGE_SIZE;
  const hasMore = nextOffset < kindSaves.length;
  return {
    items: kindSaves.slice(offset, nextOffset),
    pageInfo: {
      nextCursor: hasMore ? `${DEMO_CURSOR_PREFIX}${nextOffset}` : null,
      hasMore,
    },
  };
}

/** Live pages arrive as DTOs; the demo fixture is already in the view
 *  shape. */
function toSavedView(entry: SavedItemDTO | SavedItem): SavedItem {
  return "savedAt" in entry ? dtoToSavedItem(entry) : entry;
}

/**
 * ENG-04: one Studio save kind, newest first, 20 a page through the saved
 * cursor, so Library reaches saves older than the bootstrap's newest 20.
 * Demo pages the library fixture (`DEMO_LIBRARY_SAVES`). "Show more" calls
 * `fetchNextPage`; nothing fetches on its own, so a failed page never loops.
 */
export function useStudioSavedPage(
  kind: StudioSavedPageKind,
): StudioCursorPagesResult<SavedItem> {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const pages = useStudioCursorPages<SavedItemDTO | SavedItem, SavedItem>({
    queryKey: studioSavedPageKey(demoMode, kind),
    enabled: demoMode || hasAccess,
    read: (cursor) =>
      demoMode
        ? Promise.resolve(demoStudioSavedPage(kind, cursor))
        : getStudioSavedPage(kind, cursor),
    toView: toSavedView,
  });
  // A save that repeats at a page boundary (the cursor item was unsaved
  // between two reads) renders once: the first copy wins.
  const uniqueItems = useMemo(() => {
    const seenIds = new Set<string>();
    return pages.items.filter((item) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
  }, [pages.items]);
  return { ...pages, items: uniqueItems };
}
