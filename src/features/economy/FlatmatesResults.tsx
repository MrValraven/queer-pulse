import { Button, Collapse } from "../../shared/components/ui";
import {
  AppliedChipsRow,
  FilterResultsTop,
  FiltersToggleButton,
  type AppliedFilterChip,
  type FilterPageState,
} from "../../shared/components/filterPage";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Profile } from "./flatmates.data";
import type { FlatmatesFilterSectionKey } from "./flatmatesFilterSections";
import { FlatmateDiscovery } from "./FlatmateDiscovery";
import { FlatmatesGrid } from "./FlatmatesGrid";
import { FlatmateViewToggle, type FlatmateView } from "./FlatmateViewToggle";
import styles from "./FlatmatesPage.module.css";

export interface FlatmatesResultsProps {
  /** Nobody has posted a profile and no filter is narrowing the board. The
   *  top row folds away so the empty state carries the one call to action. */
  isBoardEmpty: boolean;
  isLoading: boolean;
  profiles: Profile[];
  /** Changes with every filter, so the discovery deck restarts. */
  filterKey: string;
  chips: AppliedFilterChip[];
  pageState: FilterPageState<FlatmatesFilterSectionKey>;
  view: FlatmateView;
  setView: (view: FlatmateView) => void;
  sentIds: Set<number>;
  onSayHello: (profileId: number) => void;
  onPostProfile: () => void;
  onClearFilters: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}

/** The flatmates results column: the live count with the Filters button
 *  and the view toggle ("Post your profile" sits in the page header), the
 *  applied chips, then the
 *  card grid or the discovery deck and the "Load more" pager. */
export function FlatmatesResults({
  isBoardEmpty,
  isLoading,
  profiles,
  filterKey,
  chips,
  pageState,
  view,
  setView,
  sentIds,
  onSayHello,
  onPostProfile,
  onClearFilters,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: FlatmatesResultsProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isLoadMoreShown = !isLoading && !isBoardEmpty && hasNextPage;
  return (
    <div className={styles.results}>
      <Collapse isOpen={!isBoardEmpty}>
        <FilterResultsTop
          count={
            <Translation
              i18nKey="economy:flatmates.count"
              values={{ count: profiles.length }}
              slots={{
                count: (
                  <b>
                    <em>
                      <RollingNumber
                        value={fmt.number(profiles.length)}
                        numericValue={profiles.length}
                      />
                    </em>
                  </b>
                ),
              }}
            />
          }
          filtersButton={
            isBoardEmpty ? undefined : (
              <FiltersToggleButton
                isMobile={pageState.isMobile}
                isPanelOpen={pageState.isPanelOpen}
                onTogglePanel={pageState.togglePanel}
                onOpenSheet={pageState.openSheet}
                activeCount={chips.length}
              />
            )
          }
          controls={<FlatmateViewToggle view={view} setView={setView} />}
        />
      </Collapse>

      <AppliedChipsRow chips={chips} />

      {!isBoardEmpty && !isLoading && view === "discovery" ? (
        <FlatmateDiscovery
          key={filterKey}
          profiles={profiles}
          onSayHello={onSayHello}
        />
      ) : (
        <FlatmatesGrid
          loading={isLoading}
          boardEmpty={isBoardEmpty}
          profiles={profiles}
          sentIds={sentIds}
          onSayHello={onSayHello}
          onPostProfile={onPostProfile}
          onClearFilters={onClearFilters}
        />
      )}

      <Collapse isOpen={isLoadMoreShown}>
        <div className={styles.loadMoreRow}>
          <Button
            type="button"
            variant="ghost"
            onClick={onFetchNextPage}
            disabled={isFetchingNextPage}
          >
            {t(
              isFetchingNextPage
                ? "economy:flatmates.loadingMore"
                : "economy:flatmates.loadMore",
            )}
          </Button>
        </div>
      </Collapse>
    </div>
  );
}
