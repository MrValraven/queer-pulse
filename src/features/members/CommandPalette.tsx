import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCornerDownLeft } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks/useScrollLock";
import { Avatar } from "../../shared/components/ui";
import { memberAvatar } from "./data/members";
import { linkToPath, routes } from "../../app/routeMap";
import { TYPE_ICON, TYPE_LABEL, type SearchItem } from "./search.data";
import { useSearchData } from "./api/useSearchData";
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

  const { data: searchData, recents, comingSoon } = useSearchData();

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return searchData.slice(0, MAX_RESULTS);
    return searchData.filter((d) => matches(d, q)).slice(0, MAX_RESULTS);
  }, [q, searchData]);

  // Clamp during render so a shrinking result list can't leave a stale selection.
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));

  const goToAll = useCallback(() => {
    const trimmed = query.trim();
    navigate(
      trimmed
        ? `${routes.search}?q=${encodeURIComponent(trimmed)}`
        : routes.search,
    );
    close();
  }, [query, navigate, close]);

  const goToItem = useCallback(
    (item: SearchItem) => {
      navigate(linkToPath(item.href));
      close();
    },
    [navigate, close],
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
    <div className={styles.overlay} role="presentation" onClick={close}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Search QueerPulse"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.inputRow}>
          <FiSearch aria-hidden className={styles.inputIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls="qp-cmd-results"
            placeholder="Search members, gatherings, communities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className={styles.kbd}>esc</kbd>
        </div>

        {comingSoon ? (
          <div className={styles.comingSoon}>
            <span className={styles.comingSoonBadge}>Coming soon</span>
            <p className={styles.comingSoonText}>
              Live search is being wired to the community. For now it's resting
              — turn on <em>Populate platform</em> to explore the demo.
            </p>
          </div>
        ) : (
          <>
            {!q && (
              <div className={styles.recents}>
                {recents.slice(0, 5).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={styles.recentChip}
                    onClick={() => setQuery(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            <ul className={styles.results} id="qp-cmd-results" role="listbox">
              {results.length === 0 && (
                <li className={styles.noResults}>
                  No matches — try another word.
                </li>
              )}
              {results.map((item, i) => {
                const Icon = TYPE_ICON[item.t];
                const avatar = item.slug ? memberAvatar(item.slug) : undefined;
                return (
                  <li
                    key={`${item.t}-${item.name}`}
                    role="option"
                    aria-selected={i === activeIndex}
                  >
                    <button
                      type="button"
                      className={[
                        styles.row,
                        i === activeIndex && styles.rowActive,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => goToItem(item)}
                    >
                      {avatar ? (
                        <Avatar
                          initials={avatar.initials}
                          tint={avatar.tint}
                          src={avatar.photo}
                          alt={item.name}
                          size={34}
                        />
                      ) : (
                        <span className={styles.rowIcon} aria-hidden>
                          <Icon />
                        </span>
                      )}
                      <span className={styles.rowBody}>
                        <span className={styles.rowName}>{item.name}</span>
                        <span className={styles.rowSub}>{item.sub}</span>
                      </span>
                      <span className={styles.rowType}>
                        {TYPE_LABEL[item.t]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <button type="button" className={styles.footer} onClick={goToAll}>
          <FiCornerDownLeft aria-hidden />
          {query.trim() ? (
            <>
              See all results for “<b>{query.trim()}</b>”
            </>
          ) : (
            "Open full search"
          )}
        </button>
      </div>
    </div>
  );
}
