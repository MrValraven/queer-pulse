import type { AdminRoadmapItemDTO } from "../../api/roadmapAdmin.types";
import type { TFunction } from "../../../../shared/i18n/types";
import { SAVED_VIEW_PREDICATES } from "../state/useRoadmapFilters";

const MS_PER_DAY = 86_400_000;

export interface CardAlert {
  message: string;
}

/**
 * The one alert strip a Board card shows, in priority order — blocked, then
 * waiting on an unfinished dependency, then stale (building, untouched 3+
 * weeks, not already explained by a block). Shares its "stale" definition
 * with the `stale` saved-view chip (`SAVED_VIEW_PREDICATES.stale`) rather
 * than recomputing it, so the two can never quietly disagree.
 */
export function getCardAlert(
  item: AdminRoadmapItemDTO,
  itemsById: Map<string, AdminRoadmapItemDTO>,
  t: TFunction,
): CardAlert | null {
  if (item.blockedBy) {
    return {
      message: t("admin:roadmap.board.alert.blocked", {
        reason: item.blockedWhy || item.blockedBy,
      }),
    };
  }

  if (item.deps.length > 0) {
    const [firstDepId, ...restDepIds] = item.deps;
    // `deps.length > 0` guarantees this, but array destructuring can't
    // carry that narrowing through to the element's type.
    if (firstDepId === undefined) return null;
    const firstDepName = itemsById.get(firstDepId)?.name ?? firstDepId;
    if (restDepIds.length > 0) {
      return {
        message: t("admin:roadmap.board.alert.waitingOnMore", {
          name: firstDepName,
          count: restDepIds.length,
        }),
      };
    }
    return {
      message: t("admin:roadmap.board.alert.waitingOn", { name: firstDepName }),
    };
  }

  if (SAVED_VIEW_PREDICATES.stale?.(item)) {
    const days = Math.floor(
      (Date.now() - new Date(item.updatedAt).getTime()) / MS_PER_DAY,
    );
    return { message: t("admin:roadmap.board.alert.staleUntouched", { days }) };
  }

  return null;
}
