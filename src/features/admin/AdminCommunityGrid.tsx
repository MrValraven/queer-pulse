import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { spellNumber } from "../../shared/i18n/numberWords";
import { AdminPageHeader, AdminAvatar } from "./ui";
import { useAdminCommunities } from "./api/useAdminCommunities";
import { AdminCommunitiesEmpty } from "./AdminCommunitiesEmpty";
import { healthColor, type Community } from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

export function AdminCommunityGrid({
  onOpen,
  onHealth,
}: {
  onOpen: (slug: string) => void;
  onHealth: (community: Community) => void;
}) {
  const { data, isLoading, isError } = useAdminCommunities();
  const communityList = data?.communities;
  const { t, language } = useTranslation();

  const communityCount = communityList?.length ?? 0;
  const countKnown = !isLoading && !isError;

  const header = (
    <FadeIn>
      <AdminPageHeader
        eyebrow={t("admin:communities.grid.eyebrow")}
        title={
          <>
            {countKnown
              ? t("admin:communities.grid.titleLine1", {
                  count: communityCount,
                  spelled: spellNumber(communityCount, language),
                })
              : t("admin:communities.grid.titleLine1Unknown")}
            <br />
            <Translation
              i18nKey="admin:communities.grid.titleLine2"
              components={{ em: <em /> }}
            />
          </>
        }
        sub={t("admin:communities.grid.sub")}
      />
    </FadeIn>
  );

  if (isLoading) {
    return (
      <>
        {header}
        <div className={styles.grid}>
          {[0, 1, 2].map((placeholderIndex) => (
            <div className={styles.card} key={placeholderIndex}>
              <SkeletonLine width="55%" height={18} />
              <SkeletonLine width="100%" height={48} />
              <SkeletonLine width="80%" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        {header}
        <p className={styles.loadError}>
          {t("admin:communities.grid.loadError")}
        </p>
      </>
    );
  }

  if (!communityList || communityList.length === 0) {
    return (
      <>
        {header}
        <AdminCommunitiesEmpty />
      </>
    );
  }

  return (
    <>
      {header}
      {data?.truncated && (
        <p className={styles.truncatedNotice}>
          {t("admin:communities.grid.truncatedNotice")}
        </p>
      )}
      <div className={styles.grid}>
        {communityList.map((community, communityIndex) => (
          <FadeIn key={community.slug} delay={Math.min(communityIndex, 8) * 60}>
            <HealthCard
              community={community}
              onOpen={() => onOpen(community.slug)}
              onHealth={() => onHealth(community)}
            />
          </FadeIn>
        ))}
      </div>
    </>
  );
}

function HealthCard({
  community,
  onOpen,
  onHealth,
}: {
  community: Community;
  onOpen: () => void;
  onHealth: () => void;
}) {
  const { t } = useTranslation();
  const color = healthColor(community.health);

  return (
    <button type="button" className={styles.card} onClick={onOpen}>
      <div className={styles.cardHead}>
        <AdminAvatar
          initials={community.initials}
          tone={community.tone}
          size="md"
        />
        <div className={styles.cardMeta}>
          <div className={styles.cardName}>{community.name}</div>
          <div className={styles.cardTag}>
            {community.tag}
            {community.support && (
              <span className={styles.cardTagWarn}>
                {" "}
                {t("admin:communities.grid.needsHand")}
              </span>
            )}
          </div>
        </div>
        <span
          role="button"
          tabIndex={0}
          className={styles.scoreBtn}
          style={{ color }}
          aria-label={t("admin:communities.grid.healthAriaLabel", {
            score: community.health,
          })}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onHealth();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              onHealth();
            }
          }}
        >
          {community.health}
        </span>
      </div>

      <Sparkline points={community.spark} color={color} />

      <div className={styles.cardStats}>
        <Stat
          label={t("admin:communities.grid.stat.members")}
          value={community.members}
        />
        <Stat
          label={t("admin:communities.grid.stat.activity")}
          value={community.activity}
        />
        <Stat
          label={t("admin:communities.grid.stat.openReports")}
          value={String(community.reports)}
          tone={community.reports > 0 ? "coral" : "jade"}
        />
      </div>
    </button>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "coral" | "jade";
}) {
  return (
    <div className={styles.cardStat}>
      <span
        className={styles.cardStatVal}
        style={
          tone
            ? { color: tone === "coral" ? "var(--accent-ink)" : "var(--jade)" }
            : undefined
        }
      >
        {value}
      </span>
      <span className={styles.cardStatLabel}>{label}</span>
    </div>
  );
}

// ── Inline sparkline (area + line) ──────────────────────────────────────────

const SPARK_WIDTH = 220;
const SPARK_HEIGHT = 48;
const SPARK_PADDING = 4;

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const { t } = useTranslation();
  const minimumValue = Math.min(...points);
  const maximumValue = Math.max(...points);
  const valueSpan = maximumValue - minimumValue || 1;
  const pointCount = points.length;
  const pointX = (pointIndex: number) =>
    SPARK_PADDING +
    (pointIndex * (SPARK_WIDTH - SPARK_PADDING * 2)) / (pointCount - 1);
  const pointY = (value: number) =>
    SPARK_PADDING +
    (SPARK_HEIGHT - SPARK_PADDING * 2) *
      (1 - (value - minimumValue) / valueSpan);

  const coordinates = points.map((value, pointIndex): [number, number] => [
    pointX(pointIndex),
    pointY(value),
  ]);
  const linePath = coordinates
    .map(
      ([coordinateX, coordinateY], pointIndex) =>
        `${pointIndex === 0 ? "M" : "L"}${coordinateX.toFixed(1)} ${coordinateY.toFixed(1)}`,
    )
    .join(" ");
  const areaPath = `${linePath} L${coordinates[pointCount - 1]![0].toFixed(1)} ${SPARK_HEIGHT - SPARK_PADDING} L${coordinates[0]![0].toFixed(1)} ${SPARK_HEIGHT - SPARK_PADDING} Z`;
  const lastPoint = coordinates[pointCount - 1]!;

  return (
    <svg
      className={styles.spark}
      viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
      width="100%"
      height={SPARK_HEIGHT}
      preserveAspectRatio="none"
      role="img"
      aria-label={t("admin:communities.grid.sparklineAriaLabel", {
        value: points[pointCount - 1] ?? 0,
      })}
    >
      <path d={areaPath} fill={color} opacity={0.1} />
      <path
        className={styles.sparkLine}
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
      <circle cx={lastPoint[0]} cy={lastPoint[1]} r={2.6} fill={color} />
    </svg>
  );
}
