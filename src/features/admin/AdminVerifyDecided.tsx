import { useMemo, useState } from "react";
import {
  FilterChips,
  SearchInput,
  SkeletonLine,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useJoinRequests, type JoinRequestView } from "./api/useJoinRequests";
import {
  DECIDED_REQUEST_FILTERS,
  countDecidedRequestFilters,
  isDecidedRequestFilter,
  matchesDecidedRequestFilter,
  type DecidedRequestFilter,
} from "./decidedRequestFilter";
import { JoinRequestDecidedRow } from "./JoinRequestDecidedRow";
import rowStyles from "./AdminSubmissionList.module.css";
import styles from "./AdminVerifyDecided.module.css";

/**
 * How many decided requests each status pulls in one read. The backend caps the
 * list at 100 per call and offers no text search, so this is deliberately a
 * PAGE of recent history. The search below says so out loud, so nobody reads
 * an empty result as proof that it looked everywhere.
 */
const DECIDED_PAGE_SIZE = 100;

/** Newest decision first, falling back to the application date for a legacy
 *  row that never recorded when it was reviewed. */
function byMostRecentlyDecided(
  first: JoinRequestView,
  second: JoinRequestView,
): number {
  const at = (row: JoinRequestView) =>
    new Date(row.reviewedAt ?? row.createdAt).getTime() || 0;
  return at(second) - at(first);
}

/**
 * The bucket chips over the decided list. Each carries how many loaded rows it
 * holds, counted before the text search, so the numbers stay put while a
 * reviewer types. The visible count is hidden from assistive tech and a full
 * phrase ("Claimed, 3 requests") is read instead, because a bare "Claimed 3"
 * sounds like part of the label.
 */
function DecidedFilterChips({
  value,
  counts,
  onChange,
}: {
  value: DecidedRequestFilter;
  counts: Record<DecidedRequestFilter, number>;
  onChange: (filter: DecidedRequestFilter) => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const options = DECIDED_REQUEST_FILTERS.map((filter) => {
    const label = t(`admin:members.verify.decided.filter.${filter}`);
    const count = counts[filter];
    return {
      value: filter,
      label: (
        <>
          <span aria-hidden>
            {label}{" "}
            <span className={styles.filterCount}>
              <RollingNumber
                value={format.number(count)}
                numericValue={count}
              />
            </span>
          </span>
          <span className="visuallyHidden">
            {t("admin:members.verify.decided.filter.optionSr", {
              label,
              count,
            })}
          </span>
        </>
      ),
    };
  });
  return (
    <FilterChips
      className={styles.filters}
      label={t("admin:members.verify.decided.filter.groupLabel")}
      options={options}
      value={value}
      onChange={(chosenValue) => {
        if (isDecidedRequestFilter(chosenValue)) onChange(chosenValue);
      }}
    />
  );
}

/**
 * The history half of the join-request queue: every request already approved or
 * declined, read from the server so it survives a refresh.
 *
 * It exists because approval used to leave its invite link in a card held only
 * in local React state. Reload the page, navigate away, or approve in bulk, and
 * the link was gone; and with no email in the product, that link was the only
 * thing the applicant was ever going to get. This tab is also the answer to
 * "what happened to Maria's request?", which is why it can be searched.
 */
export function AdminVerifyDecided({
  displayedDecided,
}: {
  /** Merges this session's own decisions with the server's, preferring the
   *  server copy so a just-approved row never renders twice. */
  displayedDecided: (serverRows: JoinRequestView[]) => JoinRequestView[];
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DecidedRequestFilter>("all");
  const approvedQuery = useJoinRequests("approved", {
    limit: DECIDED_PAGE_SIZE,
    sort: "newest",
  });
  const declinedQuery = useJoinRequests("declined", {
    limit: DECIDED_PAGE_SIZE,
    sort: "newest",
  });

  const isLoading = approvedQuery.isLoading || declinedQuery.isLoading;
  const rows = useMemo(
    () =>
      displayedDecided([
        ...(approvedQuery.data ?? []),
        ...(declinedQuery.data ?? []),
      ]).sort(byMostRecentlyDecided),
    [approvedQuery.data, declinedQuery.data, displayedDecided],
  );

  const filterCounts = useMemo(() => countDecidedRequestFilters(rows), [rows]);
  const filteredRows = rows.filter((row) =>
    matchesDecidedRequestFilter(row, filter),
  );
  const trimmedQuery = query.trim().toLowerCase();
  const matches = trimmedQuery
    ? filteredRows.filter(
        (row) =>
          row.name.toLowerCase().includes(trimmedQuery) ||
          row.email.toLowerCase().includes(trimmedQuery),
      )
    : filteredRows;
  // The bucket alone can empty the list; only when it still holds rows is the
  // text search the reason nothing shows.
  const isFilterEmpty = rows.length > 0 && filteredRows.length === 0;
  const isSearchEmpty = filteredRows.length > 0 && matches.length === 0;

  if (isLoading) {
    return (
      <div className={rowStyles.rows}>
        {[0, 1, 2].map((index) => (
          <div className={rowStyles.row} key={index}>
            <SkeletonLine width="45%" height={18} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className={styles.intro}>{t("admin:members.verify.decided.intro")}</p>
      {rows.length > 0 && (
        <div className={styles.searchRow}>
          <SearchInput
            value={query}
            onChange={setQuery}
            ariaLabel={t("admin:members.verify.decided.searchLabel")}
            placeholder={t("admin:members.verify.decided.searchPlaceholder")}
            className={styles.search}
          />
          <p className={styles.scopeNote}>
            {t("admin:members.verify.decided.searchScopeNote", {
              count: rows.length,
            })}
          </p>
        </div>
      )}
      {rows.length > 0 && (
        <DecidedFilterChips
          value={filter}
          counts={filterCounts}
          onChange={setFilter}
        />
      )}

      {rows.length === 0 && (
        <p className={rowStyles.emptyLine}>
          {t("admin:members.verify.decided.empty")}
        </p>
      )}
      {isFilterEmpty && (
        <p className={rowStyles.emptyLine}>
          {t("admin:members.verify.decided.filterEmpty", {
            filter: t(`admin:members.verify.decided.filter.${filter}`),
          })}
        </p>
      )}
      {isSearchEmpty && (
        <p className={rowStyles.emptyLine}>
          {t("admin:members.verify.decided.noMatches", { query: query.trim() })}
        </p>
      )}

      <div className={rowStyles.rows}>
        {matches.map((row) => (
          <JoinRequestDecidedRow key={row.id} item={row} />
        ))}
      </div>
    </div>
  );
}
