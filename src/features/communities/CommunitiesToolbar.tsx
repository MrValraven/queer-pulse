import {
  ActiveFilters,
  Button,
  RefineToggle,
  SearchInput,
} from "../../shared/components/ui";
import { useRefineDrawer } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { CommunitiesTopTabs } from "./CommunitiesTopTabs";
import { CommunitiesRefinePanel } from "./CommunitiesRefinePanel";
import { useCommunitiesActiveFilters } from "./useCommunitiesActiveFilters";
import type { DiscoverCommunities } from "./useDiscoverCommunities";
import type { TopTab } from "./useCommunitiesTopTab";
import styles from "./CommunitiesToolbar.module.css";

/**
 * The whole `/communities` control bar on one line: the My communities |
 * Discover switch, the search field, the Refine toggle and the one primary
 * action, with the drawer and the active-filter chips beneath.
 *
 * It used to be four stacked bands — tabs and two buttons in the header, then
 * search and Refine, then a results line — spread over ~175px above the first
 * card. Everything that survived that merge is here, which is why this sits in
 * the page header rather than in either tab's body: one bar over both pools,
 * so switching tabs moves the cards under it and leaves the controls alone.
 *
 * Two pieces went instead of moving. The "How communities work" button became
 * the deeper-explainer action inside the ⓘ beside the title, which was already
 * the page's "explain this screen" affordance; two of those side by side was
 * the redundancy, and dropping one is what frees the width for a single row.
 * And the results line is gone: unrefined, the active tab's own pill is the
 * count, so a separate "1 community" under "My communities 1" said it twice.
 * Once something IS narrowing, the count rides the chip row, where it sits
 * beside the chips that explain it.
 */
export function CommunitiesToolbar({
  discover,
  active,
  onChange,
}: {
  discover: DiscoverCommunities;
  active: TopTab;
  onChange: (next: TopTab) => void;
}) {
  const { t } = useTranslation();
  const refine = useRefineDrawer("qp.communities.refineOpen");
  const activeFilters = useCommunitiesActiveFilters({
    searchInput: discover.searchInput,
    setSearchInput: discover.setSearchInput,
    filter: discover.filter,
    setFilter: discover.setFilter,
    isOpenOnly: discover.isOpenOnly,
    setIsOpenOnly: discover.setIsOpenOnly,
    isBusyOnly: discover.isBusyOnly,
    setIsBusyOnly: discover.setIsBusyOnly,
    tagIds: discover.tagIds,
    setTagIds: discover.setTagIds,
    sort: discover.sort,
    setSort: discover.setSort,
  });

  // The search term shows in the field itself and sort shows as a chip, so the
  // badge counts only what the shut drawer is actually hiding.
  const hiddenFilterCount =
    (discover.filter === "all" ? 0 : 1) +
    (discover.isOpenOnly ? 1 : 0) +
    (discover.isBusyOnly ? 1 : 0) +
    discover.tagIds.length;

  const resultCount =
    discover.gridItems.length + (discover.isShowingFeatured ? 1 : 0);
  // Not known while the grid is still showing the previous sort or filter's
  // rows either: that count belongs to the run being replaced, and announcing
  // it would say a number the member is about to see change.
  const isCountKnown =
    !discover.isShowingSkeletons && !discover.isShowingStaleResults;

  // A member who belongs to no communities gets the empty state below, and
  // searching an empty pool is an affordance for nothing — so the search and
  // Refine pair drops out, leaving the switch and the one action that helps.
  // Kept while the first page is still in flight (the pool isn't known to be
  // empty yet) and kept whenever a refinement is on, so a search that found
  // nothing can always be cleared.
  const isShowingSearch =
    !isCountKnown || resultCount > 0 || discover.hasActiveRefinement;

  return (
    <>
      <div className={styles.bar}>
        <CommunitiesTopTabs
          active={active}
          onChange={onChange}
          className={styles.tabs}
        />

        {isShowingSearch && (
          <div className={styles.find}>
            <SearchInput
              className={styles.search}
              value={discover.searchInput}
              onChange={discover.setSearchInput}
              placeholder={t("communities:discover.search.placeholder")}
              ariaLabel={t("communities:discover.search.ariaLabel")}
            />
            <RefineToggle
              {...refine.toggleProps}
              activeCount={hiddenFilterCount}
            />
          </div>
        )}

        <Button
          variant="primary"
          to={routes.startCommunity}
          className={styles.startCta}
        >
          {t("communities:hub.startCta")}
        </Button>
      </div>

      {/* Gated on the same condition as its toggle: the drawer's open state
          is remembered per device, so a member who left it open and then hit
          an empty pool would otherwise face an open panel with no way to shut
          it. */}
      {isShowingSearch && (
        <CommunitiesRefinePanel
          discover={discover}
          panelProps={refine.panelProps}
        />
      )}

      <ActiveFilters
        filters={activeFilters}
        onClearFilters={discover.resetRefinements}
        trailing={
          isCountKnown
            ? t("communities:discover.resline.count", { count: resultCount })
            : null
        }
      />

      {/* The visible count only appears once something is narrowing the list,
          so this is what tells a screen reader how many results a refinement
          left behind. The tab pills stay aria-hidden and defer to it. */}
      <p className="visuallyHidden" aria-live="polite">
        {isCountKnown
          ? t("communities:discover.resline.count", { count: resultCount })
          : ""}
      </p>
    </>
  );
}
