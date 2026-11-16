import { useEffect, useRef } from "react";
import { FadeIn } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminTabs, type AdminTab } from "./ui";
import type { ListingViewTab } from "./adminListingViews";
import { useListingClaims } from "./api/useListingClaims";
import { useEditSuggestions } from "./api/useEditSuggestions";
import styles from "./AdminListingViewTabs.module.css";

/** Prefix that links each view tab to its panel: tab id
 *  `${LISTING_VIEW_ID_PREFIX}-tab-<view>`, panel id
 *  `${LISTING_VIEW_ID_PREFIX}-panel-<view>`. */
export const LISTING_VIEW_ID_PREFIX = "listing-view";

/** Room kept beside the chosen tab when the phone strip scrolls to it. */
const TAB_EDGE_ROOM = 8;

/** Mirrors the backend's `DEFAULT_LIST_LIMIT`: `GET
 *  /admin/listings/edit-suggestions` answers with at most this many rows, so a
 *  full answer is a floor on the pending count. */
const EDIT_SUGGESTIONS_LIST_CAP = 200;

/**
 * The pending counts behind the view tabs' badges. Ownership claims read the
 * same query (and key) as the Claims view and the admin rail's Listings pill,
 * and use the server's `total` for the whole pending queue. Edit suggestions
 * have no total on the wire, so the badge counts a `status=pending` fetch,
 * which is exact below the endpoint's row cap and stops at the cap. Both keys
 * are invalidated by their review mutations, so a badge drops as soon as a row
 * is decided. A count of zero shows no badge; a failed read with nothing
 * cached shows the alert mark.
 */
function useViewTabCounts(): (
  view: ListingViewTab,
) => Pick<
  AdminTab,
  | "count"
  | "countLabel"
  | "countAriaLabel"
  | "isCountUnavailable"
  | "isCountRolling"
> {
  const { t } = useTranslation();
  const format = useFormat();
  const { total: pendingClaimCount, isError: isClaimCountError } =
    useListingClaims();
  const { rows: pendingSuggestions, isError: isSuggestionCountError } =
    useEditSuggestions("pending");
  const pendingSuggestionCount = pendingSuggestions.length;
  const isSuggestionCountCapped =
    pendingSuggestionCount >= EDIT_SUGGESTIONS_LIST_CAP;

  return (view) => {
    if (view === "claims") {
      return {
        count: pendingClaimCount > 0 ? pendingClaimCount : undefined,
        countAriaLabel:
          pendingClaimCount > 0
            ? t("admin:listingClaims.pendingCount", {
                count: pendingClaimCount,
              })
            : undefined,
        isCountUnavailable: isClaimCountError && pendingClaimCount === 0,
        isCountRolling: true,
      };
    }
    if (view === "editSuggestions") {
      return {
        count: pendingSuggestionCount > 0 ? pendingSuggestionCount : undefined,
        // A full answer is a floor on the pending count, so the pill says so.
        countLabel: isSuggestionCountCapped
          ? `${format.number(pendingSuggestionCount)}+`
          : undefined,
        countAriaLabel:
          pendingSuggestionCount > 0
            ? t(
                isSuggestionCountCapped
                  ? "admin:editSuggestions.pendingCountAtLeast"
                  : "admin:editSuggestions.pendingCount",
                { count: pendingSuggestionCount },
              )
            : undefined,
        isCountUnavailable:
          isSuggestionCountError && pendingSuggestionCount === 0,
        isCountRolling: true,
      };
    }
    return {};
  };
}

/**
 * The Submissions / Edit suggestions / Ownership claims / Unfinished drafts /
 * Partners switcher. On a phone the strip scrolls sideways, so the chosen tab
 * slides into view on load and on each change. Only the strip's own
 * `scrollLeft` moves: the page keeps its vertical position, back-navigation
 * scroll restoration included.
 */
export function AdminListingViewTabs({
  views,
  view,
  onChange,
}: {
  views: readonly ListingViewTab[];
  view: ListingViewTab;
  onChange: (nextView: ListingViewTab) => void;
}) {
  const { t } = useTranslation();
  const countFor = useViewTabCounts();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tabs: AdminTab[] = views.map((viewOption) => ({
    id: viewOption,
    label: t(`admin:adminListings.view.${viewOption}`),
    ...countFor(viewOption),
  }));
  // A count arriving widens its tab, so the chosen tab is brought into view
  // again once the strip's widths change.
  const tabLayoutKey = tabs
    .map(
      (tab) =>
        `${tab.id}:${tab.countLabel ?? tab.count ?? ""}:${tab.isCountUnavailable ? "x" : ""}`,
    )
    .join();

  useEffect(() => {
    const scroller =
      wrapperRef.current?.querySelector<HTMLElement>('[role="tablist"]');
    const chosenTab = scroller?.querySelector<HTMLElement>(
      '[aria-selected="true"]',
    );
    if (!scroller || !chosenTab) return;
    if (scroller.scrollWidth <= scroller.clientWidth) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const tabRect = chosenTab.getBoundingClientRect();
    if (tabRect.left < scrollerRect.left) {
      scroller.scrollLeft += tabRect.left - scrollerRect.left - TAB_EDGE_ROOM;
    } else if (tabRect.right > scrollerRect.right) {
      scroller.scrollLeft += tabRect.right - scrollerRect.right + TAB_EDGE_ROOM;
    }
  }, [view, tabLayoutKey]);

  return (
    <FadeIn ref={wrapperRef} delay={60} className={styles.viewTabs}>
      <AdminTabs
        label={t("admin:adminListings.view.ariaLabel")}
        idPrefix={LISTING_VIEW_ID_PREFIX}
        tabs={tabs}
        active={view}
        onChange={(nextView) => onChange(nextView as ListingViewTab)}
      />
    </FadeIn>
  );
}
