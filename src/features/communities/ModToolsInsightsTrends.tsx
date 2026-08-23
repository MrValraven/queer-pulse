import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { CommunityInsightsTrendDTO } from "./api/communityInsightsTrend.api";
import { summarizeTrend, type TrendDirection } from "./insightsTrend";
import { InsightsSparkline, type SparklineTone } from "./InsightsSparkline";
import styles from "./InsightsSparkline.module.css";

const CAPTION_KEY: Record<TrendDirection, string> = {
  rising: "communities:detail.modtools.insights.trend.rising",
  steady: "communities:detail.modtools.insights.trend.steady",
  falling: "communities:detail.modtools.insights.trend.falling",
  quiet: "communities:detail.modtools.insights.trend.quiet",
};

/** One series' worth of wiring: summarize, then say the direction in words. */
function TrendCard({
  points,
  labelKey,
  tone,
}: {
  points: CommunityInsightsTrendDTO["newMembersByWeek"] | undefined;
  labelKey: string;
  tone: SparklineTone;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const summary = summarizeTrend(points);
  const halfLength = Math.floor(summary.values.length / 2);

  return (
    <InsightsSparkline
      tone={tone}
      values={summary.values}
      label={t(labelKey)}
      caption={t(CAPTION_KEY[summary.direction], {
        recent: fmt.number(summary.recentTotal),
        previous: fmt.number(summary.previousTotal),
        weeks: fmt.number(halfLength),
        total: fmt.number(summary.values.length),
      })}
    />
  );
}

/**
 * The two aggregate trend lines under the insight tiles: members joining per
 * week and posts per week, over the last twelve weeks.
 *
 * The tiles answer "how many"; a single "new this week" number carries no
 * direction, and "is this community growing or fading" is the question an
 * owner actually opens this panel with. Twelve points, so the shape is drawn
 * as inline SVG and the direction is also stated in a sentence beside it.
 *
 * Both series are weekly volumes for the whole community. No individual
 * member's activity is surfaced here, which is the same line the backend
 * endpoint draws for itself.
 */
export function ModToolsInsightsTrends({
  data,
  isLoading,
}: {
  data: CommunityInsightsTrendDTO | null;
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.pair} aria-busy="true">
        <SkeletonLine height={96} />
        <SkeletonLine height={96} />
      </div>
    );
  }
  if (!data) return null;

  return (
    <>
      <div className={styles.pair}>
        <TrendCard
          tone="members"
          points={data.newMembersByWeek}
          labelKey="communities:detail.modtools.insights.trend.membersLabel"
        />
        <TrendCard
          tone="posts"
          points={data.postsByWeek}
          labelKey="communities:detail.modtools.insights.trend.postsLabel"
        />
      </div>
      <p className={styles.caption} style={{ marginTop: 10 }}>
        {t("communities:detail.modtools.insights.trend.note")}
      </p>
    </>
  );
}
