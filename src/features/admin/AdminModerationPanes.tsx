import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import {
  ReportCard,
  BulkBar,
  BulkSuspendModal,
  EmergencyBand,
  SectionLabel,
  CaughtUpPanel,
  AppealCard,
  ResolvedRow,
} from "./AdminModerationCards";
import styles from "./AdminModerationPage.module.css";
import type { useModerationQueue } from "./useModerationQueue";

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
  const [suspending, setSuspending] = useState(false);

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
          onSpam={() => q.bulkAct("removedAsSpam", "remove_content")}
          onReassign={() => q.bulkAct("reassigned", "escalate")}
          onWarn={() => q.bulkAct("warned", "warn")}
          onSuspendClick={() => setSuspending(true)}
          onBan={() => q.bulkAct("banned", "ban")}
          onCancel={q.clearPicked}
        />
      )}

      {suspending && (
        <BulkSuspendModal
          count={picked.size}
          onClose={() => setSuspending(false)}
          onConfirm={(duration) => {
            setSuspending(false);
            q.bulkAct("suspended", "suspend", duration);
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
              {t("admin:moderation.countNote", {
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
