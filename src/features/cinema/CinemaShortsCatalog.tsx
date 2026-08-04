import { useEffect, useMemo, useRef, useState } from "react";
import { FiFilm, FiSearch, FiX, FiZap } from "react-icons/fi";
import { Button, FadeIn, SectionHead } from "../../shared/components/ui";
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
import { ShortCard } from "./CinemaShortsParts";
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
    shelf.notify(
      t("cinema:shorts.catalog.surpriseToast", { title: pick.titleEm }),
    );
  };

  return (
    <>
      <SectionHead
        className={styles.shortsSectionHead}
        title={
          <Translation
            i18nKey="cinema:shorts.catalog.title"
            components={{ em: <em /> }}
          />
        }
        subtitle={t("cinema:shorts.catalog.sub")}
        linkTo={madeHere}
        linkLabel={t("cinema:shorts.catalog.cta")}
      />

      <div className={styles.browseTop}>
        <label className={styles.search}>
          <FiSearch aria-hidden />
          <input
            type="search"
            placeholder={t("cinema:shorts.catalog.searchPlaceholder")}
            aria-label={t("cinema:shorts.catalog.searchAriaLabel")}
            value={state.query}
            onChange={(e) => patch({ query: e.target.value })}
          />
        </label>
        <div className={styles.selWrap}>
          <label htmlFor="qp-lang">
            {t("cinema:shorts.catalog.languageLabel")}
          </label>
          <select
            id="qp-lang"
            aria-label={t("cinema:shorts.catalog.languageAriaLabel")}
            value={state.lang}
            onChange={(e) => patch({ lang: e.target.value })}
          >
            {langOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.selWrap}>
          <label htmlFor="qp-sort">
            {t("cinema:shorts.catalog.sortLabel")}
          </label>
          <select
            id="qp-sort"
            aria-label={t("cinema:shorts.catalog.sortAriaLabel")}
            value={state.sort}
            onChange={(e) => patch({ sort: e.target.value })}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className={styles.btnSurprise} onClick={surprise}>
          <FiZap aria-hidden />
          {t("cinema:shorts.catalog.surpriseCta")}
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
            <h3>{t("cinema:shorts.catalog.empty.title")}</h3>
            <p>{t("cinema:shorts.catalog.empty.body")}</p>
            <div className={styles.esActions}>
              <Button variant="ghost" onClick={clearAll}>
                {t("cinema:shorts.catalog.empty.clearCta")}
              </Button>
              <Button to={routes.cinemaSubmit}>
                {t("cinema:shorts.catalog.empty.suggestCta")}
              </Button>
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
  const { t } = useTranslation();
  return (
    <div className={styles.filterGroups}>
      <button
        type="button"
        className={`${styles.fChip} ${styles.all} ${!hasFilters ? styles.on : ""}`}
        onClick={onClear}
      >
        {t("cinema:shorts.catalog.allFilmsChip")}
      </button>
      {filterCatOrder.map((cat) => (
        <span key={cat} className={styles.fg}>
          <span className={styles.fgSep} aria-hidden />
          <span className={styles.fgLabel}>
            {t(FILTER_CAT_LABEL_KEYS[cat])}
          </span>
          {shortFilters
            .filter((x) => x.cat === cat)
            .map((filter) => {
              const on = active.includes(filter.key);
              return (
                <button
                  key={filter.key}
                  type="button"
                  aria-pressed={on}
                  className={`${styles.fChip} ${filter.jade ? styles.jade : ""} ${on ? styles.on : ""}`}
                  onClick={() => onToggle(filter.key)}
                >
                  {t(filter.labelKey)}
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
  const { t } = useTranslation();
  const langLabelKey = langOptions.find(
    (option) => option.value === state.lang,
  )?.labelKey;
  return (
    <div className={styles.filterStatus} aria-live="polite">
      <span className={styles.fsCount}>
        <Translation
          i18nKey="cinema:shorts.catalog.count"
          components={{ em: <em /> }}
          values={{ count }}
        />
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
              {(() => {
                const labelKey = filterByKey.get(k)?.labelKey;
                return labelKey ? t(labelKey) : k;
              })()}
              <FiX aria-hidden />
            </button>
          ))}
          {state.lang && langLabelKey && (
            <button
              type="button"
              className={styles.actPill}
              onClick={onRemoveLang}
            >
              {t(langLabelKey)}
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
          {t("cinema:browse.filters.clearAll")}
        </button>
      )}
    </div>
  );
}
