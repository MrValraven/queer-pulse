import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button, LoadErrorState, Outro } from "../../shared/components/ui";
import {
  FilterPageLayout,
  FiltersSheet,
  useFilterPageState,
} from "../../shared/components/filterPage";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  FLATMATES_FILTER_SECTION_KEYS,
  FLATMATES_PANEL_STORAGE_KEY,
  FLATMATES_SECTIONS_STORAGE_KEY,
} from "./flatmatesFilterSections";
import { FlatmatesFilterSidebar } from "./FlatmatesFilterSidebar";
import { FlatmatesResults } from "./FlatmatesResults";
import { type FlatmateView } from "./FlatmateViewToggle";
import { useFlatmatesActiveFilters } from "./useFlatmatesActiveFilters";
import { useFlatmatesFilters } from "./useFlatmatesFilters";

/** The Flatmates tab's board on the members directory's layout: the filters
 *  sidebar beside the results, plus the mobile filters sheet. `HousingPage`
 *  renders it inside its filter page frame under the shared header, and
 *  renders `FlatmatesOutro` after the frame. */
export function FlatmatesBoard({
  onPostProfile,
}: {
  /** Opens the "Post your profile" modal the page owns. */
  onPostProfile: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [view, setView] = useState<FlatmateView>("list");
  const {
    filters,
    actions,
    filterKey,
    isAnyFilterActive,
    source,
    filtered,
    profilesQuery,
    optionCounts,
  } = useFlatmatesFilters();
  const {
    isPlaceholderData: isCountStale,
    isFetching,
    isError: hasProfilesError,
    refetch: refetchProfiles,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = profilesQuery;
  const chips = useFlatmatesActiveFilters(filters, actions);
  // View-only state: the sidebar's shown/hidden choice (shared with the
  // Housing tab), which sections are open, and the mobile sheet.
  const pageState = useFilterPageState({
    panelStorageKey: FLATMATES_PANEL_STORAGE_KEY,
    sectionsStorageKey: FLATMATES_SECTIONS_STORAGE_KEY,
    sectionKeys: FLATMATES_FILTER_SECTION_KEYS,
  });

  // Skeleton while the simulated demo beat runs OR (live) the query is in
  // flight, so a slow live fetch never flashes the empty-board CTA. A
  // "Load more" fetch keeps the loaded cards on screen.
  //
  // `useSimulatedLoad` is a DEMO device (ENG-172). Demo profiles resolve from a
  // local registry in the same tick, so the short fake beat is the only thing
  // keeping the board from popping in. Live mode has a real loading state, and
  // the fake 600ms sat on top of it, painting a skeleton over profiles that had
  // already arrived, so it is gated to demo mode.
  const isSimulatedLoading = useSimulatedLoad();
  const isLoading = demoMode
    ? isSimulatedLoading
    : isFetching && !isFetchingNextPage;
  // With nothing on the board, the filters have nothing to act on: the
  // sidebar slides away and the empty state carries the single call to
  // action. A filtered search that comes back empty is a different state (the
  // server does the filtering, so an empty result says nothing about the
  // board) and keeps the sidebar plus its own "clear filters" empty state.
  // While the first page loads the board is not known to be empty yet, so the
  // sidebar stays in place beside the skeletons.
  const isBoardEmpty = !isLoading && source.length === 0 && !isAnyFilterActive;
  const sayHello = (profileId: number) =>
    setSent((previous) => new Set(previous).add(profileId));

  // A failed fetch leaves `source` empty, which the board would otherwise read
  // as "nobody has posted a profile yet" and answer with the post-your-profile
  // CTA. Say the board could not load, and offer a retry (DES-22).
  if (hasProfilesError && !isLoading) {
    return (
      <LoadErrorState
        title={t("economy:flatmates.loadError.title")}
        description={t("economy:flatmates.loadError.description")}
        onRetry={() => void refetchProfiles()}
      />
    );
  }

  return (
    <>
      <FilterPageLayout
        isMobile={pageState.isMobile}
        isPanelOpen={pageState.isPanelOpen}
        isSidebarAvailable={!isBoardEmpty}
        sidebar={
          <FlatmatesFilterSidebar
            filters={filters}
            actions={actions}
            optionCounts={optionCounts}
            isCountStale={isCountStale}
            appliedCount={chips.length}
            sectionsOpen={pageState.sectionsOpen}
            onToggleSection={pageState.toggleSection}
          />
        }
      >
        <FlatmatesResults
          isBoardEmpty={isBoardEmpty}
          isLoading={isLoading}
          profiles={filtered}
          filterKey={filterKey}
          chips={chips}
          pageState={pageState}
          view={view}
          setView={setView}
          sentIds={sent}
          onSayHello={sayHello}
          onPostProfile={onPostProfile}
          onClearFilters={actions.clearFilters}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onFetchNextPage={() => void fetchNextPage()}
        />
      </FilterPageLayout>

      {pageState.isMobile && pageState.isSheetOpen && (
        <FiltersSheet
          title={t("economy:flatmates.filtersSheetLabel")}
          showResultsLabel={
            <Translation
              i18nKey="economy:flatmates.showResultsCta"
              values={{ count: filtered.length }}
              slots={{
                count: (
                  <RollingNumber
                    value={fmt.number(filtered.length)}
                    numericValue={filtered.length}
                  />
                ),
              }}
            />
          }
          onClose={pageState.closeSheet}
        >
          <FlatmatesFilterSidebar
            isInSheet
            filters={filters}
            actions={actions}
            optionCounts={optionCounts}
            isCountStale={isCountStale}
            appliedCount={chips.length}
            sectionsOpen={pageState.sectionsOpen}
            onToggleSection={pageState.toggleSection}
          />
        </FiltersSheet>
      )}
    </>
  );
}

/** The flatmates tab's outro, after the filter page frame: post a profile or
 *  ask the forum. */
export function FlatmatesOutro({
  onPostProfile,
}: {
  /** Opens the "Post your profile" modal the page owns. */
  onPostProfile: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Outro
      title={
        <Translation
          i18nKey="economy:flatmates.outro.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("economy:flatmates.outro.sub")}
    >
      <Button type="button" variant="primary" size="lg" onClick={onPostProfile}>
        {t("economy:flatmates.postProfileCta")}
      </Button>
      <Button to={routes.forum} variant="ghost-dark" size="lg">
        {t("economy:flatmates.outro.askForum")} <FiArrowRight aria-hidden />
      </Button>
    </Outro>
  );
}
