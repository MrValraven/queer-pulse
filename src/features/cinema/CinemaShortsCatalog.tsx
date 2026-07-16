import { useEffect, useMemo, useRef, useState } from "react";
import { FiFilm, FiSearch, FiX, FiZap } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  FILTER_CAT_LABEL_KEYS,
  filterAndSortShorts,
  filterByKey,
  filterCatOrder,
  langOptions,
  shortFilters,
  sortOptions,
  type CatalogState,
  type ShortsShelf,
} from "./cinemaShorts.data";
import { SecDiv, ShortCard } from "./CinemaShortsParts";
import styles from "./CinemaShortsPage.module.css";

const madeHere = `${routes.cinemaBrowse}?f=made-here`;

/** Full "Made Here" catalogue with live search, language, sort and filters. */
export function CinemaShortsCatalog({ shelf }: { shelf: ShortsShelf }) {
  const { t } = useTranslation();
  const [state, setState] = useState<CatalogState>({
    active: [],
    lang: "",
    query: "",
    sort: sortOptions[0]!.value,
  });
  const [flashId, setFlashId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const current = useMemo(
    () => filterAndSortShorts(state, shelf.saved),
    [state, shelf.saved],
  );

  useEffect(() => {
    if (!flashId) return;
    const t = setTimeout(() => setFlashId(null), 1500);
    return () => clearTimeout(t);
  }, [flashId]);

  const patch = (p: Partial<CatalogState>) => setState((s) => ({ ...s, ...p }));
  const toggle = (key: string) =>
    patch({
      active: state.active.includes(key)
        ? state.active.filter((k) => k !== key)
        : [...state.active, key],
    });
  const clearAll = () =>
    setState({ active: [], lang: "", query: "", sort: state.sort });

  const hasFilters = state.active.length > 0 || !!state.lang || !!state.query;

  const surprise = () => {
    if (current.length === 0) return;
    const pick = current[Math.floor(Math.random() * current.length)]!;
    setFlashId(pick.id);
    const el = gridRef.current?.querySelector(`[data-film="${pick.id}"]`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    shelf.notify(`Try this one → ${pick.titleEm}`);
  };

  return (
    <>
      <SecDiv
        title={
          <>
            Browse the <em>full catalogue</em>
          </>
        }
        sub="Every community film — filter, sort, and search your way in"
        actionTo={madeHere}
        actionLabel="Open in Browse →"
      />

      <div className={styles.browseTop}>
        <label className={styles.search}>
          <FiSearch aria-hidden />
          <input
            type="search"
            placeholder="Search films, makers, or themes…"
            aria-label="Search films"
            value={state.query}
            onChange={(e) => patch({ query: e.target.value })}
          />
        </label>
        <div className={styles.selWrap}>
          <label htmlFor="qp-lang">Language</label>
          <select
            id="qp-lang"
            aria-label="Filter by language"
            value={state.lang}
            onChange={(e) => patch({ lang: e.target.value })}
          >
            {langOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.selWrap}>
          <label htmlFor="qp-sort">Sort</label>
          <select
            id="qp-sort"
            aria-label="Sort films"
            value={state.sort}
            onChange={(e) => patch({ sort: e.target.value })}
          >
            {sortOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <button type="button" className={styles.btnSurprise} onClick={surprise}>
          <FiZap aria-hidden />
          Surprise me
        </button>
      </div>

      <div className={styles.filterWrap}>
        <CatalogFilters
          active={state.active}
          hasFilters={hasFilters}
          onToggle={toggle}
          onClear={clearAll}
        />
        <CatalogStatus
          state={state}
          count={current.length}
          hasFilters={hasFilters}
          onRemove={toggle}
          onRemoveLang={() => patch({ lang: "" })}
          onRemoveQuery={() => patch({ query: "" })}
          onClear={clearAll}
        />
      </div>

      <div className={styles.shortsGrid} ref={gridRef}>
        {current.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.esMark}>
              <FiFilm aria-hidden />
            </span>
            <h3>Nothing matches — yet</h3>
            <p>
              No films fit that combination. Loosen a filter, or tell us what
              you wish existed — we commission from member requests.
            </p>
            <div className={styles.esActions}>
              <Button variant="ghost" onClick={clearAll}>
                Clear filters
              </Button>
              <Button to={routes.cinemaSubmit}>Suggest a film</Button>
            </div>
          </div>
        ) : (
          current.map((f, i) => (
            <FadeIn key={f.id} delay={Math.min(i, 7) * 40}>
              <ShortCard film={f} shelf={shelf} flash={flashId === f.id} />
            </FadeIn>
          ))
        )}
      </div>
    </>
  );
}

function CatalogFilters({
  active,
  hasFilters,
  onToggle,
  onClear,
}: {
  active: string[];
  hasFilters: boolean;
  onToggle: (key: string) => void;
  onClear: () => void;
}) {
  return (
    <div className={styles.filterGroups}>
      <button
        type="button"
        className={`${styles.fChip} ${styles.all} ${!hasFilters ? styles.on : ""}`}
        onClick={onClear}
      >
        All films
      </button>
      {filterCatOrder.map((cat) => (
        <span key={cat} className={styles.fg}>
          <span className={styles.fgSep} aria-hidden />
          <span className={styles.fgLabel}>{cat}</span>
          {shortFilters
            .filter((x) => x.cat === cat)
            .map((x) => {
              const on = active.includes(x.key);
              return (
                <button
                  key={x.key}
                  type="button"
                  aria-pressed={on}
                  className={`${styles.fChip} ${x.jade ? styles.jade : ""} ${on ? styles.on : ""}`}
                  onClick={() => onToggle(x.key)}
                >
                  {x.label}
                </button>
              );
            })}
        </span>
      ))}
    </div>
  );
}

function CatalogStatus({
  state,
  count,
  hasFilters,
  onRemove,
  onRemoveLang,
  onRemoveQuery,
  onClear,
}: {
  state: CatalogState;
  count: number;
  hasFilters: boolean;
  onRemove: (key: string) => void;
  onRemoveLang: () => void;
  onRemoveQuery: () => void;
  onClear: () => void;
}) {
  const langLabel = langOptions.find((o) => o.value === state.lang)?.label;
  return (
    <div className={styles.filterStatus} aria-live="polite">
      <span className={styles.fsCount}>
        <em>{count}</em> {count === 1 ? "film" : "films"}{" "}
        <span className={styles.free}>· all free to watch</span>
      </span>
      {(state.active.length > 0 || state.lang || state.query) && (
        <div className={styles.pillRow}>
          {state.active.map((k) => (
            <button
              key={k}
              type="button"
              className={styles.actPill}
              onClick={() => onRemove(k)}
            >
              {filterByKey.get(k)?.label}
              <FiX aria-hidden />
            </button>
          ))}
          {state.lang && langLabel && (
            <button
              type="button"
              className={styles.actPill}
              onClick={onRemoveLang}
            >
              {langLabel}
              <FiX aria-hidden />
            </button>
          )}
          {state.query && (
            <button
              type="button"
              className={styles.actPill}
              onClick={onRemoveQuery}
            >
              “{state.query}”
              <FiX aria-hidden />
            </button>
          )}
        </div>
      )}
      {hasFilters && (
        <button type="button" className={styles.clearAll} onClick={onClear}>
          Clear all
        </button>
      )}
    </div>
  );
}
