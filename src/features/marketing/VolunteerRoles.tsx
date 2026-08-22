import { FiHeart } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { VolunteerOpportunity } from "./volunteerOpportunities.types";
import { FILTERS } from "./volunteerPage.data";
import { VolunteerCardSkeleton, VolunteerRoleCard } from "./VolunteerRoleCard";
import s from "./VolunteerPage.module.css";

export interface VolunteerRolesProps {
  /** Active chip id: "all", a commitment level, or a cause. */
  filter: string;
  onFilterChange: (filter: string) => void;
  /** Opportunities left after the client-side chip filter. */
  visibleOpportunities: VolunteerOpportunity[];
  /** How many were loaded before filtering, so an empty grid can tell "nothing
   *  posted yet" apart from "nothing matches this chip". */
  loadedCount: number;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

/** Filter chips + the open-roles grid, with its empty states and pagination. */
export function VolunteerRoles({
  filter,
  onFilterChange,
  visibleOpportunities,
  loadedCount,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: VolunteerRolesProps) {
  const { t } = useTranslation();

  return (
    <section className={s.body}>
      <div className="wrap">
        <div className={s.filters}>
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f.f}
              className={[s.chip, filter === f.f && s.chipOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onFilterChange(f.f)}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>

        {!isLoading && visibleOpportunities.length === 0 ? (
          loadedCount === 0 ? (
            <EmptyState
              icon={<FiHeart />}
              title={t("marketing:volunteer.empty.noneTitle")}
              description={t("marketing:volunteer.empty.noneDescription")}
              action={{
                label: t("marketing:volunteer.empty.noneCta"),
                to: routes.postVolunteer,
              }}
            />
          ) : (
            <EmptyState
              icon={<FiHeart />}
              title={t("marketing:volunteer.empty.filteredTitle")}
              description={t("marketing:volunteer.empty.filteredDescription")}
              action={{
                label: t("marketing:volunteer.empty.clearCta"),
                onClick: () => onFilterChange("all"),
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

        {hasNextPage && (
          <div className={s.loadMore}>
            <Button
              type="button"
              variant="ghost"
              disabled={isFetchingNextPage}
              onClick={onLoadMore}
            >
              {isFetchingNextPage
                ? t("marketing:volunteer.loadingMore")
                : t("marketing:volunteer.loadMoreCta")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
