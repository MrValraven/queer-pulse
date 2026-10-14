import { useRef, useState, type FocusEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AnimatePresence,
  m,
  type Transition,
  type Variants,
} from "motion/react";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  SegmentedControl,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
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
import { useListingClaims } from "./api/useListingClaims";
import { useEditSuggestions } from "./api/useEditSuggestions";
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

/** The search param that deep-links a view, e.g. `?view=claims`. The
 *  submissions queue is the default and keeps the URL bare. */
const VIEW_PARAM = "view";

/** Mirrors the backend's `DEFAULT_LIST_LIMIT`: `GET
 *  /admin/listings/edit-suggestions` answers with at most this many rows, so a
 *  full answer is a floor on the pending count and the badge says so. */
const EDIT_SUGGESTIONS_LIST_CAP = 200;

function isViewTab(
  value: string | null,
  views: readonly ViewTab[],
): value is ViewTab {
  return views.some((viewOption) => viewOption === value);
}

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
  const [searchParams, setSearchParams] = useSearchParams();
  const views = useListingViews();
  // The view lives in the URL, so a link can land straight on a tab
  // (`?view=claims`). A value this viewer may not open, or one that names no
  // view at all, lands on the submissions queue.
  const requestedView = searchParams.get(VIEW_PARAM);
  const view: ViewTab = isViewTab(requestedView, views)
    ? requestedView
    : "queue";
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

  // Replaces the history entry, so switching tabs never piles up Back
  // steps. Every other param (`?q=` included) is carried over as it is.
  function handleViewChange(nextView: ViewTab) {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (nextView === "queue") nextParams.delete(VIEW_PARAM);
        else nextParams.set(VIEW_PARAM, nextView);
        return nextParams;
      },
      { replace: true },
    );
  }

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

      <ListingViewSwitch
        views={views}
        view={view}
        onChange={handleViewChange}
      />

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
  views,
  view,
  onChange,
}: {
  views: readonly ViewTab[];
  view: ViewTab;
  onChange: (nextView: ViewTab) => void;
}) {
  const { t } = useTranslation();
  const pendingCountFor = useViewPendingCounts();
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
          label: (
            <ListingViewLabel
              label={t(`admin:adminListings.view.${viewOption}`)}
              pending={pendingCountFor(viewOption)}
            />
          ),
        }))}
        value={view}
        onChange={(nextView) => onChange(nextView as ViewTab)}
      />
    </FadeIn>
  );
}

/** What a view's count badge shows. */
interface ViewPendingCount {
  /** How many items wait in this view (a floor when `display` ends in +). */
  count: number;
  /** The figure on screen, e.g. "3", or "200+" for a capped list. */
  display: string;
  /** What a screen reader hears in the figure's place. */
  spokenText: string;
}

/**
 * The pending counts behind the view switcher's badges. Ownership claims read
 * the same query (and key) as the Claims view and the admin rail's Listings
 * pill, and use the server's `total` for the whole pending queue. Edit
 * suggestions have no total on the wire, so the badge counts a
 * `status=pending` fetch, which is exact below the endpoint's row cap and
 * shows the cap with a plus once it is reached. Both keys are invalidated by
 * their review mutations, so a badge drops as soon as a row is decided.
 */
function useViewPendingCounts(): (view: ViewTab) => ViewPendingCount | null {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { total: pendingClaimCount } = useListingClaims();
  const { rows: pendingSuggestions } = useEditSuggestions("pending");
  const pendingSuggestionCount = pendingSuggestions.length;
  const isSuggestionCountCapped =
    pendingSuggestionCount >= EDIT_SUGGESTIONS_LIST_CAP;

  return (view) => {
    if (view === "claims") {
      return {
        count: pendingClaimCount,
        display: fmt.number(pendingClaimCount),
        spokenText: t("admin:listingClaims.pendingCount", {
          count: pendingClaimCount,
        }),
      };
    }
    if (view === "editSuggestions") {
      return {
        count: pendingSuggestionCount,
        display: isSuggestionCountCapped
          ? `${fmt.number(pendingSuggestionCount)}+`
          : fmt.number(pendingSuggestionCount),
        spokenText: isSuggestionCountCapped
          ? t("admin:editSuggestions.pendingCountAtLeast", {
              count: pendingSuggestionCount,
            })
          : t("admin:editSuggestions.pendingCount", {
              count: pendingSuggestionCount,
            }),
      };
    }
    return null;
  };
}

/** The badge's slot grows open from nothing, so the segment widens in real
 *  layout and its neighbours slide along; the pill inside scales up as it
 *  fades in. Closing runs the same way backwards. The gap before the pill is
 *  the pill's own CSS margin inside the clipping slot, so it is there on a
 *  first render too (a count the rail already cached mounts already shown). */
const VIEW_COUNT_SLOT_VARIANTS: Variants = {
  hidden: { width: 0, opacity: 0 },
  shown: { width: "auto", opacity: 1 },
};
const VIEW_COUNT_PILL_VARIANTS: Variants = {
  hidden: { scale: 0.6 },
  shown: { scale: 1 },
};
const VIEW_COUNT_TRANSITION: Transition = {
  type: "spring",
  duration: 0.36,
  bounce: 0.18,
};
const INSTANT_TRANSITION: Transition = { duration: 0 };

/** A segment's label plus, while anything waits in that view, its count
 *  badge. The figure is decoration for sighted readers (`aria-hidden`); the
 *  visually hidden sentence beside it is what joins the button's name, and it
 *  leaves at once when the count reaches zero while the pill animates out. */
function ListingViewLabel({
  label,
  pending,
}: {
  label: string;
  pending: ViewPendingCount | null;
}) {
  const { reducedMotion } = useMotionPrefs();
  const visiblePending = pending && pending.count > 0 ? pending : null;
  const transition = reducedMotion ? INSTANT_TRANSITION : VIEW_COUNT_TRANSITION;

  return (
    <span className={styles.viewLabel}>
      {label}
      <AnimatePresence initial={false}>
        {visiblePending && (
          <m.span
            key="count"
            aria-hidden
            className={styles.viewCountSlot}
            variants={VIEW_COUNT_SLOT_VARIANTS}
            initial="hidden"
            animate="shown"
            exit="hidden"
            transition={transition}
          >
            <m.span
              className={styles.viewCount}
              variants={VIEW_COUNT_PILL_VARIANTS}
              transition={transition}
            >
              <RollingNumber
                value={visiblePending.display}
                numericValue={visiblePending.count}
              />
            </m.span>
          </m.span>
        )}
      </AnimatePresence>
      {visiblePending && (
        <span className="visuallyHidden"> {visiblePending.spokenText}</span>
      )}
    </span>
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
