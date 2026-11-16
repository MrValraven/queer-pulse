import { useState } from "react";
import { FiAlertTriangle, FiClock } from "react-icons/fi";
import { Button, EmptyState, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminEmptyState } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { ReportCard, ClusterRow } from "./AdminModerationCards";
import {
  BulkBar,
  EmergencyBand,
  SectionLabel,
  CaughtUpPanel,
} from "./AdminModerationQueueChrome";
import { AppealCard, ResolvedRow } from "./AdminModerationOutcomeCards";
import { RatificationCard, type RatifyDecision } from "./AdminRatificationCard";
import { RatificationConfirmModal } from "./AdminRatificationModal";
import type { Ratification } from "./adminModeration.data";
import { BulkActionModal } from "./AdminModerationBulkModal";
import type { QueueGroup } from "./moderationQueue.helpers";
import type { ModActionCode } from "./api/moderation.api";
import styles from "./AdminModerationPage.module.css";
import type { BulkVerb, useModerationQueue } from "./useModerationQueue";
import { ModerationQueueLayout } from "./AdminModerationQueueLayout";
import { AppealFilters } from "./AdminModerationAppealFilters";

type Queue = ReturnType<typeof useModerationQueue>;

/** Branded, retryable error state (audit P1-14): a failed live fetch must read
 *  as an outage, so a false "all caught up" can never show. Demo mode cannot
 *  fail. */
function QueueErrorPane({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.pane}>
      <FadeIn>
        <EmptyState
          icon={<FiAlertTriangle />}
          title={t("common:error.title")}
          description={t("common:error.description")}
          action={{ label: t("common:error.retry"), onClick: onRetry }}
        />
      </FadeIn>
    </div>
  );
}

/** The next page of a cursor-paginated queue. */
function LoadMoreRow({
  onLoadMore,
  isLoading,
  size = "md",
}: {
  onLoadMore: () => void;
  isLoading: boolean;
  size?: "sm" | "md";
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.loadMoreRow}>
      <Button
        variant="ghost"
        size={size}
        onClick={onLoadMore}
        disabled={isLoading}
      >
        {t(
          isLoading
            ? "admin:moderation.loadingMore"
            : "admin:moderation.loadMore",
        )}
      </Button>
    </div>
  );
}

export function OpenPane({ q }: { q: Queue }) {
  const { t } = useTranslation();
  const {
    open,
    visible,
    emergencies,
    emergencyGroups,
    otherGroups,
    picked,
    leaving,
    oldest,
  } = q;
  // TS-06: which piles are open. Collapsed by default: the header already
  // carries the counts a moderator triages on, and thirty expanded rows is the
  // flat list this replaced.
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(
    new Set(),
  );
  const toggleCluster = (key: string) =>
    setExpandedClusters((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  // Ban / warn / remove-content / suspend all pass through the confirm modal,
  // which collects the reason code and the member-facing note the single-report
  // drawer already requires. Dismiss and escalate stay one-click: neither
  // sanctions the member.
  const [confirming, setConfirming] = useState<{
    verb: BulkVerb;
    action: ModActionCode;
  } | null>(null);

  const renderReport = (r: (typeof open)[number], i: number) => (
    <FadeIn key={r.id} delay={Math.min(i, 6) * 55}>
      <ReportCard
        report={r}
        leaving={leaving.has(r.id)}
        selected={picked.has(r.id)}
        onToggle={q.togglePick}
        onOpen={q.openReport}
        onViewHistory={q.viewSubjectHistory}
      />
    </FadeIn>
  );

  // TS-06: a subject with several open reports renders as one expandable
  // cluster carrying its real counts; a subject with a single report keeps its
  // plain row, so the queue does not grow a badge around every report.
  const renderGroup = (group: QueueGroup, groupIndex: number) =>
    group.cluster ? (
      <ClusterRow
        key={group.key}
        cluster={group.cluster}
        isExpanded={expandedClusters.has(group.key)}
        onToggleExpanded={() => toggleCluster(group.key)}
        onSelectAll={() => q.pickCluster(group.cluster?.reportIds ?? [])}
        isFullySelected={group.cluster.reportIds.every((id) => picked.has(id))}
        loadedCount={group.reports.length}
      >
        {group.reports.map((r, i) => renderReport(r, i))}
      </ClusterRow>
    ) : (
      renderReport(group.reports[0]!, groupIndex)
    );

  // Live mode fetches asynchronously, so hold "all caught up" back while loading.
  if (q.loading && open.length === 0) {
    return <div className={styles.pane} aria-busy="true" />;
  }

  // An outage must not read as "all caught up": show a retryable error.
  if (q.isError && open.length === 0) {
    return <QueueErrorPane onRetry={q.refetch} />;
  }

  if (open.length === 0) {
    return (
      <div className={styles.pane}>
        <FadeIn>
          <CaughtUpPanel
            onBack={() => q.showToast(t("admin:moderation.backToast"), "info")}
            onReplay={q.replayOpen}
          />
        </FadeIn>
      </div>
    );
  }

  return (
    <div className={styles.pane}>
      <ModerationQueueLayout>
        {picked.size > 0 && (
          <BulkBar
            count={picked.size}
            onDismiss={() => q.bulkAct("dismissed", "dismiss")}
            onSpam={() =>
              setConfirming({ verb: "removedAsSpam", action: "remove_content" })
            }
            onEscalate={() => q.bulkAct("escalated", "escalate")}
            onWarn={() => setConfirming({ verb: "warned", action: "warn" })}
            onSuspendClick={() =>
              setConfirming({ verb: "suspended", action: "suspend" })
            }
            onBan={() => setConfirming({ verb: "banned", action: "ban" })}
            onCancel={q.clearPicked}
          />
        )}

        {confirming && (
          <BulkActionModal
            count={picked.size}
            action={confirming.action}
            onClose={() => setConfirming(null)}
            onConfirm={(decision) => {
              const pending = confirming;
              setConfirming(null);
              q.bulkAct(pending.verb, pending.action, decision);
            }}
          />
        )}

        {emergencies.length > 0 && (
          <FadeIn>
            <EmergencyBand
              count={emergencies.length}
              sub={t("admin:moderation.emergency.sub")}
            >
              {emergencyGroups.map((group, groupIndex) =>
                renderGroup(group, groupIndex),
              )}
            </EmergencyBand>
          </FadeIn>
        )}

        {otherGroups.length > 0 && (
          <>
            <SectionLabel>{t("admin:moderation.everythingElse")}</SectionLabel>
            {oldest && (
              <p className={styles.countNote}>
                {/* `oldest` is a full localized relative-time phrase ("3
                  hours ago" / "há 3 horas"), so it needs a sentence that
                  leaves out its own "ago". The older `countNote` key carried
                  one, for a bare "3h". */}
                {t("admin:moderation.oldestNote", {
                  count: visible.length,
                  oldest,
                })}
              </p>
            )}
            <div className={styles.list}>
              {otherGroups.map((group, groupIndex) =>
                renderGroup(group, groupIndex),
              )}
            </div>
          </>
        )}

        {visible.length === 0 && (
          <AdminEmptyState
            size="inline"
            title={t("admin:moderation.filterEmpty")}
          />
        )}

        {/* The queue is cursor-paginated: without this, everything past the
          backend's first page was unreachable while the header counted it. */}
        {q.hasMoreOpen && (
          <LoadMoreRow
            onLoadMore={q.loadMoreOpen}
            isLoading={q.isLoadingMoreOpen}
          />
        )}
      </ModerationQueueLayout>
    </div>
  );
}

/**
 * The appeals queue (TS-11).
 *
 * Two tabs, because a queue with a deadline and a history are different jobs:
 * `awaiting` is ordered by the Code of Conduct's published 7-day decision
 * window, soonest first, so the appeal the platform is closest to being late on
 * is the first thing a moderator sees. `decided` is a history view, newest
 * first. Before this they were one list, newest first, with the decided ones
 * mixed in, which put the most urgent appeal at the BOTTOM.
 *
 * The overdue toggle is a server-side filter, for the same reason the reports
 * queue's is: it has to narrow the whole queue, past whatever landed on the
 * page.
 */
export function AppealsPane({ q }: { q: Queue }) {
  const { t } = useTranslation();
  const { appeals, leaving, appealTab } = q;

  if (q.isAppealsError && appeals.length === 0) {
    return <QueueErrorPane onRetry={q.refetchAppeals} />;
  }

  const header = (
    <>
      <p className={styles.appealsIntro}>
        <Translation
          i18nKey="admin:moderation.appealsIntro"
          components={{ em: <em /> }}
        />
      </p>
      <p className={styles.appealsWindow}>
        <FiClock aria-hidden /> {t("admin:moderation.appeals.windowNote")}
      </p>
      <AppealFilters q={q} />
    </>
  );

  if (appeals.length === 0) {
    return (
      <div className={styles.pane}>
        <ModerationQueueLayout>
          {header}
          {/* An empty AWAITING tab genuinely is "caught up" and keeps the
            celebratory panel. An empty decided tab or an empty overdue filter
            is just an empty list, and saying "all caught up" there would be
            congratulating the team for a filter matching nothing. */}
          {appealTab === "awaiting" && !q.isAppealOverdueOnly ? (
            <FadeIn>
              <CaughtUpPanel
                onBack={() =>
                  q.showToast(t("admin:moderation.backToast"), "info")
                }
                onReplay={q.resetAppeals}
              />
            </FadeIn>
          ) : (
            <AdminEmptyState
              size="inline"
              title={t(
                q.isAppealOverdueOnly
                  ? "admin:moderation.appeals.noOverdue"
                  : "admin:moderation.appeals.noDecided",
              )}
            />
          )}
        </ModerationQueueLayout>
      </div>
    );
  }

  return (
    <div className={styles.pane}>
      <ModerationQueueLayout>
        {header}
        <div className={styles.list}>
          {appeals.map((appeal, index) => (
            <FadeIn key={appeal.id} delay={Math.min(index, 6) * 55}>
              <AppealCard
                appeal={appeal}
                leaving={leaving.has(appeal.id)}
                onOpen={q.setAppeal}
              />
            </FadeIn>
          ))}
        </div>
        {q.hasMoreAppeals && (
          <LoadMoreRow
            onLoadMore={q.loadMoreAppeals}
            isLoading={q.isLoadingMoreAppeals}
            size="sm"
          />
        )}
      </ModerationQueueLayout>
    </div>
  );
}

/**
 * The permanent bans waiting on a second moderator (TS-12).
 *
 * This pane is the reason the whole feature is more than a database column: a
 * hold nobody can find is a hold nobody ratifies, and every unratified hold
 * lapses, which would quietly turn "permanent ban" into "72-hour suspension"
 * across the platform. So the queue leads with the deadline and quotes the
 * first moderator's reason in full.
 */
export function RatificationPane({ q }: { q: Queue }) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState<{
    ratification: Ratification;
    decision: RatifyDecision;
  } | null>(null);

  if (q.isRatificationsError && q.ratifications.length === 0) {
    return <QueueErrorPane onRetry={q.refetchRatifications} />;
  }

  return (
    <div className={styles.pane}>
      <p className={styles.appealsIntro}>
        <Translation
          i18nKey="admin:moderation.ratification.intro"
          components={{ em: <em /> }}
        />
      </p>

      {q.ratifications.length === 0 ? (
        <AdminEmptyState
          size="inline"
          title={t("admin:moderation.ratification.empty")}
        />
      ) : (
        <div className={styles.list}>
          {q.ratifications.map((ratification, index) => (
            <FadeIn key={ratification.id} delay={Math.min(index, 6) * 55}>
              <RatificationCard
                ratification={ratification}
                isOwnRequest={
                  !!q.currentUserId &&
                  ratification.requestedById === q.currentUserId
                }
                onDecide={(row, decision) =>
                  setConfirming({ ratification: row, decision })
                }
              />
            </FadeIn>
          ))}
        </div>
      )}

      {confirming && (
        <RatificationConfirmModal
          ratification={confirming.ratification}
          decision={confirming.decision}
          onClose={() => setConfirming(null)}
          onConfirm={(note) => {
            q.decideRatification.mutate(
              {
                id: confirming.ratification.id,
                decision: confirming.decision,
                note: note || undefined,
              },
              {
                onSuccess: () => {
                  q.refetchRatifications();
                  q.showToast(
                    t(
                      confirming.decision === "ratify"
                        ? "admin:moderation.ratification.confirmedToast"
                        : "admin:moderation.ratification.declinedToast",
                      { name: confirming.ratification.targetName },
                    ),
                    "success",
                  );
                },
                onError: () =>
                  q.showToast(
                    t("admin:moderation.ratification.errorToast"),
                    "error",
                  ),
              },
            );
            setConfirming(null);
          }}
        />
      )}
    </div>
  );
}

export function ResolvedPane({ q }: { q: Queue }) {
  const { t } = useTranslation();
  const { resolved } = q;

  // Live mode fetches asynchronously, so the pane stays blank while it loads
  // and an empty "nothing resolved" state never flashes.
  if (q.loading && resolved.length === 0) {
    return <div className={styles.pane} aria-busy="true" />;
  }

  if (q.isError && resolved.length === 0) {
    return <QueueErrorPane onRetry={q.refetch} />;
  }

  return (
    <div className={styles.pane}>
      <SectionLabel>{t("admin:moderation.resolvedSection")}</SectionLabel>
      {resolved.length === 0 ? (
        <AdminEmptyState
          size="inline"
          title={t("admin:moderation.resolvedEmpty")}
        />
      ) : (
        <div className={styles.list}>
          {resolved.map((item, i) => (
            <FadeIn key={item.id} delay={Math.min(i, 6) * 55}>
              <ResolvedRow item={item} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
