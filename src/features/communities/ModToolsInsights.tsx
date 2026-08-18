import { EmptyState, SkeletonLine, StatGrid, StatTile } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useCommunityInsights } from "./api/useCommunityInsights";
import detail from "./CommunityDetailPage.module.css";

/** A single stat's value: a formatted, tabular-figures number, or a skeleton
 *  while the fetch is in flight. */
function StatValue({
  loading,
  value,
}: {
  loading: boolean;
  value: number | undefined;
}) {
  const fmt = useFormat();
  if (loading) {
    return <SkeletonLine height={28} width="55%" style={{ margin: "2px 0 4px" }} />;
  }
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {fmt.number(value ?? 0)}
    </span>
  );
}

/**
 * A community owner/mod's compact aggregate-stats panel — member growth
 * (this week/this month) and post activity (total, this week, active
 * authors) from `GET /communities/:slug/insights`. Legitimate aggregate-count
 * reporting for a community's own leadership, not individual behavior
 * tracking (see `useCommunityInsights`'s doc comment). Deliberately plain
 * labeled numbers, not a chart — six counts don't need one.
 */
export function ModToolsInsights({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useCommunityInsights(slug);

  return (
    <div style={{ marginBottom: 32 }}>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.insights.label")}
      </div>
      {isError ? (
        <EmptyState
          compact
          title={t("communities:detail.modtools.insights.error.title")}
          description={t("communities:detail.modtools.insights.error.description")}
          action={{
            label: t("communities:detail.modtools.insights.error.retryCta"),
            onClick: refetch,
          }}
        />
      ) : (
        <StatGrid columns={3}>
          <StatTile
            label={t("communities:detail.modtools.insights.memberCount")}
            value={<StatValue loading={isLoading} value={data?.memberCount} />}
          />
          <StatTile
            label={t("communities:detail.modtools.insights.newThisWeek")}
            value={<StatValue loading={isLoading} value={data?.newMembersThisWeek} />}
          />
          <StatTile
            label={t("communities:detail.modtools.insights.newThisMonth")}
            value={<StatValue loading={isLoading} value={data?.newMembersThisMonth} />}
          />
          <StatTile
            label={t("communities:detail.modtools.insights.postCount")}
            value={<StatValue loading={isLoading} value={data?.postCount} />}
          />
          <StatTile
            label={t("communities:detail.modtools.insights.postsThisWeek")}
            value={<StatValue loading={isLoading} value={data?.postsThisWeek} />}
          />
          <StatTile
            label={t("communities:detail.modtools.insights.activeMembers")}
            value={<StatValue loading={isLoading} value={data?.activeMemberCount7d} />}
          />
        </StatGrid>
      )}
    </div>
  );
}
