// src/features/messages/StickerPicker.tsx
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStickerPacks } from "../stickers/api/useStickerPacks";
import {
  loadStickerRecents,
  recordStickerRecent,
} from "../stickers/stickerRecents";
import type {
  StickerPackResponse,
  StickerResponse,
} from "../../shared/contracts/contracts";
import styles from "./StickerPicker.module.css";

interface StickerPickerProps {
  onPick: (sticker: StickerResponse) => void;
  /** True when this panel is rendering INSIDE another panel's chrome, the
   *  Stickers tab of `EmojiPicker` on desktop, which already supplies the
   *  outer positioned panel, border, shadow, background, and its own
   *  `role="dialog"` (`EmojiPicker`'s own `.panel`). Embedded therefore
   *  draws neither its own chrome nor its own dialog role: the panel below
   *  omits BOTH `position`/border/shadow/background AND `role="dialog"`/
   *  `aria-label` when this is true, so switching tabs never stacks two
   *  floating panels, or two nested `role="dialog"` regions (a real ARIA
   *  violation `EmojiPicker`'s own `role="tabpanel"` wrapper already labels
   *  this region for), on top of each other.
   *
   *  Absent (or false) is the STANDALONE case, the touch attach menu's
   *  Sticker row, which has no other panel around it: this IS the dialog
   *  there, so it draws its own full chrome, the same size and position
   *  `EmojiPicker` uses, and keeps `role="dialog"`/`aria-label`. */
  isEmbedded?: boolean;
}

interface StickerTileProps {
  sticker: StickerResponse;
  onPick: (sticker: StickerResponse) => void;
}

/** One grid cell: a real button whose accessible name is the sticker's own
 *  label, wrapping a decorative `<img>` (the button already carries the
 *  name, so the image itself needs none). Explicit `width`/`height` come
 *  straight from the catalogue entry, matching the image's own intrinsic
 *  size so the tile never shifts layout while it loads; the CSS module
 *  scales the box visually regardless of that intrinsic size. */
function StickerTile({ sticker, onPick }: StickerTileProps) {
  return (
    <button
      type="button"
      className={styles.stickerBtn}
      aria-label={sticker.label}
      onClick={() => onPick(sticker)}
    >
      <img
        src={sticker.url}
        alt=""
        width={sticker.width}
        height={sticker.height}
      />
    </button>
  );
}

/**
 * One sticker panel reached from two entry points: the Stickers tab of
 * `EmojiPicker` on desktop, and the attach menu's Sticker row on touch (see
 * `ComposerAttachButton`). Modelled on `EmojiPicker`'s own structure (a rail,
 * then a scrolling grid) and on `GifPicker`'s loading/error/empty states.
 *
 * Registers no Escape listener of its own: `useComposerPopovers` already
 * owns Escape and outside-click dismissal for every composer popover, and a
 * real browser trace in this composer proved a listener inside a panel never
 * wins that race.
 *
 * Never virtualized: the catalogue is at most a few hundred small images,
 * far short of the 1,914-entry emoji dataset the emoji grid's virtualizer
 * exists for, so a plain CSS grid over the full list is simpler and cheap
 * enough on its own.
 */
export function StickerPicker({
  onPick,
  isEmbedded = false,
}: StickerPickerProps) {
  const { t } = useTranslation();
  const { data: packs, isLoading, isError } = useStickerPacks();
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    loadStickerRecents(),
  );
  const packSectionRefs = useRef(new Map<string, HTMLDivElement>());

  const stickerById = useMemo(() => {
    const map = new Map<string, StickerResponse>();
    for (const pack of packs ?? []) {
      for (const sticker of pack.stickers) map.set(sticker.id, sticker);
    }
    return map;
  }, [packs]);
  const hasAnySticker = stickerById.size > 0;

  // Dropped rather than shown blank the moment a recent sticker's own pack
  // gets unpublished: `stickerById` only ever holds the CURRENT catalogue, so
  // a stale recent id simply resolves to nothing here.
  const recentStickers = recentIds
    .map((id) => stickerById.get(id))
    .filter((sticker): sticker is StickerResponse => Boolean(sticker));

  function handlePick(sticker: StickerResponse) {
    recordStickerRecent(sticker.id);
    setRecentIds(loadStickerRecents());
    onPick(sticker);
  }

  function scrollToPack(packId: string) {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    packSectionRefs.current.get(packId)?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
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
      // Embedded: `EmojiPicker`'s own `.panel` already carries `role="dialog"`
      // and its `role="tabpanel"` wrapper already labels this region, so a
      // second `role="dialog"` here would nest one dialog inside another, a
      // real ARIA violation. Standalone (the touch attach menu): this panel
      // IS the dialog, so it keeps both. Never render `role="dialog"`
      // unconditionally here again.
      {...(isEmbedded
        ? {}
        : {
            role: "dialog" as const,
            "aria-label": t("messages:sticker.panelLabel"),
          })}
    >
      {!isLoading && !isError && packs && packs.length > 1 && (
        <div
          className={styles.packRail}
          role="toolbar"
          aria-label={t("messages:sticker.packsLabel")}
        >
          {packs.map((pack) => {
            const cover = coverStickerFor(pack);
            return (
              <button
                key={pack.id}
                type="button"
                className={styles.packTile}
                aria-label={pack.name}
                onClick={() => scrollToPack(pack.id)}
              >
                {cover && <img src={cover.url} alt="" width={28} height={28} />}
              </button>
            );
          })}
        </div>
      )}
      <div className={styles.body}>
        {isLoading && (
          <p className={styles.state}>{t("messages:sticker.loading")}</p>
        )}
        {isError && (
          <p className={styles.state}>{t("messages:sticker.loadError")}</p>
        )}
        {!isLoading && !isError && !hasAnySticker && (
          <p className={styles.state}>{t("messages:sticker.empty")}</p>
        )}
        {!isLoading && !isError && hasAnySticker && (
          <>
            {recentStickers.length > 0 && (
              <div className={styles.section}>
                <p className={styles.sectionHeader}>
                  {t("messages:sticker.recentsLabel")}
                </p>
                <div
                  className={styles.grid}
                  role="group"
                  aria-label={t("messages:sticker.recentsLabel")}
                >
                  {recentStickers.map((sticker) => (
                    <StickerTile
                      key={sticker.id}
                      sticker={sticker}
                      onPick={handlePick}
                    />
                  ))}
                </div>
              </div>
            )}
            {(packs ?? []).map(
              (pack) =>
                pack.stickers.length > 0 && (
                  <div
                    key={pack.id}
                    className={styles.section}
                    ref={(node) => {
                      if (node) packSectionRefs.current.set(pack.id, node);
                      else packSectionRefs.current.delete(pack.id);
                    }}
                  >
                    <p className={styles.sectionHeader}>{pack.name}</p>
                    <div
                      className={styles.grid}
                      role="group"
                      aria-label={pack.name}
                    >
                      {pack.stickers.map((sticker) => (
                        <StickerTile
                          key={sticker.id}
                          sticker={sticker}
                          onPick={handlePick}
                        />
                      ))}
                    </div>
                  </div>
                ),
            )}
          </>
        )}
      </div>
    </div>
  );
}
