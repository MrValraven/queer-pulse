import { useEffect, useRef, useState } from "react";
import { SearchInput } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ADMIN_LISTINGS_STATUS_FILTERS,
  type AdminListingsStatusFilter,
  type ListingQueueCounts,
  type ListingQueueSort,
} from "./api/adminListings.api";
import styles from "./AdminListingsHeader.module.css";

const SORT_OPTIONS: ListingQueueSort[] = ["newest", "oldest", "name"];

export interface AdminListingsHeaderValue {
  q: string;
  sort: ListingQueueSort;
  status: AdminListingsStatusFilter;
}

/**
 * The queue's controls row: a debounced free-text search, a newest/oldest/name
 * sort, and the status filter rendered as counted chips (deliberately
 * separated pill buttons — visually distinct from the `SegmentedControl` the
 * page uses for the Queue/Edit-suggestions view switch, per the "tab
 * differentiation" fix). Fully controlled by `value`/`onChange`; the search
 * field is the one exception — it keeps its own local state so typing feels
 * instant, and only pushes `q` upward once the moderator pauses for 300ms.
 */
export function AdminListingsHeader({
  value,
  counts,
  onChange,
}: {
  value: AdminListingsHeaderValue;
  counts: ListingQueueCounts;
  onChange: (next: AdminListingsHeaderValue) => void;
}) {
  const { t } = useTranslation();
  const [queryInput, setQueryInput] = useState(value.q);
  const debouncedQueryInput = useDebouncedValue(queryInput, 300);

  // The debounce effect must fire only when the debounced text itself
  // settles — never when `sort`/`status` change elsewhere on the page. Reading
  // the latest `value`/`onChange` from a ref (rather than closing over them
  // directly) keeps them out of the effect's dependency array without risking
  // a stale merge that would clobber whichever of those the moderator just
  // picked. The refs are updated in their own effect (after render, per
  // `react-hooks/refs`) rather than mutated inline during render.
  const latestValueRef = useRef(value);
  const latestOnChangeRef = useRef(onChange);
  useEffect(() => {
    latestValueRef.current = value;
    latestOnChangeRef.current = onChange;
  });

  useEffect(() => {
    if (debouncedQueryInput !== latestValueRef.current.q) {
      latestOnChangeRef.current({
        ...latestValueRef.current,
        q: debouncedQueryInput,
      });
    }
  }, [debouncedQueryInput]);

  return (
    <div className={styles.header}>
      <div className={styles.controlsRow}>
        <SearchInput
          value={queryInput}
          onChange={setQueryInput}
          placeholder={t("admin:adminListings.search.placeholder")}
          ariaLabel={t("admin:adminListings.search.ariaLabel")}
          className={styles.search}
        />

        <label className={styles.sort}>
          <span className={styles.sortLabel}>
            {t("admin:adminListings.sort.label")}
          </span>
          <select
            className={styles.sortSelect}
            value={value.sort}
            onChange={(event) =>
              onChange({
                ...value,
                sort: event.target.value as ListingQueueSort,
              })
            }
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`admin:adminListings.sort.${option}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className={styles.statusChips}
        role="group"
        aria-label={t("admin:adminListings.filter.ariaLabel")}
      >
        {ADMIN_LISTINGS_STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={value.status === status}
            className={[
              styles.statusChip,
              value.status === status && styles.statusChipOn,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange({ ...value, status })}
          >
            {t("admin:adminListings.filter.countedLabel", {
              label: t(`admin:adminListings.filter.${status}`),
              count: counts[status],
            })}
          </button>
        ))}
      </div>
    </div>
  );
}
