import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useAuth } from "../../app/providers/authContext";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  isStudioLibrarySort,
  type StudioLibrarySort,
} from "./studioLibrarySort.data";

/** sessionStorage, one entry per member: the rail list's scroll offset and
 *  its sort. It dies with the tab. */
export const STUDIO_RAIL_MEMORY_PREFIX = "qp.studio.railPlaylists.v1.";

interface RailMemory {
  scrollTop: number;
  sort: StudioLibrarySort;
  /** The filter box's text. */
  query: string;
}

const EMPTY_MEMORY: RailMemory = { scrollTop: 0, sort: "recent", query: "" };
/** A filter longer than this is not a playlist name: it is dropped. */
const MAX_QUERY_LENGTH = 200;

function sessionStore(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function readRailMemory(key: string): RailMemory {
  try {
    const raw = sessionStore()?.getItem(key);
    if (!raw) return EMPTY_MEMORY;
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") return EMPTY_MEMORY;
    const scrollTop =
      "scrollTop" in parsed && typeof parsed.scrollTop === "number"
        ? Math.max(0, parsed.scrollTop)
        : 0;
    const sortValue =
      "sort" in parsed && typeof parsed.sort === "string" ? parsed.sort : null;
    const query =
      "query" in parsed &&
      typeof parsed.query === "string" &&
      parsed.query.length <= MAX_QUERY_LENGTH
        ? parsed.query
        : "";
    return {
      scrollTop,
      sort: isStudioLibrarySort(sortValue) ? sortValue : "recent",
      query,
    };
  } catch {
    return EMPTY_MEMORY;
  }
}

function writeRailMemory(key: string, memory: RailMemory): void {
  try {
    sessionStore()?.setItem(key, JSON.stringify(memory));
  } catch {
    // Blocked or full storage: the rail starts at the top next time.
  }
}

/** Every member's rail memory in this tab: Quick Exit and sign-out. */
export function clearStudioRailMemory(): void {
  const store = sessionStore();
  if (!store) return;
  try {
    const keys: string[] = [];
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index);
      if (key?.startsWith(STUDIO_RAIL_MEMORY_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => store.removeItem(key));
  } catch {
    // Blocked storage holds nothing to clear.
  }
}

/** Brings the open playlist's row wholly into the list's view, moving the
 *  list only as far as it must. */
function revealActiveRow(list: HTMLElement, isSmooth: boolean): void {
  const activeRow = list.querySelector<HTMLElement>('[aria-current="page"]');
  if (!activeRow) return;
  const listRect = list.getBoundingClientRect();
  const rowRect = activeRow.getBoundingClientRect();
  let delta = 0;
  if (rowRect.top < listRect.top) delta = rowRect.top - listRect.top;
  else if (rowRect.bottom > listRect.bottom)
    delta = rowRect.bottom - listRect.bottom;
  if (delta === 0) return;
  list.scrollTo({
    top: list.scrollTop + delta,
    behavior: isSmooth ? "smooth" : "auto",
  });
}

/**
 * DES-52: the rail playlist list keeps its place. Its scroll offset, sort
 * and filter text live in sessionStorage per member, so a remount (a cross-route
 * navigation) starts where the member left it, once the rows are there.
 * Then the open playlist's row scrolls into view: at once after a restore,
 * smoothly (unless motion is reduced) on later navigations.
 */
export function useStudioRailMemory(
  listRef: RefObject<HTMLElement | null>,
  { isReady, activeKey }: { isReady: boolean; activeKey: string | null },
): {
  sort: StudioLibrarySort;
  setSort: (sort: StudioLibrarySort) => void;
  query: string;
  setQuery: (query: string) => void;
} {
  const { user } = useAuth();
  const { reducedMotion } = useMotionPrefs();
  const storageKey = `${STUDIO_RAIL_MEMORY_PREFIX}${user?.id ?? "signed-out"}`;
  const [memory] = useState(() => readRailMemory(storageKey));
  const [sort, setSort] = useState<StudioLibrarySort>(memory.sort);
  const [query, setQuery] = useState(memory.query);
  // The last offset seen, so a sort or filter change never writes a 0 read
  // from a list that has not restored yet.
  const scrollTopRef = useRef(memory.scrollTop);
  const choicesRef = useRef({ sort, query });
  const hasRestoredRef = useRef(false);

  // Restore once the rows have rendered, before paint.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !isReady || hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    list.scrollTop = memory.scrollTop;
    revealActiveRow(list, false);
  }, [listRef, isReady, memory.scrollTop]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !hasRestoredRef.current) return;
    revealActiveRow(list, !reducedMotion);
  }, [listRef, activeKey, reducedMotion]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const onScroll = () => {
      if (!hasRestoredRef.current || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        scrollTopRef.current = list.scrollTop;
        writeRailMemory(storageKey, {
          scrollTop: scrollTopRef.current,
          ...choicesRef.current,
        });
      });
    };
    list.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      list.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [listRef, storageKey]);

  useEffect(() => {
    choicesRef.current = { sort, query };
    writeRailMemory(storageKey, {
      scrollTop: scrollTopRef.current,
      sort,
      query,
    });
  }, [storageKey, sort, query]);
  return { sort, setSort, query, setQuery };
}
