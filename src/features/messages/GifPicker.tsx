import { useEffect, useRef, useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";
import {
  isGifProviderConfigured,
  type GifAttachment,
} from "../../shared/api/gifs";
import { useGifSearch } from "./useGifSearch";
import { GifGrid } from "./GifGrid";
import styles from "./GifPicker.module.css";

// KLIPY's own site: the target of the "Powered by KLIPY" attribution link
// (DES-205), specific to this picker's markup.
const KLIPY_SITE_URL = "https://klipy.com";

interface GifPickerProps {
  onPick: (attachment: GifAttachment) => void;
  onClose: () => void;
}

/** KLIPY-powered GIF picker popover. Trending on open, debounced search, tap to
 *  send. Demo mode uses a curated set (no key, no network). */
export function GifPicker({ onPick }: GifPickerProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const { results, loading, error, hasMore, loadMore } = useGifSearch(
    query,
    demoMode,
  );

  // Live mode without a configured provider (KLIPY key unset): the feature
  // isn't wired to a live source yet, so this shows a coming-soon message
  // confirming it's on the way. Demo mode always has curated GIFs, so it's
  // exempt.
  const comingSoon = !demoMode && !isGifProviderConfigured;

  useEffect(() => {
    if (!comingSoon) searchRef.current?.focus();
  }, [comingSoon]);

  if (comingSoon) {
    return (
      <div
        className={styles.panel}
        role="dialog"
        aria-label={t("messages:gif.panelLabel")}
      >
        <div className={styles.body}>
          <p className={styles.comingSoon}>
            {t("messages:gif.comingSoonTitle")}
          </p>
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
      <div className={styles.body} ref={scrollRootRef}>
        {error ? (
          <p className={styles.state}>{t("messages:gif.error")}</p>
        ) : results.length === 0 && !loading ? (
          <p className={styles.state}>{t("messages:gif.empty")}</p>
        ) : (
          <>
            {results.length > 0 && (
              <GifGrid
                results={results}
                onPick={onPick}
                prefersReducedMotion={prefersReducedMotion}
                gridLabel={t("messages:gif.gridLabel")}
                resetKey={query}
                scrollRootRef={scrollRootRef}
              />
            )}
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
      {/* A real external link (DES-205) to KLIPY's own site, opening in a new
          tab, with the same house external-link screen-reader gloss
          `linkify.tsx` uses for a link leaving QueerPulse mid-conversation. */}
      <a
        className={styles.attribution}
        href={KLIPY_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("messages:gif.poweredBy")}
        <span className={styles.attributionIcon} aria-hidden>
          <FiExternalLink />
        </span>
        <span className="visuallyHidden">
          {t("messages:link.opensExternally")}
        </span>
      </a>
    </div>
  );
}
