import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button, EmptyState, FadeIn, FeatureHelp, SegmentedControl, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminListingRows } from "./AdminListingRows";
import { BulkActionBar } from "./BulkActionBar";
import { ListingPreviewDrawer } from "./ListingPreviewDrawer";
import { EditSuggestionsSection } from "./EditSuggestionsSection";
import { ListingClaimsSection } from "./ListingClaimsSection";
import { AdminListingsHeader, type AdminListingsHeaderValue } from "./AdminListingsHeader";
import { useAdminListings } from "./api/useAdminListings";
import {
  LISTING_BULK_ACTION_CAP,
  type AdminListingsStatusFilter,
  type ListingQueueRow,
  type ListingQueueSort,
} from "./api/adminListings.api";
import styles from "./AdminListingsPage.module.css";

type ViewTab = "queue" | "editSuggestions" | "claims";
const VIEWS: ViewTab[] = ["queue", "editSuggestions", "claims"];

/**
 * Moderator queue for member-submitted directory listings: filter by review
 * status and move a listing review → quick question → live (or back). Every
 * status/remove/ask action goes through `useListingModeration`, which
 * patches the shared `[admin-listings]` cache directly — so this page reads
 * `rows` straight from the query with no local override/removed-refs state.
 *
 * `filter` drives the server-side `status` param (rather than a client-side
 * filter over one unfiltered fetch), so each tab is its own paginated,
 * counted query. `q`/`sort` are driven by `<AdminListingsHeader>`, which owns
 * the search/sort/status controls as a single controlled `value`/`onChange`
 * pair — this page just holds the three primitives it patches.
 */
export function AdminListingsPage() {
  const { t } = useTranslation();
  const [view, setView] = useState<ViewTab>("queue");
  const [filter, setFilter] = useState<AdminListingsStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<ListingQueueSort>("newest");
  const statusArg = filter === "all" ? undefined : filter;
  const {
    rows,
    counts,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminListings({ status: statusArg, q: searchQuery, sort });
  const [openRow, setOpenRow] = useState<ListingQueueRow | null>(null);
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  // Starts `true` so the queue's genuine first mount gets the row-entrance
  // cascade; `handleHeaderChange` flips it permanently `false` the moment the
  // moderator first touches search/sort/status, so every later tab/search/
  // sort change renders the new rows instantly instead of re-staggering.
  const [animateRowEntrance, setAnimateRowEntrance] = useState(true);

  function handleHeaderChange(next: AdminListingsHeaderValue) {
    setFilter(next.status);
    setSearchQuery(next.q);
    setSort(next.sort);
    setAnimateRowEntrance(false);
    // A ref selected under one filter/search/sort combination stops meaning
    // anything once the moderator switches to another — e.g. a row picked
    // while on "In review" no longer applies once they jump to "Live".
    setSelectedRefs(new Set());
  }

  // Mirrors the backend's per-request cap (`LISTING_BULK_ACTION_CAP`) so a
  // moderator can't select past what a single bulk request can carry —
  // enforced here (the state itself never exceeds it) and surfaced to the
  // row/select-all checkboxes below so unselected ones disable at the cap.
  const atSelectionCap = selectedRefs.size >= LISTING_BULK_ACTION_CAP;

  function toggleSelected(ref: string) {
    setSelectedRefs((current) => {
      const next = new Set(current);
      if (next.has(ref)) {
        next.delete(ref);
      } else if (next.size < LISTING_BULK_ACTION_CAP) {
        next.add(ref);
      }
      return next;
    });
  }

  /** Selects every currently-visible row (up to the bulk-action cap), or
   *  deselects them all if every one is already selected — the same
   *  "select all visible" semantics as `DraftsTabs`'s select-all. Rows
   *  outside the current filter/page are left untouched either way. */
  function toggleSelectAll() {
    setSelectedRefs((current) => {
      const allVisibleSelected = rows.every((row) => current.has(row.ref));
      const next = new Set(current);
      for (const row of rows) {
        if (allVisibleSelected) {
          next.delete(row.ref);
        } else if (next.size < LISTING_BULK_ACTION_CAP) {
          next.add(row.ref);
        }
      }
      return next;
    });
  }

  // The drawer always shows the latest cached row for the open ref (not the
  // possibly-stale object captured when it was opened), so a status change
  // made from the row underneath is reflected without any local merge.
  const openRowLive = openRow
    ? (rows.find((row) => row.ref === openRow.ref) ?? openRow)
    : null;

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminListings.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminListings.header.eyebrow")}
          title={
            <>
              <Translation
                i18nKey="admin:adminListings.header.title"
                components={{ em: <em /> }}
              />{" "}
              <FeatureHelp id="admin.listings" />
            </>
          }
          sub={t("admin:adminListings.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <SegmentedControl
          label={t("admin:adminListings.view.ariaLabel")}
          options={VIEWS.map((viewOption) => ({
            value: viewOption,
            label: t(`admin:adminListings.view.${viewOption}`),
          }))}
          value={view}
          onChange={(nextView) => setView(nextView as ViewTab)}
        />
      </FadeIn>

      {view === "queue" ? (
        <>
          <FadeIn delay={70}>
            <AdminListingsHeader
              value={{ q: searchQuery, sort, status: filter }}
              counts={counts}
              onChange={handleHeaderChange}
            />
          </FadeIn>

          <FadeIn delay={80}>
            {isLoading ? (
              <ListingRowsSkeleton />
            ) : isError && rows.length === 0 ? (
              // A failed fetch must read as an outage, not a false "queue is
              // empty" — `EmptyQueueState`'s plum success panel is reserved
              // for a genuinely empty queue after a successful fetch.
              <ListingQueueErrorState onRetry={() => void refetch()} />
            ) : (
              <>
                <AdminListingRows
                  rows={rows}
                  selectedRefs={selectedRefs}
                  atSelectionCap={atSelectionCap}
                  animateEntrance={animateRowEntrance}
                  onOpen={setOpenRow}
                  onToggle={toggleSelected}
                  onToggleAll={toggleSelectAll}
                />
                {selectedRefs.size > 0 && (
                  <BulkActionBar
                    selectedRefs={selectedRefs}
                    onClear={() => setSelectedRefs(new Set())}
                  />
                )}
                {hasNextPage && (
                  <div className={styles.loadMore}>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => void fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      {t("admin:adminListings.loadMoreCta")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </FadeIn>
        </>
      ) : view === "editSuggestions" ? (
        <EditSuggestionsSection />
      ) : (
        <ListingClaimsSection />
      )}

      {openRowLive && (
        <ListingPreviewDrawer
          row={openRowLive}
          onClose={() => setOpenRow(null)}
        />
      )}
    </AdminShell>
  );
}

/** Branded, retryable error state — mirrors `QueueErrorPane` in
 *  `AdminModerationPanes.tsx`. A failed live fetch must read as an outage a
 *  moderator can recover from, never as a false "nothing to review". Demo
 *  mode never errors, so this only ever fires against the real API. */
function ListingQueueErrorState({ onRetry }: { onRetry: () => void }) {
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

function ListingRowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={64}
          style={{ borderRadius: 14 }}
        />
      ))}
    </div>
  );
}
