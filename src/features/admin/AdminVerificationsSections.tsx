import { useEffect, useRef, useState, type RefObject } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  EmptyState,
  SearchInput,
  Select,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminTabs } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDebouncedValue } from "../../shared/hooks";
import { VerificationRequestRows } from "./VerificationRequestRows";
import { VerificationBulkActionBar } from "./VerificationBulkActionBar";
import type {
  AdminVerificationRequestDTO,
  VerificationRequestCounts,
  VerificationRequestSort,
  VerificationRequestStatusFilter,
} from "./api/adminVerifications.api";
import headerStyles from "./AdminVerificationsHeader.module.css";
import submissionStyles from "./AdminSubmissionList.module.css";

/** The Review-queue segment's status tabs, in the order Task 9 specifies —
 *  "All" trailing rather than leading, unlike the level console's tabs
 *  (that console has no equivalent "everything is fine" default status). */
const REQUEST_STATUS_TABS: VerificationRequestStatusFilter[] = [
  "pending",
  "in_review",
  "approved",
  "rejected",
  "appealing",
  "all",
];

const REQUEST_SORT_OPTIONS: VerificationRequestSort[] = ["recent", "oldest"];

/** The Review-queue segment's counted status tabs. `totalCount` is summed by
 *  the segment (the "All" tab has no count of its own on the server). */
export function ReviewQueueStatusTabs({
  status,
  counts,
  totalCount,
  onChange,
}: {
  status: VerificationRequestStatusFilter;
  counts: VerificationRequestCounts;
  totalCount: number;
  onChange: (status: VerificationRequestStatusFilter) => void;
}) {
  const { t } = useTranslation();
  return (
    <AdminTabs
      tabs={REQUEST_STATUS_TABS.map((tabStatus) => ({
        id: tabStatus,
        label:
          tabStatus === "all"
            ? t("admin:verifications.requests.tabs.all")
            : t(`admin:verifications.requests.tabs.${tabStatus}`),
        count: tabStatus === "all" ? totalCount : counts[tabStatus],
      }))}
      active={status}
      onChange={(nextStatus) =>
        onChange(nextStatus as VerificationRequestStatusFilter)
      }
    />
  );
}

/**
 * A small search+sort variant for the request queue (Task 9's alternative to
 * reusing `AdminVerificationsHeader` — that component's sort options include
 * "Highest level", which doesn't make sense for a request queue sorted by
 * submission date, not a member's level). Visually mirrors it exactly by
 * reusing its own CSS module rather than forking the styles. Same debounced-
 * search idiom as `AdminVerificationsHeader`: the search field keeps its own
 * local state so typing feels instant, and only pushes `query` upward once
 * the moderator pauses for 300ms; `sort` is otherwise fully controlled.
 */
export function RequestQueueHeader({
  query,
  sort,
  onQueryChange,
  onSortChange,
  searchInputWrapperRef,
}: {
  query: string;
  sort: VerificationRequestSort;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: VerificationRequestSort) => void;
  /** Wraps just the search field (not the whole header) so the segment's `/`
   *  keyboard shortcut can find and focus its `<input>` without also
   *  matching the sort `<Select>`'s own internals. */
  searchInputWrapperRef?: RefObject<HTMLDivElement | null>;
}) {
  const { t } = useTranslation();
  const [queryInput, setQueryInput] = useState(query);
  const debouncedQueryInput = useDebouncedValue(queryInput, 300);

  // Reads the latest `query`/`onQueryChange` from a ref (rather than closing
  // over them directly) so this effect only fires when the debounced text
  // itself settles, never when `query` changes for another reason — same
  // pattern as `AdminVerificationsHeader`.
  const latestQueryRef = useRef(query);
  const latestOnQueryChangeRef = useRef(onQueryChange);
  useEffect(() => {
    latestQueryRef.current = query;
    latestOnQueryChangeRef.current = onQueryChange;
  });

  useEffect(() => {
    if (debouncedQueryInput !== latestQueryRef.current) {
      latestOnQueryChangeRef.current(debouncedQueryInput);
    }
  }, [debouncedQueryInput]);

  return (
    <div className={headerStyles.header}>
      <div ref={searchInputWrapperRef} className={headerStyles.search}>
        <SearchInput
          value={queryInput}
          onChange={setQueryInput}
          placeholder={t("admin:verifications.requests.search.placeholder")}
          ariaLabel={t("admin:verifications.requests.search.ariaLabel")}
        />
      </div>

      <label className={headerStyles.sort}>
        <span className={headerStyles.sortLabel}>
          {t("admin:verifications.sort.label")}
        </span>
        <Select
          size="sm"
          value={sort}
          options={REQUEST_SORT_OPTIONS.map((option) => ({
            value: option,
            label: t(`admin:verifications.requests.sort.${option}`),
          }))}
          onChange={(value) =>
            onSortChange((value ?? sort) as VerificationRequestSort)
          }
        />
      </label>
    </div>
  );
}

/** The Review-queue segment's list body: the four mutually-exclusive states
 *  (skeleton / retryable error / empty / rows) plus the selection action bar
 *  and the load-more control. Selection state itself stays owned by the
 *  segment (`useReviewQueueSelection`) so the keyboard shortcuts and the
 *  reject modal keep reading the same source. */
export function ReviewQueueResults({
  rows,
  isLoading,
  isError,
  onRetry,
  onOpen,
  selectedIds,
  onToggle,
  onToggleAll,
  atSelectionCap,
  focusedRequestId,
  onClearSelection,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  currentUserId,
  isAssignmentBusy,
  onClaim,
  onRelease,
}: {
  rows: AdminVerificationRequestDTO[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpen: (requestId: string) => void;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  atSelectionCap: boolean;
  focusedRequestId: string | null;
  onClearSelection: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  /** OPS-04. The signed-in reviewer, so a row can tell "you have this" from
   *  "a colleague has this". Null while the session is still loading. */
  currentUserId: string | null;
  /** True while any claim/release in this queue is in flight. */
  isAssignmentBusy: boolean;
  onClaim: (requestId: string) => void;
  onRelease: (requestId: string) => void;
}) {
  const { t } = useTranslation();

  if (isLoading) return <RowsSkeleton />;
  if (isError && rows.length === 0) {
    return <VerificationsErrorState onRetry={onRetry} />;
  }
  if (rows.length === 0) {
    return (
      <p className={submissionStyles.emptyLine}>
        {t("admin:verifications.requests.empty")}
      </p>
    );
  }

  return (
    <>
      <VerificationRequestRows
        rows={rows}
        onOpen={onOpen}
        selectedIds={selectedIds}
        onToggle={onToggle}
        onToggleAll={onToggleAll}
        atSelectionCap={atSelectionCap}
        focusedRequestId={focusedRequestId}
        currentUserId={currentUserId}
        isAssignmentBusy={isAssignmentBusy}
        onClaim={onClaim}
        onRelease={onRelease}
      />
      {selectedIds.size > 0 && (
        <VerificationBulkActionBar
          selectedIds={selectedIds}
          onClear={onClearSelection}
        />
      )}
      {hasNextPage && (
        <div className={submissionStyles.loadMore}>
          <Button
            variant="ghost"
            size="md"
            disabled={isFetchingNextPage}
            onClick={onLoadMore}
          >
            {isFetchingNextPage
              ? t("admin:verifications.loadingMore")
              : t("admin:verifications.loadMore")}
          </Button>
        </div>
      )}
    </>
  );
}

/** Branded, retryable error state — mirrors `ListingQueueErrorState` in
 *  `AdminListingsPage`. A failed live fetch must read as an outage a
 *  moderator can recover from, never as a false "no records yet". Demo mode
 *  never errors, so this only ever fires against the real API. */
export function VerificationsErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiAlertTriangle />}
      title={t("common:error.title")}
      description={t("common:error.description")}
      action={{ label: t("common:error.retry"), onClick: onRetry }}
    />
  );
}

export function RowsSkeleton() {
  return (
    <div className={submissionStyles.rows}>
      {[0, 1, 2].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={92}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}
