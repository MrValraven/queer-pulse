import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button, EmptyState, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import {
  ReportCard,
  BulkBar,
  EmergencyBand,
  SectionLabel,
  CaughtUpPanel,
  AppealCard,
  ResolvedRow,
} from "./AdminModerationCards";
import { BulkActionModal } from "./AdminModerationBulkModal";
import type { ModActionCode } from "./api/moderation.api";
import styles from "./AdminModerationPage.module.css";
import type { BulkVerb, useModerationQueue } from "./useModerationQueue";

type Queue = ReturnType<typeof useModerationQueue>;

/** Branded, retryable error state (audit P1-14): a failed live fetch must read
 *  as an outage, not a false "all caught up". Demo mode never errors. */
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

export function OpenPane({ q }: { q: Queue }) {
  const { t } = useTranslation();
  const { open, visible, emergencies, others, picked, leaving, oldest } = q;
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

  // Live mode fetches asynchronously — don't flash "all caught up" while loading.
  if (q.loading && open.length === 0) {
    return <div className={styles.pane} aria-busy="true" />;
  }

  // An outage must not read as "all caught up" — show a retryable error instead.
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
            {emergencies.map((r, i) => renderReport(r, i))}
          </EmergencyBand>
        </FadeIn>
      )}

      {others.length > 0 && (
        <>
          <SectionLabel>{t("admin:moderation.everythingElse")}</SectionLabel>
          {oldest && (
            <p className={styles.countNote}>
              {/* `oldest` is now a full localized relative-time phrase ("3
                  hours ago" / "há 3 horas") instead of a bare "3h", so it needs
                  a sentence that doesn't supply its own "ago" — the older
                  `countNote` key did. */}
              {t("admin:moderation.oldestNote", {
                count: visible.length,
                oldest,
              })}
            </p>
          )}
          <div className={styles.list}>
            {others.map((r, i) => renderReport(r, i))}
          </div>
        </>
      )}

      {visible.length === 0 && (
        <p className={styles.filterEmpty}>
          {t("admin:moderation.filterEmpty")}
        </p>
      )}

      {/* The queue is cursor-paginated: without this, everything past the
          backend's first page was unreachable while the header counted it. */}
      {q.hasMoreOpen && (
        <div className={styles.loadMoreRow}>
          <Button
            type="button"
            variant="ghost"
            onClick={q.loadMoreOpen}
            disabled={q.isLoadingMoreOpen}
          >
            {t(
              q.isLoadingMoreOpen
                ? "admin:moderation.loadingMore"
                : "admin:moderation.loadMore",
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export function AppealsPane({ q }: { q: Queue }) {
  const { t } = useTranslation();
  const { appeals, leaving } = q;

  if (q.isError && appeals.length === 0) {
    return <QueueErrorPane onRetry={q.refetch} />;
  }

  if (appeals.length === 0) {
    return (
      <div className={styles.pane}>
        <FadeIn>
          <CaughtUpPanel
            onBack={() => q.showToast(t("admin:moderation.backToast"), "info")}
            onReplay={q.resetAppeals}
          />
        </FadeIn>
      </div>
    );
  }

  return (
    <div className={styles.pane}>
      <p className={styles.appealsIntro}>
        <Translation
          i18nKey="admin:moderation.appealsIntro"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.list}>
        {appeals.map((a, i) => (
          <FadeIn key={a.id} delay={Math.min(i, 6) * 55}>
            <AppealCard
              appeal={a}
              leaving={leaving.has(a.id)}
              onOpen={q.setAppeal}
            />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

export function ResolvedPane({ q }: { q: Queue }) {
  const { t } = useTranslation();
  const { resolved } = q;

  // Live mode fetches asynchronously — hold the pane blank while it loads
  // rather than flashing an empty "nothing resolved" state.
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
        <p className={styles.filterEmpty}>
          {t("admin:moderation.resolvedEmpty")}
        </p>
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
