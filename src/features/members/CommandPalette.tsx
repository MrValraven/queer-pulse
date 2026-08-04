import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCornerDownLeft, FiX } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks/useScrollLock";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath, routes } from "../../app/routeMap";
import { type SearchItem } from "./search.data";
import { CommandPaletteResults } from "./CommandPaletteResults";
import { useSearchData } from "./api/useSearchData";
import { pushRecent } from "./searchRecents";
import styles from "./CommandPalette.module.css";

const MAX_RESULTS = 8;

/** Custom event any control can dispatch to open the palette (e.g. the navbar search button). */
export const OPEN_SEARCH_EVENT = "qp:open-search";

function matches(item: SearchItem, q: string) {
  return `${item.name} ${item.sub} ${item.kw}`.toLowerCase().includes(q);
}

/**
 * Global ⌘K / Ctrl+K command palette. Always mounted (inside the router) so the
 * shortcut works on every page; also opens on the OPEN_SEARCH_EVENT window event.
 * Enter on a result navigates to it; Enter with no active row goes to the full
 * /search page with the query preserved in the URL.
 */
export function CommandPalette() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useScrollLock(open);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const openPalette = useCallback(() => setOpen(true), []);

  // Global open triggers: ⌘K / Ctrl+K and the custom event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, openPalette);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, openPalette);
    };
  }, [openPalette]);

  // Focus the input when it opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const { data: searchData, recents, signInRequired } = useSearchData(query);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return searchData.slice(0, MAX_RESULTS);
    return searchData.filter((d) => matches(d, q)).slice(0, MAX_RESULTS);
  }, [q, searchData]);

  // Clamp during render so a shrinking result list can't leave a stale selection.
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));

  const goToAll = useCallback(() => {
    // Search requires a session in live mode — a logged-out user only sees
    // the sign-in notice, so there's nothing to open on the full /search page.
    if (signInRequired) return;
    const trimmed = query.trim();
    pushRecent(trimmed);
    void navigate(
      trimmed
        ? `${routes.search}?q=${encodeURIComponent(trimmed)}`
        : routes.search,
    );
    close();
  }, [signInRequired, query, navigate, close]);

  const goToItem = useCallback(
    (item: SearchItem) => {
      pushRecent(query.trim());
      void navigate(linkToPath(item.href));
      close();
    },
    [query, navigate, close],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[activeIndex];
      if (hit) goToItem(hit);
      else goToAll();
    }
  };

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("members:commandPalette.ariaLabel")}
      >
        <div className={styles.inputRow}>
          <FiSearch aria-hidden className={styles.inputIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            role="combobox"
            aria-label={t("members:commandPalette.placeholder")}
            aria-expanded
            aria-controls="qp-cmd-results"
            // Voice the active row to screen readers as Arrow keys move it. The
            // ids match the `qp-cmd-option-${index}` scheme on each listbox row;
            // only point at one while the results list is actually rendered.
            aria-activedescendant={
              !signInRequired && results.length > 0
                ? `qp-cmd-option-${activeIndex}`
                : undefined
            }
            placeholder={t("members:commandPalette.placeholder")}
            value={query}
            readOnly={signInRequired}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className={styles.kbd}>{t("members:commandPalette.escKey")}</kbd>
          {/* Visible tap target to dismiss one-handed with the keyboard up —
              scrim-tap/Escape are the only other exits and neither is reachable
              by thumb on a phone. */}
          <button
            type="button"
            className={styles.close}
            onClick={close}
            aria-label={t("shared:modal.close")}
          >
            <FiX aria-hidden />
          </button>
        </div>

        {signInRequired ? (
          <div className={styles.comingSoon}>
            <span className={styles.comingSoonBadge}>
              {t("members:search.signInRequired.badge")}
            </span>
            <p className={styles.comingSoonText}>
              {t("members:commandPalette.signInBody")}
            </p>
          </div>
        ) : (
          <CommandPaletteResults
            q={q}
            recents={recents}
            setQuery={setQuery}
            results={results}
            activeIndex={activeIndex}
            setActive={setActive}
            goToItem={goToItem}
          />
        )}

        {!signInRequired && (
          <button type="button" className={styles.footer} onClick={goToAll}>
            <FiCornerDownLeft aria-hidden />
            {query.trim() ? (
              <Translation
                i18nKey="members:commandPalette.seeAllResults"
                components={{ b: <b /> }}
                values={{ query: query.trim() }}
              />
            ) : (
              t("members:commandPalette.openFullSearch")
            )}
          </button>
        )}
      </div>
    </div>
  );
}
