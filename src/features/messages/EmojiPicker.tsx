// src/features/messages/EmojiPicker.tsx
import {
  Suspense,
  lazy,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { useEmojiDataset } from "./useEmojiDataset";
import { useEmojiGridVirtualizer } from "./useEmojiGridVirtualizer";
import { useEmojiPickerSectionJump } from "./useEmojiPickerSectionJump";
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
import type { StickerResponse } from "../../shared/contracts/contracts";
import styles from "./EmojiPicker.module.css";

// Dynamically imported, mirroring `useEmojiDataset.ts`'s own precedent for
// keeping weight out of the composer's own bundle: most opens of this panel
// never touch the Stickers tab at all, so its chunk (the sticker grid plus
// `useStickerPacks`) only loads the first time that tab is actually clicked.
const StickerPicker = lazy(() =>
  import("./StickerPicker").then((module) => ({
    default: module.StickerPicker,
  })),
);

type EmojiPickerTab = "emoji" | "stickers";

interface EmojiPickerTabRailProps {
  activeTab: EmojiPickerTab;
  onSelectTab: (tab: EmojiPickerTab) => void;
  emojiTabId: string;
  stickersTabId: string;
  panelId: string;
}

/** The WAI-ARIA tabs pattern's arrow-key targets: ArrowRight/ArrowLeft move
 *  to the other tab (with exactly two tabs, "next" and "previous" both land
 *  on the same place, which is wrap-around already handled for free), Home
 *  selects the first, End the last. Any other key is left alone. A plain
 *  function (not a hook): it reads no component state of its own. */
function nextTabForArrowKey(
  key: string,
  activeTab: EmojiPickerTab,
): EmojiPickerTab | null {
  if (key === "ArrowRight" || key === "ArrowLeft") {
    return activeTab === "emoji" ? "stickers" : "emoji";
  }
  if (key === "Home") return "emoji";
  if (key === "End") return "stickers";
  return null;
}

/** The two-item segmented rail (Emoji / Stickers) sitting above the existing
 *  category rail, a real ARIA tablist so the two tabs read correctly to
 *  assistive tech: `role="tab"` with `aria-selected`, a roving tab stop (only
 *  the active tab is in the Tab order), `aria-controls` pointing at the one
 *  shared content region both tabs swap in and out of, and the matching
 *  ArrowLeft/ArrowRight/Home/End handler the roving tab stop exists to
 *  support: without it, Tab alone can reach the active tab but nothing else
 *  can reach the inactive one from the keyboard at all. */
function EmojiPickerTabRail({
  activeTab,
  onSelectTab,
  emojiTabId,
  stickersTabId,
  panelId,
}: EmojiPickerTabRailProps) {
  const { t } = useTranslation();
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const stickersButtonRef = useRef<HTMLButtonElement>(null);

  function handleTabRailKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const nextTab = nextTabForArrowKey(event.key, activeTab);
    if (!nextTab) return;
    event.preventDefault();
    onSelectTab(nextTab);
    const nextButtonRef =
      nextTab === "emoji" ? emojiButtonRef : stickersButtonRef;
    nextButtonRef.current?.focus();
  }

  return (
    <div
      className={styles.tabRail}
      role="tablist"
      aria-label={t("messages:emoji.tabsLabel")}
    >
      <button
        ref={emojiButtonRef}
        id={emojiTabId}
        type="button"
        role="tab"
        className={
          activeTab === "emoji"
            ? `${styles.tabBtn} ${styles.tabBtnActive}`
            : styles.tabBtn
        }
        aria-selected={activeTab === "emoji"}
        aria-controls={panelId}
        tabIndex={activeTab === "emoji" ? 0 : -1}
        onClick={() => onSelectTab("emoji")}
        onKeyDown={handleTabRailKeyDown}
      >
        {t("messages:emoji.tabEmoji")}
      </button>
      <button
        ref={stickersButtonRef}
        id={stickersTabId}
        type="button"
        role="tab"
        className={
          activeTab === "stickers"
            ? `${styles.tabBtn} ${styles.tabBtnActive}`
            : styles.tabBtn
        }
        aria-selected={activeTab === "stickers"}
        aria-controls={panelId}
        tabIndex={activeTab === "stickers" ? 0 : -1}
        onClick={() => onSelectTab("stickers")}
        onKeyDown={handleTabRailKeyDown}
      >
        {t("messages:emoji.tabStickers")}
      </button>
    </div>
  );
}

interface EmojiPickerProps {
  /** Inserts the picked glyph into the composer draft — see `useInsertEmoji`
   *  (owned by `EmojiComposerButton`) for why this never touches DOM focus. */
  onPick: (glyph: string) => void;
  /** Sending a sticker from the Stickers tab. Absent on a surface that
   *  cannot send one, in which case the tab is not rendered at all. */
  onPickSticker?: (sticker: StickerResponse) => void;
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
 *
 * `onPickSticker` present adds a two-item segmented rail (a real ARIA
 * tablist, `EmojiPickerTabRail`) above the category rail: Emoji and
 * Stickers, defaulting to Emoji. The Stickers tab swaps the whole content
 * region for `StickerPicker` (lazily imported, the same `useEmojiDataset`
 * chunk-splitting precedent), rendered `isEmbedded` so it fills this panel's
 * own chrome instead of drawing a second one: this outer `.panel` and its
 * `role="dialog"` stay mounted across the tab switch either way.
 */
export function EmojiPicker({ onPick, onPickSticker }: EmojiPickerProps) {
  const { t, language } = useTranslation();
  const datasetState = useEmojiDataset();
  const [recents, setRecents] = useState<RecentEmoji[]>(() =>
    loadEmojiRecents(),
  );
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const normalizedQuery = normalizeEmojiQuery(debouncedQuery);
  const searchRef = useRef<HTMLInputElement>(null);
  // Which tab is showing. Holding this here (rather than in a caller) keeps
  // the tab a purely visual affordance: closing and reopening the popover
  // always lands back on Emoji, the same way the search field always clears.
  const [activeTab, setActiveTab] = useState<EmojiPickerTab>("emoji");
  const idPrefix = useId();
  const emojiTabId = `${idPrefix}-emoji-tab`;
  const stickersTabId = `${idPrefix}-stickers-tab`;
  const tabPanelId = `${idPrefix}-tabpanel`;

  useEffect(() => {
    // Focusing the search field only makes sense on the Emoji tab; the
    // Stickers tab has no field of its own to steal focus from.
    if (activeTab === "emoji") searchRef.current?.focus();
  }, [activeTab]);

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

  // The rail's jump-to-section bookkeeping, split into its own hook to keep
  // this component under the line cap; see that file's own doc.
  const { pendingSectionKey, handleSelectSection } = useEmojiPickerSectionJump({
    sections,
    sectionFirstRowIndex,
    activeSectionKey,
    scrollToIndex: rowVirtualizer.scrollToIndex,
    onBeforeJump: () => setQuery(""),
  });

  function handlePick(item: EmojiGridItem) {
    recordEmojiRecent(item);
    setRecents(loadEmojiRecents());
    onPick(item.glyph);
  }

  return (
    <div
      className={styles.panel}
      role="dialog"
      aria-label={t("messages:emoji.panelLabel")}
    >
      {/* Rendered only when this surface can actually send a sticker, so no
          surface grows a tab that leads nowhere. */}
      {onPickSticker && (
        <EmojiPickerTabRail
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          emojiTabId={emojiTabId}
          stickersTabId={stickersTabId}
          panelId={tabPanelId}
        />
      )}
      {activeTab === "stickers" && onPickSticker ? (
        <div
          id={tabPanelId}
          role="tabpanel"
          aria-labelledby={stickersTabId}
          className={styles.tabPanel}
        >
          <Suspense
            fallback={
              <p className={styles.state}>{t("messages:sticker.loading")}</p>
            }
          >
            <StickerPicker onPick={onPickSticker} isEmbedded />
          </Suspense>
        </div>
      ) : (
        <div
          id={tabPanelId}
          role="tabpanel"
          aria-labelledby={onPickSticker ? emojiTabId : undefined}
          className={styles.tabPanel}
        >
          <EmojiCategoryRail
            sections={categorySections}
            onSelectSection={handleSelectSection}
            // Nothing reads as current mid-search: the grid's only section is
            // the synthetic "results" one, whose key matches no tab.
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
      )}
    </div>
  );
}
