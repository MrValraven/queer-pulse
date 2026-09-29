// src/features/messages/StickerPicker.tsx
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStickerPacks } from "../stickers/api/useStickerPacks";
import {
  loadStickerRecents,
  recordStickerRecent,
} from "../stickers/stickerRecents";
import { stickerIndexOf, stickerPackNameIn } from "../stickers/stickerLocale";
import { StickerPackRail } from "./StickerPackRail";
import { StickerPackSections } from "./StickerPackSections";
import { StickerSearchField } from "./StickerSearchField";
import { StickerSearchResults } from "./StickerSearchResults";
import { normalizeStickerSearchText, searchStickers } from "./stickerSearch";
import { useStickerPackScrollSpy } from "./useStickerPackScrollSpy";
import type {
  StickerPackResponse,
  StickerResponse,
} from "../../shared/contracts/contracts";
import styles from "./StickerPicker.module.css";

const NO_PACKS: StickerPackResponse[] = [];

interface StickerPickerProps {
  onPick: (sticker: StickerResponse) => void;
  /** True inside the Stickers tab of `EmojiPicker` on desktop, whose own
   *  `.panel` already supplies the positioned chrome and `role="dialog"`.
   *  Embedded therefore draws neither, so switching tabs never stacks two
   *  floating panels or nests one dialog inside another.
   *
   *  Absent (or false) is the STANDALONE case, the touch attach menu's
   *  Sticker row: this IS the dialog there, so it draws its own chrome at
   *  `EmojiPicker`'s size and position and keeps `role="dialog"`. */
  isEmbedded?: boolean;
}

/**
 * One sticker panel reached from two entry points: the Stickers tab of
 * `EmojiPicker` on desktop, and the attach menu's Sticker row on touch (see
 * `ComposerAttachButton`), built like `EmojiPicker` (rail, scrolling grid).
 *
 * Registers no Escape listener of its own: `useComposerPopovers` owns Escape
 * and outside-click dismissal for every composer popover.
 *
 * Never virtualized: a few hundred small images stay cheap in a plain CSS
 * grid, far short of the emoji dataset the emoji virtualizer exists for.
 *
 * A search field filters across every pack by the sticker's name and its
 * keywords in the reader's language (see `stickerSearch.ts`). While it holds
 * text, one results grid replaces the recents and the pack sections, and the
 * rail steps aside, since there are no sections left to jump between.
 */
export function StickerPicker({
  onPick,
  isEmbedded = false,
}: StickerPickerProps) {
  const { t, language } = useTranslation();
  const { data: packs, isLoading, isError } = useStickerPacks();
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    loadStickerRecents(),
  );
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const stickerById = stickerIndexOf(packs ?? NO_PACKS);
  const hasAnySticker = stickerById.size > 0;
  // The one list of packs that render a section (an empty pack gets no
  // section, ref or rail tile). The rail's own `packs.length < 2` gate and
  // `hasRail` below both read this filtered count, so they always agree on
  // whether the rail shows.
  const packsWithStickers = useMemo(
    () => (packs ?? []).filter((pack) => pack.stickers.length > 0),
    [packs],
  );
  const isSearching = normalizeStickerSearchText(query).length > 0;
  const searchResults = useMemo(
    () => searchStickers(packsWithStickers, query, language),
    [packsWithStickers, query, language],
  );
  // Scopes the last-section scroll-anchoring CSS to exactly the cases
  // `StickerPackRail` actually renders in. Off during a search: the rail is
  // hidden then, and turning it back on when the search ends re-runs the
  // scroll spy's observer against the remounted sections.
  const hasRail = packsWithStickers.length >= 2 && !isSearching;
  // The rail names each pack in the reader's language; every other field
  // (ids, cover, stickers) passes through unchanged.
  const railPacks = useMemo(
    () =>
      packsWithStickers.map((pack) => ({
        ...pack,
        name: stickerPackNameIn(pack, language),
      })),
    [packsWithStickers, language],
  );
  const isCatalogueReady = !isLoading && !isError && Boolean(packs);

  // `stickerById` holds only the current catalogue, so a recent sticker
  // whose pack was unpublished resolves to nothing and drops out.
  const recentStickers = recentIds
    .map((id) => stickerById.get(id))
    .filter((sticker): sticker is StickerResponse => Boolean(sticker));

  function handlePick(sticker: StickerResponse) {
    recordStickerRecent(sticker.id);
    setRecentIds(loadStickerRecents());
    onPick(sticker);
  }

  const { bodyRef, activePackId, registerSection, scrollToPack } =
    useStickerPackScrollSpy(packsWithStickers, hasRail);

  // Each new query starts its results from the top, wherever the browse view
  // had been scrolled to.
  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }

  function handleClearSearch() {
    handleQueryChange("");
    searchInputRef.current?.focus();
  }

  function coverStickerFor(
    pack: StickerPackResponse,
  ): StickerResponse | undefined {
    const coverId = pack.coverStickerId ?? pack.stickers[0]?.id;
    return coverId ? stickerById.get(coverId) : undefined;
  }

  return (
    <div
      className={
        isEmbedded ? styles.panel : `${styles.panel} ${styles.standalone}`
      }
      // Scopes `StickerPicker.module.css`'s last-section min-height rule, which
      // lets a rail tap reach the last pack, to when the rail renders.
      data-has-rail={hasRail || undefined}
      // Embedded sits inside `EmojiPicker`'s own dialog, so only the
      // standalone panel carries `role="dialog"` (see `isEmbedded`).
      {...(isEmbedded
        ? {}
        : {
            role: "dialog" as const,
            "aria-label": t("messages:sticker.panelLabel"),
          })}
    >
      {/* The field is the panel's first row, and the panel holds one fixed
          height (`--composer-popover-max`), so neither the rail stepping
          aside nor a shorter result list moves the field under the finger.
          Results and the empty state start at the top of the body. */}
      {isCatalogueReady && hasAnySticker && (
        <StickerSearchField
          query={query}
          onQueryChange={handleQueryChange}
          isSearching={isSearching}
          resultCount={searchResults.length}
          inputRef={searchInputRef}
        />
      )}
      {isCatalogueReady && !isSearching && (
        <StickerPackRail
          packs={railPacks}
          activePackId={activePackId}
          coverStickerFor={coverStickerFor}
          onSelectPack={scrollToPack}
          ariaLabel={t("messages:sticker.packsLabel")}
        />
      )}
      <div className={styles.body} ref={bodyRef}>
        {isLoading && (
          <p className={styles.state}>{t("messages:sticker.loading")}</p>
        )}
        {isError && (
          <p className={styles.state}>{t("messages:sticker.loadError")}</p>
        )}
        {isCatalogueReady && !hasAnySticker && (
          <p className={styles.state}>{t("messages:sticker.empty")}</p>
        )}
        {isCatalogueReady && hasAnySticker && isSearching && (
          <StickerSearchResults
            query={query}
            results={searchResults}
            onPick={handlePick}
            onClearSearch={handleClearSearch}
          />
        )}
        {isCatalogueReady && hasAnySticker && !isSearching && (
          <StickerPackSections
            recentStickers={recentStickers}
            packs={packsWithStickers}
            registerSection={registerSection}
            onPick={handlePick}
          />
        )}
      </div>
    </div>
  );
}
