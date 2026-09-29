import { useEffect, useRef, useState } from "react";
import { SearchInput, Select } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ADMIN_LISTINGS_STATUS_FILTERS,
  type AdminListingsStatusFilter,
  type ListingQueueCounts,
  type ListingQueueSort,
} from "./api/adminListings.api";
import { useHasHiddenEndContent } from "./useHasHiddenEndContent";
import styles from "./AdminListingsHeader.module.css";

const SORT_OPTIONS: ListingQueueSort[] = ["newest", "oldest", "name"];

export interface AdminListingsHeaderValue {
  q: string;
  sort: ListingQueueSort;
  status: AdminListingsStatusFilter;
}

/**
 * The queue panel's toolbar: underlined status tabs with count badges on the
 * left, a debounced free-text search and a newest/oldest/name sort on the
 * right. Below 760px of queue width the search and sort take the first line
 * and the tabs scroll sideways on a second line, still underlined on the
 * toolbar's bottom hairline. Below 520px the search gets the first line to
 * itself and the sort leads the tab line, fixed while the tabs scroll beside
 * it. Fully controlled by `value`/`onChange`, with one exception: the search
 * field keeps its own local state so typing feels instant, and only pushes
 * `q` upward once the moderator pauses for 300ms.
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
  const format = useFormat();
  const [queryInput, setQueryInput] = useState(value.q);
  const debouncedQueryInput = useDebouncedValue(queryInput, 300);

  // The debounce effect fires only when the debounced text itself settles.
  // Changes to `sort`/`status` elsewhere on the page leave it alone. Reading
  // the latest `value`/`onChange` from refs keeps them out of the effect's
  // dependency array and still merges into the freshest value, so the search
  // push keeps whichever sort or status the moderator just picked. The refs
  // are updated in their own effect (after render, per `react-hooks/refs`).
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

  // The tab strip fades at its end edge while tabs hide past it.
  const tabStripRef = useRef<HTMLDivElement>(null);
  const hasHiddenTabsAtEnd = useHasHiddenEndContent(tabStripRef);

  // DOM order is search, sort, then the tabs, matching both narrow layouts
  // top to bottom and left to right. CSS `order` puts the tabs left and the
  // controls right when everything fits on one line.
  return (
    <div className={styles.header}>
      <div className={styles.controls}>
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
          <Select
            size="sm"
            className={styles.sortSelect}
            value={value.sort}
            options={SORT_OPTIONS.map((option) => ({
              value: option,
              label: t(`admin:adminListings.sort.${option}`),
            }))}
            onChange={(next) =>
              onChange({
                ...value,
                sort: (next ?? value.sort) as ListingQueueSort,
              })
            }
          />
        </label>
      </div>

      <div
        ref={tabStripRef}
        className={styles.tabs}
        data-fade-end={hasHiddenTabsAtEnd ? "" : undefined}
        role="group"
        aria-label={t("admin:adminListings.filter.ariaLabel")}
      >
        {ADMIN_LISTINGS_STATUS_FILTERS.map((status) => {
          const isActive = value.status === status;
          const count = counts[status];
          return (
            <button
              key={status}
              type="button"
              aria-pressed={isActive}
              className={[styles.tab, isActive && styles.tabActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChange({ ...value, status })}
            >
              <span className={styles.tabLabel}>
                {t(`admin:adminListings.filter.${status}`)}
              </span>
              <span
                className={[styles.count, count === 0 && styles.countZero]
                  .filter(Boolean)
                  .join(" ")}
              >
                {format.number(count)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
