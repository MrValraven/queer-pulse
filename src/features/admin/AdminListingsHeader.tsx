import { useEffect, useRef, useState } from "react";
import { FilterChips, SearchInput, Select } from "../../shared/components/ui";
import { AdminToolbar, adminToolbarClasses } from "./ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
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
 * The queue's filter bar (`AdminToolbar`): a debounced free-text search, the
 * status chips with their counts, and a newest/oldest/name sort at the end.
 * The bar wraps on narrow screens. Fully controlled by `value`/`onChange`,
 * with one exception: the search field keeps its own local state so typing
 * feels instant, and only pushes `q` upward once the moderator pauses for
 * 300ms.
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

  const statusOptions = ADMIN_LISTINGS_STATUS_FILTERS.map((status) => {
    const label = t(`admin:adminListings.filter.${status}`);
    const count = counts[status];
    return {
      value: status,
      label,
      count,
      ariaLabel: `${label}, ${format.number(count)}`,
      // A status with nothing in it stays pickable: it opens the empty-tab
      // message that names the status.
      isUnavailable: false,
    };
  });

  return (
    <AdminToolbar
      label={t("admin:adminListings.toolbar.ariaLabel")}
      end={
        <label className={styles.sort}>
          <span className={styles.sortLabel}>
            {t("admin:adminListings.sort.label")}
          </span>
          <Select
            size="sm"
            className={adminToolbarClasses.select}
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
      }
    >
      <SearchInput
        value={queryInput}
        onChange={setQueryInput}
        placeholder={t("admin:adminListings.search.placeholder")}
        ariaLabel={t("admin:adminListings.search.ariaLabel")}
        className={adminToolbarClasses.search}
      />
      <FilterChips
        className={adminToolbarClasses.chips}
        label={t("admin:adminListings.filter.ariaLabel")}
        options={statusOptions}
        value={value.status}
        onChange={(status) =>
          onChange({ ...value, status: status as AdminListingsStatusFilter })
        }
      />
    </AdminToolbar>
  );
}
