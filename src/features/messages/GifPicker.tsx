import { useEffect, useRef, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isGifProviderConfigured,
  type GifAttachment,
  type GifResult,
} from "../../shared/api/gifs";
import { useGifSearch } from "./useGifSearch";
import styles from "./GifPicker.module.css";

interface GifPickerProps {
  onPick: (attachment: GifAttachment) => void;
  onClose: () => void;
}

/** KLIPY-powered GIF picker popover. Trending on open, debounced search, tap to
 *  send. Demo mode uses a curated set (no key, no network). */
export function GifPicker({ onPick, onClose }: GifPickerProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { results, loading, error, hasMore, loadMore } = useGifSearch(
    query,
    demoMode,
  );

  // Live mode without a configured provider (KLIPY key unset): the feature isn't
  // wired to a live source yet, so present it as coming soon rather than a
  // dead search box. Demo mode always has curated GIFs, so it's exempt.
  const comingSoon = !demoMode && !isGifProviderConfigured;

  useEffect(() => {
    if (!comingSoon) searchRef.current?.focus();
  }, [comingSoon]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (comingSoon) {
    return (
      <div
        className={styles.panel}
        role="dialog"
        aria-label={t("messages:gif.panelLabel")}
      >
        <div className={styles.body}>
          <p className={styles.comingSoon}>{t("messages:gif.comingSoonTitle")}</p>
          <p className={styles.comingSoonHint}>
            {t("messages:gif.comingSoonHint")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.panel}
      role="dialog"
      aria-label={t("messages:gif.panelLabel")}
    >
      <input
        ref={searchRef}
        type="search"
        className={styles.search}
        placeholder={t("messages:gif.searchPlaceholder")}
        aria-label={t("messages:gif.searchPlaceholder")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className={styles.body}>
        {error ? (
          <p className={styles.state}>{t("messages:gif.error")}</p>
        ) : results.length === 0 && !loading ? (
          <p className={styles.state}>{t("messages:gif.empty")}</p>
        ) : (
          <>
            <GifGrid results={results} onPick={onPick} />
            {loading && (
              <p className={styles.state}>{t("messages:gif.loading")}</p>
            )}
            {hasMore && !loading && (
              <button
                type="button"
                className={styles.loadMore}
                onClick={loadMore}
              >
                {t("messages:gif.loadMore")}
              </button>
            )}
          </>
        )}
      </div>
      <div className={styles.attribution}>{t("messages:gif.poweredBy")}</div>
    </div>
  );
}

/** Fallback intrinsic size for a GIF result whose provider payload omits
 *  width/height — matches `.tile`'s own `aspect-ratio: 1 / 1` (GifPicker.module.css)
 *  so the `<img>` always carries a concrete, correctly-proportioned intrinsic
 *  size instead of `undefined`, which would otherwise let the browser's
 *  default (no-ratio) box reflow once the image loads. */
const FALLBACK_TILE_DIMENSION = 160;

/** The 2-column grid of GIF thumbnails. Each tile is a real button with the
 *  GIF's description as its accessible name; intrinsic width/height are set so
 *  the grid reserves space (no layout shift). */
function GifGrid({
  results,
  onPick,
}: {
  results: GifResult[];
  onPick: (attachment: GifAttachment) => void;
}) {
  return (
    <div className={styles.grid}>
      {results.map((result) => (
        <button
          key={result.id}
          type="button"
          className={styles.tile}
          aria-label={result.description}
          onClick={() => onPick(result.attachment)}
        >
          <img
            className={styles.tileImage}
            src={result.attachment.previewUrl}
            width={result.attachment.width || FALLBACK_TILE_DIMENSION}
            height={result.attachment.height || FALLBACK_TILE_DIMENSION}
            loading="lazy"
            alt=""
          />
        </button>
      ))}
    </div>
  );
}
