import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LIMITS } from "./api/studio.types";
import { studioSearchPath } from "./studioPaths";
import { useStudioRecentSearches } from "./studioRecentSearches";
import { useStudioListeningPreferences } from "./player/useStudioPlayerPreferences";
import { studioSearchKeyShortcuts } from "./useStudioSearchShortcut";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import css from "./StudioShellSearch.module.css";

/** The topbar search: submits to /studio/search?q=. On /studio/search the
 *  page's own field is the one search (DES-39), so the topbar leaves its
 *  slot empty at every width. StudioShell holds the "/" and Cmd+K shortcut
 *  (DES-59), which focuses this field or the page's. */
export function StudioShellSearch() {
  const location = useLocation();
  if (location.pathname === routes.studioSearch) return null;
  return <StudioShellSearchField />;
}

/** One 2D context for every measure, made on the first: a resize fires the
 *  measure many times a second. */
let measureContext: CanvasRenderingContext2D | null | undefined;
function placeholderMeasureContext(): CanvasRenderingContext2D | null {
  if (measureContext === undefined)
    measureContext = document.createElement("canvas").getContext("2d");
  return measureContext;
}

/** True while `text` fits the input's content box in the input's own font.
 *  A narrow topbar (a 1024px window beside the rail) then shows the short
 *  placeholder instead of one cut mid-word, in either language. The first
 *  measure runs before the first paint, so the long placeholder never
 *  flashes in a field too narrow for it. */
function usePlaceholderFits(
  inputRef: RefObject<HTMLInputElement | null>,
  text: string,
) {
  const [isFitting, setIsFitting] = useState(true);
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || typeof ResizeObserver === "undefined") return;
    let isActive = true;
    const measure = () => {
      if (!isActive) return;
      const context = placeholderMeasureContext();
      if (!context) return;
      const style = getComputedStyle(input);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const available =
        input.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      setIsFitting(context.measureText(text).width <= available);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(input);
    // The webfont can land after the first measure and change the width.
    void document.fonts?.ready.then(measure);
    return () => {
      isActive = false;
      observer.disconnect();
    };
  }, [inputRef, text]);
  return isFitting;
}

function StudioShellSearchField() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isShowcase = useStudioShowcase();
  const { remember } = useStudioRecentSearches();
  const { areSingleKeyShortcutsOn } =
    useStudioListeningPreferences().preferences;
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholder = isShowcase
    ? t("studio:shell.searchPlaceholder")
    : t("studio:shell.searchPlaceholderLive");
  const isPlaceholderFitting = usePlaceholderFits(inputRef, placeholder);
  return (
    <form
      role="search"
      className={`${styles.search} ${css.field}`}
      onSubmit={(event) => {
        event.preventDefault();
        remember(query);
        void navigate(studioSearchPath(query));
      }}
    >
      <FiSearch aria-hidden />
      <input
        ref={inputRef}
        type="search"
        name="q"
        value={query}
        maxLength={STUDIO_LIMITS.searchQueryMax}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={t("studio:shell.searchLabel")}
        aria-keyshortcuts={studioSearchKeyShortcuts(areSingleKeyShortcutsOn)}
        data-studio-search-input="shell"
        placeholder={
          isPlaceholderFitting
            ? placeholder
            : t("studio:shell.searchPlaceholderShort")
        }
      />
      <kbd
        className={css.hint}
        data-hidden={!areSingleKeyShortcutsOn || undefined}
        aria-hidden="true"
      >
        /
      </kbd>
    </form>
  );
}
