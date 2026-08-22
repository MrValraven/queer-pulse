import { useRef, useState } from "react";
import { Button, FadeIn, SegmentedControl } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { routes } from "../../app/routeMap";
import { AdminVerificationRows } from "./AdminVerificationRows";
import { VerificationDetailDrawer } from "./VerificationDetailDrawer";
import { VerificationRequestDrawer } from "./VerificationRequestDrawer";
import { VerificationBulkRejectModal } from "./VerificationBulkRejectModal";
import {
  RequestQueueHeader,
  ReviewQueueResults,
  ReviewQueueStatusTabs,
  RowsSkeleton,
  VerificationsErrorState,
} from "./AdminVerificationsSections";
import { useReviewQueueKeyboardShortcuts } from "./useReviewQueueKeyboardShortcuts";
import { useReviewQueueNextInQueue } from "./useReviewQueueNextInQueue";
import { useReviewQueueSelection } from "./useReviewQueueSelection";
import {
  AdminVerificationsHeader,
  type AdminVerificationsHeaderValue,
} from "./AdminVerificationsHeader";
import {
  useAdminVerifications,
  useBulkDecideVerificationRequests,
  useVerificationRequests,
} from "./api/useAdminVerifications";
import {
  VERIFICATION_LEVELS,
  type VerificationLevelFilter,
} from "./api/adminVerifications.api";
import type {
  VerificationRequestSort,
  VerificationRequestStatusFilter,
} from "./api/adminVerifications.api";
import submissionStyles from "./AdminSubmissionList.module.css";
import styles from "./AdminVerificationsPage.module.css";

const LEVEL_TABS: VerificationLevelFilter[] = ["all", ...VERIFICATION_LEVELS];

type PageView = "reviewQueue" | "directOverride";
const VIEWS: PageView[] = ["reviewQueue", "directOverride"];

/**
 * Admin verification console (`/admin/verifications`). Two independent
 * segments (Task 9): **Review queue** (default) — the manual member-request
 * pipeline (`verification_requests`) a moderator triages: status tabs with
 * counts, search+sort, a row list, and a decision drawer (approve /
 * reject-with-reason / mark in-review). **Direct override** — the Phase 1
 * level console, moved here unchanged: a counted, searchable, sortable queue
 * of every member's current level, with a level-override drawer as a
 * moderator escape-hatch outside the request flow. The two segments' state
 * (filters, search, sort, open drawer) is kept fully independent — switching
 * segments never resets or bleeds into the other.
 */
export function AdminVerificationsPage() {
  const { t } = useTranslation();
  const [view, setView] = useState<PageView>("reviewQueue");

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:verifications.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:verifications.eyebrow")}
          title={
            <Translation
              i18nKey="admin:verifications.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:verifications.sub")}
        />
      </FadeIn>

      <FadeIn delay={50}>
        <SegmentedControl
          label={t("admin:verifications.segment.ariaLabel")}
          options={VIEWS.map((viewOption) => ({
            value: viewOption,
            label: t(`admin:verifications.segment.${viewOption}`),
          }))}
          value={view}
          onChange={(nextView) => setView(nextView as PageView)}
        />
      </FadeIn>

      {view === "reviewQueue" ? (
        <ReviewQueueSegment />
      ) : (
        <DirectOverrideSegment />
      )}
    </AdminShell>
  );
}

/** The Review-queue segment (Task 9): the member-request pipeline. Mirrors
 *  `DirectOverrideSegment`'s shape one-for-one (tabs+counts → header →
 *  rows/skeleton/error/empty → drawer) but reads `useVerificationRequests`
 *  and opens `VerificationRequestDrawer` by request id rather than user id.
 *
 * Task 4 layers reviewer-speed features on top, all scoped to this one
 * segment (it unmounts whenever the page's own segmented control switches to
 * "Direct override", which is what keeps the keyboard listener below from
 * ever firing over there):
 * - row selection (`selectedIds`) + `VerificationBulkActionBar`, capped at
 *   `VERIFICATION_BULK_ACTION_CAP`;
 * - a J/K/A/R/`/` keyboard flow, inert while the drawer is open, the reject
 *   modal is open, or focus is inside a text field — see
 *   `useReviewQueueKeyboardShortcuts`;
 * - next-in-queue: `handleRequestDecided` (passed to the drawer as
 *   `onDecided`) opens the row that followed the just-decided one in the
 *   queue order frozen when the drawer was opened. See
 *   `useReviewQueueNextInQueue`.
 */
function ReviewQueueSegment() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [status, setStatus] = useState<VerificationRequestStatusFilter>(
    "all",
  );
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<VerificationRequestSort>("recent");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const {
    rows,
    counts,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useVerificationRequests({ status, query, sort });
  const { bulkDecide, pending: bulkPending } =
    useBulkDecideVerificationRequests();
  const {
    selectedIds,
    setSelectedIds,
    focusedRequestId,
    setFocusedRequestId,
    rejectModalIds,
    setRejectModalIds,
    atSelectionCap,
    resetSelectionAndFocus,
    toggleSelected,
    toggleSelectAll,
  } = useReviewQueueSelection(rows);

  const totalCount = Object.values(counts).reduce(
    (sum, statusCount) => sum + statusCount,
    0,
  );

  // Each filter setter also clears the selection/focus/reject-modal state —
  // called from the handler itself, same as `AdminListingsPage`'s
  // `handleHeaderChange`, rather than from an effect keyed on the filters.
  function handleStatusChange(nextStatus: VerificationRequestStatusFilter) {
    setStatus(nextStatus);
    resetSelectionAndFocus();
  }

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);
    resetSelectionAndFocus();
  }

  function handleSortChange(nextSort: VerificationRequestSort) {
    setSort(nextSort);
    resetSelectionAndFocus();
  }

  const handleRequestDecided = useReviewQueueNextInQueue({
    rows,
    selectedRequestId,
    onSelectRequest: setSelectedRequestId,
  });

  useReviewQueueKeyboardShortcuts({
    rows,
    selectedRequestId,
    focusedRequestId,
    setFocusedRequestId,
    rejectModalIds,
    setRejectModalIds,
    bulkDecide,
    onApproveError: (caught) => {
      showToast(
        describeError(
          t("admin:verifications.requests.bulk.action.approve"),
          caught,
        ),
        "error",
      );
    },
    searchInputWrapperRef: searchWrapperRef,
  });

  async function confirmKeyboardReject(reason: string) {
    const ids = rejectModalIds;
    if (!ids) return;
    try {
      await bulkDecide(ids, "reject", reason);
      setRejectModalIds(null);
    } catch (caught) {
      showToast(
        describeError(
          t("admin:verifications.requests.bulk.action.reject"),
          caught,
        ),
        "error",
      );
    }
  }

  return (
    <>
      <FadeIn delay={60}>
        <ReviewQueueStatusTabs
          status={status}
          counts={counts}
          totalCount={totalCount}
          onChange={handleStatusChange}
        />
      </FadeIn>

      <FadeIn delay={70}>
        <RequestQueueHeader
          query={query}
          sort={sort}
          onQueryChange={handleQueryChange}
          onSortChange={handleSortChange}
          searchInputWrapperRef={searchWrapperRef}
        />
      </FadeIn>

      <p className={styles.keyboardHint}>
        {t("admin:verifications.requests.keyboard.hint")}
      </p>

      <FadeIn delay={80}>
        <ReviewQueueResults
          rows={rows}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          onOpen={setSelectedRequestId}
          selectedIds={selectedIds}
          onToggle={toggleSelected}
          onToggleAll={toggleSelectAll}
          atSelectionCap={atSelectionCap}
          focusedRequestId={focusedRequestId}
          onClearSelection={() => setSelectedIds(new Set())}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
        />
      </FadeIn>

      {selectedRequestId && (
        <VerificationRequestDrawer
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onDecided={handleRequestDecided}
        />
      )}

      {rejectModalIds && (
        <VerificationBulkRejectModal
          count={rejectModalIds.length}
          pending={bulkPending}
          onConfirm={(reason) => void confirmKeyboardReject(reason)}
          onClose={() => setRejectModalIds(null)}
        />
      )}
    </>
  );
}

/** The Direct-override segment: the Phase 1 level console, moved here
 *  unchanged. `level`/`headerValue` (`{ query, sort }`) together drive the
 *  server-side `useAdminVerifications` filter (each combination is its own
 *  paginated, counted query) — mirroring `AdminListingsPage`'s
 *  controlled-filter pattern. `selectedUserId` tracks which member's row was
 *  opened; the selected row is looked up from the already-loaded `rows` (no
 *  separate detail fetch) and handed to `VerificationDetailDrawer`, which
 *  owns the override control and audit history. */
function DirectOverrideSegment() {
  const { t } = useTranslation();
  const [level, setLevel] = useState<VerificationLevelFilter>("all");
  const [headerValue, setHeaderValue] = useState<AdminVerificationsHeaderValue>({
    query: "",
    sort: "recent",
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    rows,
    counts,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminVerifications({
    level,
    query: headerValue.query,
    sort: headerValue.sort,
  });

  const totalCount = VERIFICATION_LEVELS.reduce(
    (sum, everyLevel) => sum + counts[everyLevel],
    0,
  );
  const selectedRow =
    rows.find((candidate) => candidate.userId === selectedUserId) ?? null;

  return (
    <>
      <p className={styles.honesty}>{t("admin:verifications.honesty")}</p>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={LEVEL_TABS.map((tabLevel) => ({
            id: tabLevel,
            label:
              tabLevel === "all"
                ? t("admin:verifications.tabs.all")
                : t(`admin:verifications.level.${tabLevel}`),
            count: tabLevel === "all" ? totalCount : counts[tabLevel],
          }))}
          active={level}
          onChange={(nextLevel) =>
            setLevel(nextLevel as VerificationLevelFilter)
          }
        />
      </FadeIn>

      <FadeIn delay={70}>
        <AdminVerificationsHeader value={headerValue} onChange={setHeaderValue} />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError && rows.length === 0 ? (
          <VerificationsErrorState onRetry={() => void refetch()} />
        ) : rows.length === 0 ? (
          <p className={submissionStyles.emptyLine}>
            {t("admin:verifications.empty")}
          </p>
        ) : (
          <>
            <AdminVerificationRows rows={rows} onOpen={setSelectedUserId} />
            {hasNextPage && (
              <div className={submissionStyles.loadMore}>
                <Button
                  variant="ghost"
                  size="md"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {isFetchingNextPage
                    ? t("admin:verifications.loadingMore")
                    : t("admin:verifications.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>

      {selectedRow && (
        <VerificationDetailDrawer
          row={selectedRow}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
}
