import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiChevronDown } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MemberProfile } from "./data/memberProfiles";
import { Section } from "./ProfileSections";
import {
  ACTIVITY_VISIBLE_COUNT,
  activityAgo,
  buildActivityTimeline,
  prepareActivityRows,
  type ActivityPeriod,
  type ActivityRowView,
  type ActivityTimelineNode,
  type ActivityTone,
} from "./profileActivity";
import styles from "./ProfileActivitySection.module.css";

const TONE_CLASS: Record<ActivityTone, string | undefined> = {
  persona: styles.tonePersona,
  community: styles.toneCommunity,
  event: styles.toneEvent,
  conversation: styles.toneConversation,
  writing: styles.toneWriting,
  neutral: styles.toneNeutral,
};

const PERIOD_KEYS: Record<ActivityPeriod, string> = {
  thisWeek: "members:content.activity.group.thisWeek",
  thisMonth: "members:content.activity.group.thisMonth",
  earlier: "members:content.activity.group.earlier",
};

/**
 * "Recent activity" as one timeline: period headings and rows strung on a
 * single rail, newest first, with repeats folded away (see
 * `prepareActivityRows`). The first few rows show; the rest open in place
 * under "Show N more".
 */
export function ActivitySection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  // True from the moment the fold starts opening until its exit animation
  // has finished, so the rail keeps running into the rows while they fold.
  const [isFoldPresent, setIsFoldPresent] = useState(false);
  const rows = useMemo(
    () => prepareActivityRows(profile.activity),
    [profile.activity],
  );
  const { visibleNodes, foldedNodes } = useMemo(
    () => buildActivityTimeline(rows, ACTIVITY_VISIBLE_COUNT),
    [rows],
  );
  if (rows.length === 0) return null;
  const foldedRowCount = foldedNodes.filter(
    (node) => node.type === "row",
  ).length;
  const hasFoldedRows = foldedRowCount > 0;
  return (
    <Section
      id="recent-activity"
      title={t("members:content.activity.title")}
      subtitle={t("members:content.activity.subtitle")}
    >
      <div className={styles.timeline}>
        <TimelineNodes
          nodes={visibleNodes}
          isRailStartHere
          isRailEndHere={!hasFoldedRows || !isFoldPresent}
        />
        {hasFoldedRows && (
          <Collapse
            isOpen={isExpanded}
            onExitComplete={() => setIsFoldPresent(false)}
          >
            <TimelineNodes nodes={foldedNodes} isRailEndHere />
          </Collapse>
        )}
        {hasFoldedRows && (
          <Button
            variant="quiet"
            size="sm"
            className={styles.foldToggle}
            aria-expanded={isExpanded}
            onClick={() => {
              if (!isExpanded) setIsFoldPresent(true);
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded
              ? t("members:content.activity.showLess")
              : t("members:content.activity.showMore", {
                  count: foldedRowCount,
                })}
            <FiChevronDown
              aria-hidden
              className={
                isExpanded
                  ? `${styles.foldChevron} ${styles.isFlipped}`
                  : styles.foldChevron
              }
            />
          </Button>
        )}
      </div>
    </Section>
  );
}

/** One stretch of the timeline: each period heading, then its rows as a
 *  list. The flags say whether the rail starts at this stretch's first node
 *  or ends at its last, so the line runs unbroken across the fold. */
function TimelineNodes({
  nodes,
  isRailStartHere = false,
  isRailEndHere = false,
}: {
  nodes: ActivityTimelineNode[];
  isRailStartHere?: boolean;
  isRailEndHere?: boolean;
}) {
  const { t } = useTranslation();
  const runs: (
    | { type: "period"; key: string; period: ActivityPeriod; index: number }
    | {
        type: "rows";
        key: string;
        rows: { row: ActivityRowView; index: number }[];
      }
  )[] = [];
  nodes.forEach((node, index) => {
    if (node.type === "period") {
      runs.push({ ...node, index });
      return;
    }
    const lastRun = runs[runs.length - 1];
    if (lastRun?.type === "rows") lastRun.rows.push({ row: node.row, index });
    else
      runs.push({
        type: "rows",
        key: node.key,
        rows: [{ row: node.row, index }],
      });
  });
  const railClass = (index: number) =>
    [
      index === 0 && isRailStartHere && styles.isRailStart,
      index === nodes.length - 1 && isRailEndHere && styles.isRailEnd,
    ]
      .filter(Boolean)
      .join(" ");
  return runs.map((run) =>
    run.type === "period" ? (
      <h3
        key={run.key}
        className={`${styles.periodLabel} ${railClass(run.index)}`}
      >
        {t(PERIOD_KEYS[run.period])}
      </h3>
    ) : (
      <ol key={run.key} className={styles.rowList}>
        {run.rows.map(({ row, index }) => (
          <li key={row.key} className={`${styles.rowItem} ${railClass(index)}`}>
            <ActivityRow row={row} />
          </li>
        ))}
      </ol>
    ),
  );
}

/**
 * One row. It links only when the backend gave it a destination, and it only
 * does that for a subject already public to the reader (a public event, a
 * forum thread, a public community or one of its posts, a published persona).
 * The backend re-checks that on every read, so a subject made private later
 * takes its whole row away. A row with no destination is still a true
 * statement, so it renders as plain text with no hover.
 */
function ActivityRow({ row }: { row: ActivityRowView }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const Icon = row.icon;
  const isQuotedExcerpt =
    row.item.action === "thread" || row.item.action === "communityPost";
  // A row with no verb line is one line tall, so its time and arrow drop to
  // the headline's baseline instead of the verb's.
  const rowClass = [styles.row, !row.verbKey && styles.isTitleOnly]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      <span className={`${styles.badge} ${TONE_CLASS[row.tone]}`} aria-hidden>
        <Icon />
      </span>
      <span className={styles.body}>
        {row.verbKey && <span className={styles.verb}>{t(row.verbKey)}</span>}
        <span className={styles.headline}>{row.headline}</span>
        {row.item.sub && (
          <span
            className={
              isQuotedExcerpt
                ? `${styles.excerpt} ${styles.isQuoted}`
                : styles.excerpt
            }
          >
            {row.item.sub}
          </span>
        )}
      </span>
      {row.occurredAtMs !== null && (
        <time
          className={styles.time}
          dateTime={new Date(row.occurredAtMs).toISOString()}
          title={fmt.date(row.occurredAtMs, {
            dateStyle: "long",
            timeStyle: "short",
          })}
        >
          {activityAgo(row.occurredAtMs, t, fmt)}
        </time>
      )}
      {row.item.to && <FiArrowRight className={styles.arrow} aria-hidden />}
    </>
  );
  if (!row.item.to) return <div className={rowClass}>{content}</div>;
  return (
    <Link to={row.item.to} className={`${rowClass} ${styles.isLinked}`}>
      {content}
    </Link>
  );
}
