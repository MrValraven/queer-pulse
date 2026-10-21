import { useId } from "react";
import { FiCheckSquare } from "react-icons/fi";
import {
  Button,
  Collapse,
  FilterChips,
  Select,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ReviewQueueOrder, ReviewSortOrder } from "./StudioReviewQueue";
import css from "./StudioFlagReview.module.css";

const SORT_LABEL_KEY: Record<ReviewSortOrder, string> = {
  oldest: "studio:flagReviewLive.queue.sortOldest",
  newest: "studio:flagReviewLive.queue.sortNewest",
  severity: "studio:flagReviewLive.queue.sortSeverity",
};

function isSortOrder(value: string | null): value is ReviewSortOrder {
  return value === "oldest" || value === "newest" || value === "severity";
}

/**
 * The bar above a review queue: Sort (oldest, newest, and severity where
 * the cards carry one), a filter row once the loaded cards file under more
 * than one value, and "Select reports" for the queues that take a bulk
 * dismiss. It shows only once the queue holds cards.
 */
export function StudioReviewQueueBar<Item>({
  order,
  totalCount,
  canSortBySeverity = false,
  filterLabelOf,
  filterGroupLabelKey,
  selectLabelKey,
  isSelecting = false,
  onStartSelecting,
}: {
  order: ReviewQueueOrder<Item>;
  totalCount: number;
  canSortBySeverity?: boolean;
  filterLabelOf?: (value: string) => string;
  filterGroupLabelKey?: string;
  selectLabelKey?: string;
  isSelecting?: boolean;
  onStartSelecting?: () => void;
}) {
  const { t } = useTranslation();
  const sortLabelId = useId();
  const sortOrders: ReviewSortOrder[] = canSortBySeverity
    ? ["oldest", "newest", "severity"]
    : ["oldest", "newest"];
  const hasFilter =
    filterLabelOf !== undefined && order.filterValues.length > 1;
  return (
    <div className={css.queueBar}>
      <div className={css.queueSort}>
        <span id={sortLabelId} className={css.queueLabel}>
          {t("studio:flagReviewLive.queue.sortLabel")}
        </span>
        <Select
          size="sm"
          labelledBy={sortLabelId}
          options={sortOrders.map((sortOrder) => ({
            value: sortOrder,
            label: t(SORT_LABEL_KEY[sortOrder]),
          }))}
          value={order.sortOrder}
          onChange={(value) => {
            if (isSortOrder(value)) order.setSortOrder(value);
          }}
        />
      </div>
      <Collapse isOpen={hasFilter}>
        <FilterChips
          size="touch"
          label={t(
            filterGroupLabelKey ?? "studio:flagReviewLive.queue.filterLabel",
          )}
          options={[
            {
              value: "all",
              label: t("studio:flagReviewLive.queue.filterAll"),
            },
            ...order.filterValues.map((value) => ({
              value,
              label: filterLabelOf?.(value) ?? value,
            })),
          ]}
          value={order.filter}
          onChange={order.setFilter}
        />
      </Collapse>
      <p className={css.queueCount} aria-live="polite">
        {t("studio:flagReviewLive.queue.showing", {
          shown: order.visibleItems.length,
          total: totalCount,
        })}
      </p>
      <Collapse isOpen={selectLabelKey !== undefined}>
        <Button
          variant="quiet"
          size="sm"
          aria-pressed={isSelecting}
          onClick={onStartSelecting}
        >
          <FiCheckSquare aria-hidden />{" "}
          {selectLabelKey ? t(selectLabelKey) : null}
        </Button>
      </Collapse>
    </div>
  );
}
