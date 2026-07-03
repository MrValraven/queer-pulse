import { FiX } from "react-icons/fi";
import { DRAFT_SORTS, type DraftSortKey } from "./drafts.data";
import styles from "./DraftsPage.module.css";

/** Search field + sort select above the drafts list. */
export function DraftsControls({
  query,
  onQuery,
  sort,
  onSort,
}: {
  query: string;
  onQuery: (value: string) => void;
  sort: DraftSortKey;
  onSort: (value: DraftSortKey) => void;
}) {
  return (
    <div className={styles.controls}>
      <div className={styles.search}>
        <svg
          className={styles.searchIcon}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth={1.5} />
          <path
            d="M11 11l3 3"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search your drafts…"
          aria-label="Search drafts"
        />
        {query && (
          <button
            type="button"
            className={styles.searchClear}
            aria-label="Clear search"
            onClick={() => onQuery("")}
          >
            <FiX aria-hidden />
          </button>
        )}
      </div>

      <div className={styles.sort}>
        <label htmlFor="draftSort">Sort</label>
        <select
          id="draftSort"
          value={sort}
          onChange={(e) => onSort(e.target.value as DraftSortKey)}
          aria-label="Sort drafts"
        >
          {DRAFT_SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
