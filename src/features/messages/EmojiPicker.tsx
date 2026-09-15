// src/features/messages/EmojiPicker.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { useEmojiDataset } from "./useEmojiDataset";
import { useEmojiGridVirtualizer } from "./useEmojiGridVirtualizer";
import { EmojiCategoryRail } from "./EmojiCategoryRail";
import { EmojiGrid } from "./EmojiGrid";
import { filterEmojiEntries, normalizeEmojiQuery } from "./emojiSearch";
import {
  buildEmojiSections,
  buildSearchResultSections,
  type EmojiGridItem,
  type EmojiSection,
} from "./emojiSections";
import {
  loadEmojiRecents,
  recordEmojiRecent,
  type RecentEmoji,
} from "./emojiRecents";
import styles from "./EmojiPicker.module.css";

interface EmojiPickerProps {
  /** Inserts the picked glyph into the composer draft — see `useInsertEmoji`
   *  (owned by `EmojiComposerButton`) for why this never touches DOM focus. */
  onPick: (glyph: string) => void;
}

/**
 * The desktop emoji picker popover: a category rail, a search field and a
 * virtualized grid over the full dataset — modelled directly on `GifPicker`,
 * in WhatsApp's own top-to-bottom order (tabs first, then the field).
 *
 * The dataset loads through a dynamic `import()` on first open
 * (`useEmojiDataset`) so its ~81KB chunk is fetched on demand and never
 * enters the composer's own bundle. Recents (device-local, `emojiRecents.ts`)
 * are the first section, omitted entirely when empty rather than shown as a
 * blank band; a live search replaces the grid's recents + categories with one
 * flat "results" section.
 *
 * The rail stays mounted through that search rather than being dropped (it
 * used to be, back when it sat BELOW the field and could vanish without
 * moving anything): now that it's the panel's first row, unmounting it would
 * yank the field out from under whoever is typing in it. It is built from
 * `categorySections`, which ignores the query entirely, so the tabs neither
 * collapse to the single synthetic "results" section nor reshuffle mid-type
 * — and a tab clicked during a search clears the query, which is the only
 * thing "jump to a group" can sensibly mean from a flat result list.
 *
 * No local Escape/outside-click handling here — `useComposerPopovers`
 * already owns that for every composer popover, and `EmojiComposerButton`
 * owns returning focus to the textarea on close (see its own doc for why a
 * LOCAL Escape listener here turned out not to reliably fire at all: a real
 * browser trace showed the outer listener always wins the race and unmounts
 * this component first).
 */
export function EmojiPicker({ onPick }: EmojiPickerProps) {
  const { t, language } = useTranslation();
  const datasetState = useEmojiDataset();
  const [recents, setRecents] = useState<RecentEmoji[]>(() =>
    loadEmojiRecents(),
  );
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const normalizedQuery = normalizeEmojiQuery(debouncedQuery);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // What the rail's tabs are built from: the real category list, derived
  // without any reference to the query, so searching never reshapes it.
  const categorySections: EmojiSection[] = useMemo(() => {
    if (datasetState.status !== "ready") return [];
    return buildEmojiSections(
      datasetState.dataset.groupOrder,
      datasetState.dataset.entries,
      recents,
    );
  }, [datasetState, recents]);

  const sections: EmojiSection[] = useMemo(() => {
    if (datasetState.status !== "ready") return [];
    if (!normalizedQuery) return categorySections;
    const results = filterEmojiEntries(
      datasetState.dataset.entries,
      normalizedQuery,
    );
    return buildSearchResultSections(results);
  }, [categorySections, datasetState, normalizedQuery]);

  const {
    containerRef,
    rows,
    columnCount,
    sectionFirstRowIndex,
    rowVirtualizer,
    activeSectionKey,
  } = useEmojiGridVirtualizer(sections);

  // The section a rail jump is currently sweeping toward, held separately
  // from `activeSectionKey` so the rail can show that target immediately
  // instead of waiting for the scroll-spy to catch up. A `behavior: "smooth"`
  // jump takes a few hundred ms and strobes through every section it passes
  // over on the way; pinning the rail to the target for that stretch (via
  // `pendingSectionKey ?? activeSectionKey` below) is what prevents that
  // strobe.
  const [pendingSectionKey, setPendingSectionKey] = useState<string | null>(
    null,
  );
  const pendingSectionTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);
  // What `sections` was as of the last render, purely so the render-time
  // reset below can detect a reshape (a search starting/ending swaps the
  // whole list). Held in state rather than a ref: this codebase's
  // `react-hooks/refs` rule forbids reading or writing a ref's `current`
  // during render (only effects/handlers may touch one), so the plain
  // `useState` "previous value" comparison React's own docs use for
  // adjusting state during render is the correct tool here, not a ref.
  const [previousSections, setPreviousSections] = useState(sections);

  // Clears the pending key the moment either condition below holds, using
  // React's sanctioned "adjust state while rendering" idiom (the same shape
  // `EmojiGrid.tsx`'s own `clampedActiveRow` clamp already uses) rather than
  // a `useEffect`: a `setState` called synchronously in an effect body is
  // itself a redundant extra render pass the lint rule `set-state-in-effect`
  // flags, and both checks below are cheap enough to run on every render:
  //   1. The scroll-spy actually reached the pending section, the ordinary,
  //      happy-path resolution of a jump.
  //   2. `sections` reshaped since the jump was issued, so the row index it
  //      targeted is stale the instant that happens, so the pending
  //      highlight is dropped rather than risk pointing at a section that
  //      may not even exist in the new list.
  if (pendingSectionKey !== null && activeSectionKey === pendingSectionKey) {
    setPendingSectionKey(null);
  }
  if (sections !== previousSections) {
    setPreviousSections(sections);
    if (pendingSectionKey !== null) {
      setPendingSectionKey(null);
    }
  }

  // Safety net: a pending key must never wedge the rail on a section it can
  // never reach, e.g. the user scrolls away mid-animation, or the target
  // section is short enough that the spy skips past it as "active" without
  // ever landing exactly on it as topmost. A generous timeout (longer than
  // any realistic smooth-scroll duration) clears it unconditionally; this
  // genuinely is effect territory (it subscribes to an external timer and
  // must clean it up), unlike the two render-time resets above.
  useEffect(() => {
    if (pendingSectionKey === null) return;
    pendingSectionTimeoutRef.current = setTimeout(() => {
      setPendingSectionKey(null);
    }, 1000);
    return () => clearTimeout(pendingSectionTimeoutRef.current);
  }, [pendingSectionKey]);

  function handlePick(item: EmojiGridItem) {
    recordEmojiRecent(item);
    setRecents(loadEmojiRecents());
    onPick(item.glyph);
  }

  function handleSelectSection(sectionKey: string) {
    // A category tab is also the way out of a search — the grid is showing
    // one flat "results" list, and picking a group plainly means "show me the
    // groups again". The jump itself then only applies when the grid already
    // HAS that group as rows: mid-search `sectionFirstRowIndex` holds nothing
    // but "results", so the guard below returns and the clear above is the
    // whole of what the click does. Deliberately not deferred until the
    // (debounced) query catches up 250ms later: the machinery to hold a jump
    // open across that reshape costs more than it buys, since clearing a
    // search already lands the grid at the top of the category list.
    setQuery("");
    const rowIndex = sectionFirstRowIndex[sectionKey];
    if (rowIndex === undefined) return;
    setPendingSectionKey(sectionKey);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    rowVirtualizer.scrollToIndex(rowIndex, {
      align: "start",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <div
      className={styles.panel}
      role="dialog"
      aria-label={t("messages:emoji.panelLabel")}
    >
      <EmojiCategoryRail
        sections={categorySections}
        onSelectSection={handleSelectSection}
        // Nothing reads as current mid-search: the grid's only section is the
        // synthetic "results" one, whose key matches no tab.
        activeSectionKey={pendingSectionKey ?? activeSectionKey}
      />
      <input
        ref={searchRef}
        type="search"
        className={styles.search}
        placeholder={t("messages:emoji.searchPlaceholder")}
        aria-label={t("messages:emoji.searchPlaceholder")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {datasetState.status === "loading" && (
        <p className={styles.state}>{t("messages:emoji.loading")}</p>
      )}
      {datasetState.status === "error" && (
        <p className={styles.state}>{t("messages:emoji.loadError")}</p>
      )}
      {datasetState.status === "ready" && rows.length === 0 && (
        <p className={styles.state}>{t("messages:emoji.empty")}</p>
      )}
      {datasetState.status === "ready" && rows.length > 0 && (
        <EmojiGrid
          containerRef={containerRef}
          rowVirtualizer={rowVirtualizer}
          rows={rows}
          columnCount={columnCount}
          language={language}
          onPick={handlePick}
        />
      )}
    </div>
  );
}
