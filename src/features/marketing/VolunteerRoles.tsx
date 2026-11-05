import type { ReactNode } from "react";
import { FiHeart } from "react-icons/fi";
import {
  EmptyState,
  LoadErrorState,
  LoadMoreFooter,
  SkeletonLine,
} from "../../shared/components/ui";
import {
  AppliedChipsRow,
  FilterResultsTop,
  FiltersToggleButton,
  type AppliedFilterChip,
} from "../../shared/components/filterPage";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { VolunteerOpportunity } from "./volunteerOpportunities.types";
import { VolunteerCardSkeleton, VolunteerRoleCard } from "./VolunteerRoleCard";
import s from "./VolunteerPage.module.css";
import rolesStyles from "./VolunteerRoles.module.css";

interface VolunteerRolesGridProps {
  /** Opportunities left after the commitment and cause filters. */
  visibleOpportunities: VolunteerOpportunity[];
  /** How many were loaded before filtering, so an empty grid can tell "nothing
   *  posted yet" apart from "nothing matches these filters". */
  loadedCount: number;
  isLoading: boolean;
  /** True when the opportunities read failed (DES-22). It takes precedence
   *  over both empty states: an outage must never read as "nobody needs help
   *  right now". With roles already loaded it is the next page failing
   *  (ENG-501), and the footer retries that page alone. */
  isError: boolean;
  /** Re-runs the failed read, for the error panel's retry. */
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  /** Resets both filter groups, for the filtered empty state. */
  onClearFilters: () => void;
  /** PRD-454. Set for a signed-out visitor: the empty board's "Post an
   *  opportunity" opens the volunteer explainer through it. Unset, the
   *  action links straight to the post form. */
  onPostSignedOut?: () => void;
}

export interface VolunteerRolesProps extends VolunteerRolesGridProps {
  /** The member's own contribution card, at the foot of the column under
   *  the grid and its pagination. The count row leads the column the way it
   *  does on the members directory, so a card that folds in after load never
   *  pushes the count and the Filters entry down the page. */
  contribution?: ReactNode;
  /** The result count the top row announces. */
  resultCount: number;
  isMobile: boolean;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onOpenSheet: () => void;
  /** The sidebar's selections as removable chips. */
  chips: readonly AppliedFilterChip[];
}

/** The volunteer board's results column: the count with the Filters
 *  button, the applied chips, the roles grid, then the contribution card. */
export function VolunteerRoles({
  contribution,
  resultCount,
  isMobile,
  isPanelOpen,
  onTogglePanel,
  onOpenSheet,
  chips,
  ...gridProps
}: VolunteerRolesProps) {
  const fmt = useFormat();
  // DES-22: with the first page failed nothing has loaded, so the count row
  // stays empty above the error panel. "0 opportunities" there would read as
  // nobody needing help. Same test as the grid's own error panel below.
  const hasNothingLoadedError =
    gridProps.isError && gridProps.loadedCount === 0;
  return (
    <div>
      <FilterResultsTop
        count={
          gridProps.isLoading ? (
            <SkeletonLine width={150} height={20} />
          ) : hasNothingLoadedError ? null : (
            <Translation
              i18nKey="marketing:volunteer.resultCount"
              values={{ count: resultCount }}
              slots={{
                count: (
                  <b>
                    <em>
                      <RollingNumber
                        value={fmt.number(resultCount)}
                        numericValue={resultCount}
                      />
                    </em>
                  </b>
                ),
              }}
            />
          )
        }
        filtersButton={
          <FiltersToggleButton
            isMobile={isMobile}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            onOpenSheet={onOpenSheet}
            activeCount={chips.length}
          />
        }
      />
      <AppliedChipsRow chips={chips} />
      <VolunteerRolesGrid {...gridProps} />
      {contribution}
    </div>
  );
}

/** The open-roles grid, with its error and empty states and pagination. */
function VolunteerRolesGrid({
  visibleOpportunities,
  loadedCount,
  isLoading,
  isError,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onClearFilters,
  onPostSignedOut,
}: VolunteerRolesGridProps) {
  const { t } = useTranslation();
  // ENG-501: react-query also sets `isError` when only the next page failed.
  // The error panel is for a grid with nothing loaded; roles already loaded
  // stay, and the footer below retries the page that failed.
  // Broader than react-query's own flag: any failed read with roles loaded
  // counts, so a failed background refresh also reads as a failed next page.
  const isFetchNextPageError = isError && loadedCount > 0;
  const hasNothingLoadedError = isError && !isFetchNextPageError;

  return (
    <>
      {hasNothingLoadedError ? (
        <LoadErrorState onRetry={onRetry} />
      ) : !isLoading && visibleOpportunities.length === 0 ? (
        loadedCount === 0 ? (
          <EmptyState
            icon={<FiHeart />}
            title={t("marketing:volunteer.empty.noneTitle")}
            description={t("marketing:volunteer.empty.noneDescription")}
            action={{
              label: t("marketing:volunteer.empty.noneCta"),
              ...(onPostSignedOut
                ? { onClick: onPostSignedOut }
                : { to: routes.postVolunteer }),
            }}
          />
        ) : (
          <EmptyState
            icon={<FiHeart />}
            title={t("marketing:volunteer.empty.filteredTitle")}
            description={t("marketing:volunteer.empty.filteredDescription")}
            action={{
              label: t("marketing:volunteer.empty.clearCta"),
              onClick: onClearFilters,
            }}
          />
        )
      ) : (
        <div className={s.grid}>
          {isLoading
            ? Array.from({ length: 6 }).map((_unused, skeletonIndex) => (
                <VolunteerCardSkeleton key={skeletonIndex} />
              ))
            : visibleOpportunities.map((opportunity, index) => (
                <VolunteerRoleCard
                  key={opportunity.slug}
                  opportunity={opportunity}
                  delay={Math.min(index, 8) * 60}
                />
              ))}
        </div>
      )}

      {hasNextPage && !hasNothingLoadedError && (
        <LoadMoreFooter
          className={rolesStyles.footer}
          messageClassName={rolesStyles.loadMoreError}
          isFetchingNextPage={isFetchingNextPage}
          isFetchNextPageError={isFetchNextPageError}
          onLoadMore={onLoadMore}
          errorMessage={t("marketing:volunteer.loadMoreError")}
          label={t("marketing:volunteer.loadMoreCta")}
          loadingLabel={t("marketing:volunteer.loadingMore")}
        />
      )}
    </>
  );
}
