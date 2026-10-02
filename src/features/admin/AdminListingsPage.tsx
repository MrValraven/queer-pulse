import { useRef, useState, type FocusEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  SegmentedControl,
} from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminListingRows, ListingRowsSkeleton } from "./AdminListingRows";
import { BulkActionBar } from "./BulkActionBar";
import { ListingPreviewDrawer } from "./ListingPreviewDrawer";
import { EditSuggestionsSection } from "./EditSuggestionsSection";
import { ListingClaimsSection } from "./ListingClaimsSection";
import { ListingDraftsSection } from "./ListingDraftsSection";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  AdminListingsHeader,
  type AdminListingsHeaderValue,
} from "./AdminListingsHeader";
import { useAdminListings } from "./api/useAdminListings";
import { LISTING_QUEUE_HEADING_ID } from "./listingQueueFocus";
import { useHasHiddenEndContent } from "./useHasHiddenEndContent";
import {
  LISTING_BULK_ACTION_CAP,
  type AdminListingsStatusFilter,
  type ListingQueueRow,
  type ListingQueueSort,
} from "./api/adminListings.api";
import styles from "./AdminListingsPage.module.css";

type ViewTab = "queue" | "editSuggestions" | "claims" | "drafts";
const VIEWS: ViewTab[] = ["queue", "editSuggestions", "claims"];

/** The views this viewer may open. Unfinished drafts are Admin only
 *  (`GET /admin/listing-drafts` is `@Roles(Admin)`, and reaching out goes
 *  through the Admin-only official thread), so a moderator or a
 *  `directory_moderator` grant holder is never offered a tab the API refuses.
 *  Gated like `ListingPreviewDrawer`'s delegation section. */
function useListingViews(): ViewTab[] {
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  return demoMode || role === "admin" ? [...VIEWS, "drafts"] : VIEWS;
}

/**
 * Moderator queue for member-submitted directory listings: filter by review
 * status and move a listing review → quick question → live (or back). Every
 * status/remove/ask action goes through `useListingModeration`, which
 * patches the shared `[admin-listings]` cache directly, so this page reads
 * `rows` straight from the query with no local override/removed-refs state.
 *
 * `filter` drives the server-side `status` param, so each tab is its own
 * paginated, counted query. `q`/`sort` are driven by `<AdminListingsHeader>`, which owns
 * the search/sort/status controls as a single controlled `value`/`onChange`
 * pair; this page just holds the three primitives it patches.
 */
export function AdminListingsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<ViewTab>("queue");
  const [filter, setFilter] = useState<AdminListingsStatusFilter>("all");
  // Seeded once from `?q=` so a deep link lands on that row; typing in the
  // header owns the value from then on, and nothing syncs it back.
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") ?? "",
  );
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
  // First mount gets the row-entrance cascade; the first search/sort/status
  // change flips this off for good, so later changes render rows instantly.
  const [animateRowEntrance, setAnimateRowEntrance] = useState(true);

  function handleHeaderChange(next: AdminListingsHeaderValue) {
    setFilter(next.status);
    setSearchQuery(next.q);
    setSort(next.sort);
    setAnimateRowEntrance(false);
    // A selection made under one filter/search/sort stops applying once the
    // moderator switches to another.
    setSelectedRefs(new Set());
  }

  // Mirrors the backend's per-request cap (`LISTING_BULK_ACTION_CAP`): the
  // state never exceeds it, and unselected checkboxes disable at the cap.
  const atSelectionCap = selectedRefs.size >= LISTING_BULK_ACTION_CAP;
  const hasSelection = selectedRefs.size > 0;
  // The rows (or the empty queue) render once loading is done, unless the
  // fetch failed with nothing cached to show.
  const hasRowsBody = !isLoading && !(isError && rows.length === 0);

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
   *  deselects them all if every one is already selected, with the same
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

  // The drawer shows the latest cached row for the open ref, so a status
  // change made from the row underneath shows up without a local merge.
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
          titleId={LISTING_QUEUE_HEADING_ID}
          eyebrow={t("admin:adminListings.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminListings.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminListings.header.sub")}
        />
      </FadeIn>

      <ListingViewSwitch view={view} onChange={setView} />

      {view === "queue" ? (
        <>
          {/* One queue panel: the toolbar, then the body. While a selection
              is active, the bulk-bar reserve pads below the panel. */}
          <FadeIn
            delay={70}
            className={
              hasRowsBody && hasSelection ? styles.queueWithBulkBar : undefined
            }
          >
            <section className={styles.queuePanel}>
              <AdminListingsHeader
                value={{ q: searchQuery, sort, status: filter }}
                counts={counts}
                onChange={handleHeaderChange}
              />
              {isLoading ? (
                <ListingRowsSkeleton />
              ) : hasRowsBody ? (
                <AdminListingRows
                  rows={rows}
                  searchQuery={searchQuery}
                  statusFilter={filter}
                  selectedRefs={selectedRefs}
                  atSelectionCap={atSelectionCap}
                  animateEntrance={animateRowEntrance}
                  onOpen={setOpenRow}
                  onToggle={toggleSelected}
                  onToggleAll={toggleSelectAll}
                />
              ) : (
                // A failed fetch must read as an outage. `EmptyQueueState`'s
                // plum "queue is empty" success panel is reserved for a
                // genuinely empty queue after a successful fetch.
                <div className={styles.panelMessage}>
                  <ListingQueueErrorState onRetry={() => void refetch()} />
                </div>
              )}
            </section>
            {hasRowsBody && hasNextPage && (
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
          </FadeIn>
          {/* Mounted outside the FadeIn and the panel: both are containing
              blocks for fixed descendants (`will-change: transform`, the
              container query), and the bar floats against the viewport. */}
          {hasRowsBody && hasSelection && (
            <BulkActionBar
              selectedRefs={selectedRefs}
              onClear={() => setSelectedRefs(new Set())}
            />
          )}
        </>
      ) : (
        <ListingSecondaryView view={view} />
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

/** The Submissions / Edit suggestions / Ownership claims switcher. On a
 *  phone its wrapper scrolls sideways (AdminListingsPage.module.css), so a
 *  segment that takes keyboard focus scrolls itself into view, ring included
 *  through the wrapper's scroll padding. `scrollIntoView` with no `behavior`
 *  follows each scroller's own `scroll-behavior`: the wrapper keeps the
 *  instant default, and base.css turns the page's smooth scrolling off under
 *  reduced motion (OS setting or the in-app toggle). The end edge fades while
 *  segments hide past it. */
function ListingViewSwitch({
  view,
  onChange,
}: {
  view: ViewTab;
  onChange: (nextView: ViewTab) => void;
}) {
  const { t } = useTranslation();
  const views = useListingViews();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hasHiddenViewsAtEnd = useHasHiddenEndContent(scrollerRef);

  function revealFocusedSegment(event: FocusEvent<HTMLDivElement>) {
    (event.target as HTMLElement).scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }

  return (
    <FadeIn
      ref={scrollerRef}
      delay={60}
      className={styles.viewSwitchScroller}
      data-fade-end={hasHiddenViewsAtEnd ? "" : undefined}
      onFocus={revealFocusedSegment}
    >
      <SegmentedControl
        className={styles.viewSwitch}
        label={t("admin:adminListings.view.ariaLabel")}
        options={views.map((viewOption) => ({
          value: viewOption,
          label: t(`admin:adminListings.view.${viewOption}`),
        }))}
        value={view}
        onChange={(nextView) => onChange(nextView as ViewTab)}
      />
    </FadeIn>
  );
}

/** Every view but the submissions queue: each is a self-contained section
 *  that owns its own query and filters. */
function ListingSecondaryView({ view }: { view: Exclude<ViewTab, "queue"> }) {
  if (view === "editSuggestions") return <EditSuggestionsSection />;
  if (view === "claims") return <ListingClaimsSection />;
  return <ListingDraftsSection />;
}

/** Branded, retryable error state, mirroring `QueueErrorPane` in
 *  `AdminModerationPanes.tsx`. A failed live fetch must read as an outage a
 *  moderator can recover from; the "nothing to review" state is kept for a
 *  genuinely empty queue. Demo mode never errors, so this only ever fires
 *  against the real API. */
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
