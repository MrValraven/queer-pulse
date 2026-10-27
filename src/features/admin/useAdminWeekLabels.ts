import { useTranslation } from "../../shared/i18n/useTranslation";

/** Axis and tooltip wording for a week id from the reports-by-type data
 *  ("this", "last", or a bare negative offset such as "-3"). */
export function useAdminWeekLabels() {
  const { t } = useTranslation();
  const weeksAgo = (week: string) => Math.abs(Number.parseInt(week, 10));
  return {
    /** Short text under a column: "this", "last", "4w". */
    axisLabel: (week: string): string => {
      if (week === "this") return t("admin:dashboard.charts.week.this");
      if (week === "last") return t("admin:dashboard.charts.week.last");
      return t("admin:dashboard.charts.week.shortAgo", {
        count: weeksAgo(week),
      });
    },
    /** Full phrase for the tooltip: "This week", "4 weeks ago". */
    longLabel: (week: string): string => {
      if (week === "this") return t("admin:dashboard.charts.week.longThis");
      if (week === "last") return t("admin:dashboard.charts.week.longLast");
      return t("admin:dashboard.charts.week.longAgo", {
        count: weeksAgo(week),
      });
    },
  };
}
