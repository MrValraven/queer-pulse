import { useEffect, useRef, useState } from "react";
import { SearchInput, Select } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { VerificationSort } from "./api/adminVerifications.api";
import styles from "./AdminVerificationsHeader.module.css";

const SORT_OPTIONS: VerificationSort[] = ["recent", "oldest", "level"];

export interface AdminVerificationsHeaderValue {
  query: string;
  sort: VerificationSort;
}

/**
 * The verification queue's controls row: a debounced free-text search (by
 * member name/handle) and a recent/oldest/level sort. The level *filter*
 * lives one level up as the page's `AdminTabs` (mirroring how
 * AdminListingsHeader's status chips live beside its search+sort) — this
 * component only owns the two axes that vary independently of which tab is
 * active. Fully controlled by `value`/`onChange`, except the search field:
 * it keeps its own local state so typing feels instant, and only pushes
 * `query` upward once the moderator pauses for 300ms — same idiom as
 * `AdminListingsHeader`.
 */
export function AdminVerificationsHeader({
  value,
  onChange,
}: {
  value: AdminVerificationsHeaderValue;
  onChange: (next: AdminVerificationsHeaderValue) => void;
}) {
  const { t } = useTranslation();
  const [queryInput, setQueryInput] = useState(value.query);
  const debouncedQueryInput = useDebouncedValue(queryInput, 300);

  // Reads the latest value/onChange from a ref (rather than closing over them
  // directly) so the debounce effect only fires when the debounced text
  // itself settles, never when `sort` changes elsewhere on the page — same
  // pattern as AdminListingsHeader.
  const latestValueRef = useRef(value);
  const latestOnChangeRef = useRef(onChange);
  useEffect(() => {
    latestValueRef.current = value;
    latestOnChangeRef.current = onChange;
  });

  useEffect(() => {
    if (debouncedQueryInput !== latestValueRef.current.query) {
      latestOnChangeRef.current({
        ...latestValueRef.current,
        query: debouncedQueryInput,
      });
    }
  }, [debouncedQueryInput]);

  return (
    <div className={styles.header}>
      <SearchInput
        value={queryInput}
        onChange={setQueryInput}
        placeholder={t("admin:verifications.search.placeholder")}
        ariaLabel={t("admin:verifications.search.ariaLabel")}
        className={styles.search}
      />

      <label className={styles.sort}>
        <span className={styles.sortLabel}>
          {t("admin:verifications.sort.label")}
        </span>
        <Select
          size="sm"
          value={value.sort}
          options={SORT_OPTIONS.map((option) => ({
            value: option,
            label: t(`admin:verifications.sort.${option}`),
          }))}
          onChange={(next) =>
            onChange({
              ...value,
              sort: (next ?? value.sort) as VerificationSort,
            })
          }
        />
      </label>
    </div>
  );
}
