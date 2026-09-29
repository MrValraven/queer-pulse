import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const panelRef = useRef<HTMLDivElement>(null);
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

  // Small phones (`--xs`, ≤480px, `src/styles/tokens/breakpoints.css`):
  // `.panel`'s usual `position: absolute` anchor is `ComposerAttachButton`'s
  // `.control` wrapper (the paperclip), and this panel's width ran past the
  // screen's right edge from there. `.panel`'s `@media (--xs)` rule pins it
  // to the viewport's own side margins instead; the one thing pure CSS can't
  // supply is the vertical offset, since a fixed-position panel can no longer
  // read `bottom: calc(100% + 16px)` off `.control`. Reading `.control`
  // directly here (`.panel`'s own DOM `parentElement`, which stays reliable
  // after `.panel` becomes `position: fixed`) reproduces that exact offset as
  // a measured CSS variable, so a
  // taller composer still lands the panel in the right spot on the next
  // resize. Same pattern as `EmojiPicker.tsx`; see that file's own doc.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    function pinToViewport() {
      if (!panel) return;
      const control = panel.parentElement;
      const isNarrow = window.matchMedia("(max-width: 480px)").matches;
      if (!isNarrow || !control) {
        panel.style.removeProperty("--gif-picker-bottom");
        return;
      }
      const controlTop = control.getBoundingClientRect().top;
      const bottomOffset = Math.round(window.innerHeight - controlTop + 16);
      panel.style.setProperty("--gif-picker-bottom", `${bottomOffset}px`);
    }
    pinToViewport();
    window.addEventListener("resize", pinToViewport);
    return () => window.removeEventListener("resize", pinToViewport);
  }, []);

  if (comingSoon) {
    return (
      <div
        ref={panelRef}
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
      ref={panelRef}
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
