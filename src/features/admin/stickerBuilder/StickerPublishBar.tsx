import { useEffect, useId, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronDown,
  FiInfo,
  FiStopCircle,
  FiX,
} from "react-icons/fi";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import { Button, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import type {
  FlagPlanEntry,
  PublishFailureReason,
  PublishMode,
  StickerPublishRun,
  StickerPublishSummary,
} from "./stickerBuilder.types";
import { StickerPublishModeControl } from "./StickerPublishModeControl";
import {
  PackStatusNote,
  StickerPublishReviewDialog,
} from "./StickerPublishReviewDialog";
import styles from "./StickerPublishBar.module.css";

type BarPhase = "idle" | "running" | "finished" | "cancelled";

function phaseOf(
  run: StickerPublishRun | null,
  summary: StickerPublishSummary,
): BarPhase {
  if (!run) return "idle";
  if (run.isRunning) return "running";
  return summary.cancelledCount > 0 ? "cancelled" : "finished";
}

/** The CTA names exactly what the run will do, and to which pack. */
function publishCtaLabel(
  t: TFunction,
  plan: FlagPlanEntry[],
  packName: string | null,
): string {
  const addCount = plan.filter((entry) => entry.action === "add").length;
  const replaceCount = plan.filter(
    (entry) => entry.action === "replace",
  ).length;
  if (!packName || addCount + replaceCount === 0) {
    return t("admin:stickerPacks.publish.cta.idle");
  }
  if (addCount > 0 && replaceCount > 0) {
    return t("admin:stickerPacks.publish.cta.addAndUpdate", {
      added: addCount,
      replaced: replaceCount,
      pack: packName,
    });
  }
  return addCount > 0
    ? t("admin:stickerPacks.publish.cta.add", {
        count: addCount,
        pack: packName,
      })
    : t("admin:stickerPacks.publish.cta.update", {
        count: replaceCount,
        pack: packName,
      });
}

/** Why the CTA is off, said out loud so nobody has to hover to find out. */
function blockedReasonOf(
  t: TFunction,
  pack: AdminStickerPackResponse | null,
  plan: FlagPlanEntry[],
): string | null {
  if (!pack) return t("admin:stickerPacks.publish.blocked.noPack");
  if (plan.length === 0) return t("admin:stickerPacks.publish.blocked.noFlags");
  if (plan.every((entry) => entry.action === "skip")) {
    return t("admin:stickerPacks.publish.blocked.allSkipped");
  }
  return null;
}

function resultSentence(
  t: TFunction,
  summary: StickerPublishSummary,
  packName: string,
): string {
  const { addedCount, replacedCount } = summary;
  if (addedCount > 0 && replacedCount > 0) {
    return t("admin:stickerPacks.publish.result.addedAndUpdated", {
      added: addedCount,
      replaced: replacedCount,
      pack: packName,
    });
  }
  if (addedCount > 0) {
    return t("admin:stickerPacks.publish.result.added", {
      count: addedCount,
      pack: packName,
    });
  }
  if (replacedCount > 0) {
    return t("admin:stickerPacks.publish.result.updated", {
      count: replacedCount,
      pack: packName,
    });
  }
  return t("admin:stickerPacks.publish.result.none", { pack: packName });
}

/** The status line's content for a live run: "Adding 4 of 11" plus the flag
 *  in flight. When the admin has moved to another pack, the line names the
 *  pack the run writes to, so the progress is never read as this pack's. */
function RunningLine({
  run,
  summary,
  isOtherPack,
}: {
  run: StickerPublishRun;
  summary: StickerPublishSummary;
  isOtherPack: boolean;
}) {
  const { t } = useTranslation();
  const currentFlagId = run.flagIds.find(
    (flagId) => run.stateByFlag[flagId]?.status === "running",
  );
  const processedCount = summary.doneCount + summary.failedCount;
  const currentNumber = Math.min(processedCount + 1, summary.totalCount);
  const isUpdating =
    currentFlagId !== undefined &&
    run.actionByFlag[currentFlagId] === "replace";
  const runningKey = isOtherPack
    ? isUpdating
      ? "updateInPack"
      : "addToPack"
    : isUpdating
      ? "update"
      : "add";
  return (
    <>
      {t(`admin:stickerPacks.publish.running.${runningKey}`, {
        current: currentNumber,
        total: summary.totalCount,
        pack: run.packName,
      })}
      {currentFlagId && (
        <span className={styles.currentFlag}>
          {" "}
          {t(`cards:flag.${currentFlagId}`)}
        </span>
      )}
    </>
  );
}

const FAILURE_REASONS: readonly PublishFailureReason[] = [
  "conflict",
  "rate-limit",
  "upload",
  "unknown",
];

/** Failed flags grouped by reason, so a rate limit that sank six flags reads
 *  as one line naming all six. */
function FailureList({
  run,
  failedCount,
}: {
  run: StickerPublishRun;
  failedCount: number;
}) {
  const { t } = useTranslation();
  const groupsId = useId();
  // Phones only: the list folds behind a disclosure so the dock stays short.
  // Wider screens always show it, and the toggle is hidden there by CSS.
  const [isExpanded, setIsExpanded] = useState(false);
  const groups = FAILURE_REASONS.map((reason) => ({
    reason,
    flagIds: run.flagIds.filter((flagId) => {
      const flagState = run.stateByFlag[flagId];
      return (
        flagState?.status === "failed" &&
        (flagState.failureReason ?? "unknown") === reason
      );
    }),
  })).filter((group) => group.flagIds.length > 0);
  // Only the failure message is the alert. The disclosure toggle and the list
  // sit outside the live region, so toggling them never re-announces it.
  return (
    <div className={styles.failures}>
      <p className={styles.failuresTitle} role="alert">
        <FiAlertTriangle className={styles.lineIcon} aria-hidden />
        {t("admin:stickerPacks.publish.failures.title", { count: failedCount })}
      </p>
      <Button
        variant="ghost"
        size="sm"
        className={styles.failuresToggle}
        aria-expanded={isExpanded}
        aria-controls={groupsId}
        onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
      >
        {t(
          isExpanded
            ? "admin:stickerPacks.publish.failures.hide"
            : "admin:stickerPacks.publish.failures.show",
        )}
        <FiChevronDown className={styles.failuresToggleIcon} aria-hidden />
      </Button>
      <ul
        id={groupsId}
        className={styles.failureGroups}
        data-expanded={isExpanded}
      >
        {groups.map((group) => (
          <li key={group.reason} className={styles.failureGroup}>
            <span className={styles.failureFlags}>
              {group.flagIds
                .map((flagId) => t(`cards:flag.${flagId}`))
                .join(", ")}
            </span>
            <span className={styles.failureReason}>
              {t(`admin:stickerPacks.publish.failureReason.${group.reason}`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** What the one live status line says in each phase. */
function StatusLineContent({
  phase,
  blockedReason,
  pack,
  run,
  summary,
}: {
  phase: BarPhase;
  blockedReason: string | null;
  pack: AdminStickerPackResponse | null;
  run: StickerPublishRun | null;
  summary: StickerPublishSummary;
}) {
  const { t } = useTranslation();
  if (phase === "idle") {
    if (blockedReason) {
      return (
        <span className={styles.lineWithIcon}>
          <FiInfo className={styles.lineIcon} aria-hidden />
          {blockedReason}
        </span>
      );
    }
    return pack ? <PackStatusNote status={pack.status} /> : null;
  }
  if (!run) return null;
  if (phase === "running") {
    return (
      <RunningLine
        run={run}
        summary={summary}
        isOtherPack={pack?.id !== run.packId}
      />
    );
  }
  if (phase === "cancelled") {
    return (
      <span className={[styles.lineWithIcon, styles.result].join(" ")}>
        <FiStopCircle className={styles.lineIcon} aria-hidden />
        {t("admin:stickerPacks.publish.stopped", {
          done: summary.doneCount + summary.failedCount,
          total: summary.totalCount,
        })}
      </span>
    );
  }
  const hasLanded = summary.doneCount > 0;
  const ResultIcon = hasLanded ? FiCheckCircle : FiInfo;
  return (
    <span className={[styles.lineWithIcon, styles.result].join(" ")}>
      <ResultIcon
        className={[styles.lineIcon, hasLanded && styles.iconSuccess]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      />
      {resultSentence(t, summary, run.packName)}
    </span>
  );
}

/** The result actions. Exactly one filled button: Retry when something
 *  failed, else "Publish pack now" for a draft that holds stickers (the
 *  header's rule: an empty pack cannot go live), else none. */
function FinishedActions({
  summary,
  canPublishPack,
  isRetrying,
  onRetryFailed,
  onViewPack,
  onPublishPack,
}: {
  summary: StickerPublishSummary;
  canPublishPack: boolean;
  isRetrying: boolean;
  onRetryFailed: () => void;
  onViewPack: () => void;
  onPublishPack: () => void;
}) {
  const { t } = useTranslation();
  const hasFailures = summary.failedCount > 0;
  const hasLanded = summary.doneCount > 0;
  return (
    <>
      {hasLanded && (
        <Button variant="ghost" onClick={onViewPack}>
          {t("admin:stickerPacks.publish.viewPack")}
        </Button>
      )}
      {hasLanded && canPublishPack && (
        <Button
          variant={hasFailures ? "ghost" : "primary"}
          onClick={onPublishPack}
        >
          {t("admin:stickerPacks.publish.publishPackNow")}
        </Button>
      )}
      {hasFailures && (
        // aria-disabled keeps the button focusable while the pack list
        // refetches, so keyboard focus stays put; the click guard blocks the
        // retry until that finishes.
        <Button
          variant="primary"
          aria-disabled={isRetrying || undefined}
          aria-busy={isRetrying || undefined}
          onClick={() => {
            if (!isRetrying) onRetryFailed();
          }}
        >
          {isRetrying
            ? t("admin:stickerPacks.publish.retrying")
            : t("admin:stickerPacks.publish.retryFailed", {
                count: summary.failedCount,
              })}
        </Button>
      )}
    </>
  );
}

/** The controls on the right, one set per phase. */
function BarActions({
  phase,
  pack,
  run,
  summary,
  ctaLabel,
  blockedReason,
  statusLineId,
  canPublishPack,
  isStopRequested,
  isRetrying,
  onOpenReview,
  onStop,
  onRetryFailed,
  onDismissRun,
  onViewPack,
  onPublishPack,
}: {
  phase: BarPhase;
  pack: AdminStickerPackResponse | null;
  run: StickerPublishRun | null;
  summary: StickerPublishSummary;
  ctaLabel: string;
  blockedReason: string | null;
  statusLineId: string;
  canPublishPack: boolean;
  isStopRequested: boolean;
  isRetrying: boolean;
  onOpenReview: () => void;
  onStop: () => void;
  onRetryFailed: () => void;
  onDismissRun: () => void;
  onViewPack: () => void;
  onPublishPack: () => void;
}) {
  const { t } = useTranslation();
  // A run keeps going when the admin opens another pack; from there the one
  // way back is a plain "Go to Rainbow", which opens the run's pack.
  const isRunForOtherPack = Boolean(run && pack?.id !== run.packId);
  return (
    <div className={styles.actions}>
      {phase === "idle" && (
        <Button
          variant="primary"
          className={styles.cta}
          disabled={Boolean(blockedReason)}
          aria-describedby={blockedReason ? statusLineId : undefined}
          onClick={onOpenReview}
        >
          {ctaLabel}
        </Button>
      )}
      {phase === "running" && run && isRunForOtherPack && (
        <Button variant="ghost" className={styles.cta} onClick={onViewPack}>
          {t("admin:stickerPacks.publish.goToPack", { pack: run.packName })}
        </Button>
      )}
      {phase === "running" && (
        <Button
          variant="ghost"
          aria-disabled={isStopRequested || undefined}
          onClick={onStop}
        >
          {isStopRequested
            ? t("admin:stickerPacks.publish.stopping")
            : t("admin:stickerPacks.publish.cancel")}
        </Button>
      )}
      {phase === "finished" && (
        <FinishedActions
          summary={summary}
          canPublishPack={canPublishPack}
          isRetrying={isRetrying}
          onRetryFailed={onRetryFailed}
          onViewPack={onViewPack}
          onPublishPack={onPublishPack}
        />
      )}
      {(phase === "finished" || phase === "cancelled") && (
        <IconButton
          aria-label={t("admin:stickerPacks.publish.dismiss")}
          onClick={onDismissRun}
        >
          <FiX aria-hidden />
        </IconButton>
      )}
    </div>
  );
}

/**
 * The builder's sticky publish bar: status on the left, the page's one filled
 * primary button on the right. It walks through four phases.
 *
 * - idle: the mode control (only when the selection overlaps the pack), a
 *   status-aware helper or the reason the CTA is off, and a CTA naming the
 *   exact counts and pack. The CTA opens the review dialog.
 * - running: "Adding 4 of 11" with the flag in flight, a progress bar, Cancel.
 *   Seen from another pack, the line names the run's pack and offers a way
 *   back to it.
 * - finished: what landed, any failures grouped by reason, and the follow-ups.
 * - cancelled: "Stopped after N of M." and a dismiss button. Re-running the
 *   same selection is safe because flags already in the pack are skipped.
 *
 * One `role="status"` line carries the idle helper, the progress and the
 * result, so every change is announced from the same live region. On phones
 * the idle helper is visually hidden (the review dialog says it again before
 * anything happens) and the failure list folds behind a disclosure, so the
 * dock stays short.
 */
export function StickerPublishBar({
  pack,
  plan,
  mode,
  onModeChange,
  run,
  summary,
  onConfirmRun,
  onCancelRun,
  onRetryFailed,
  isRetrying = false,
  onDismissRun,
  onViewPack,
  onPublishPack,
}: {
  pack: AdminStickerPackResponse | null;
  plan: FlagPlanEntry[];
  mode: PublishMode;
  onModeChange: (mode: PublishMode) => void;
  run: StickerPublishRun | null;
  summary: StickerPublishSummary;
  onConfirmRun: () => void;
  onCancelRun: () => void;
  onRetryFailed: () => void;
  /** True while a retry refetches the pack list, before its run starts. */
  isRetrying?: boolean;
  onDismissRun: () => void;
  onViewPack: () => void;
  onPublishPack: () => void;
}) {
  const { t } = useTranslation();
  const statusLineId = useId();
  const barRef = useRef<HTMLElement>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isStopRequested, setIsStopRequested] = useState(false);
  const phase = phaseOf(run, summary);
  const blockedReason =
    phase === "idle" ? blockedReasonOf(t, pack, plan) : null;
  const ctaLabel = publishCtaLabel(t, plan, pack?.name ?? null);
  const inPackCount = plan.filter((entry) => entry.action !== "add").length;
  const canPublishPack = Boolean(
    pack &&
    run &&
    pack.id === run.packId &&
    pack.status === "draft" &&
    pack.stickers.length > 0,
  );
  const hasFailureList =
    (phase === "finished" || phase === "cancelled") && summary.failedCount > 0;
  const processedCount = summary.doneCount + summary.failedCount;
  const progressFraction =
    summary.totalCount > 0 ? processedCount / summary.totalCount : 0;

  // Every phase swaps the controls on the right, so the button holding focus
  // (the CTA, Cancel, Retry) can vanish under a keyboard user. When it does,
  // focus lands on the bar, right where the admin was working.
  const layoutKey = `${phase}:${canPublishPack}:${summary.failedCount > 0}:${run?.packId === pack?.id}`;
  const previousLayoutKeyRef = useRef(layoutKey);
  useEffect(() => {
    if (previousLayoutKeyRef.current === layoutKey) return;
    previousLayoutKeyRef.current = layoutKey;
    const activeElement = document.activeElement;
    if (!activeElement || activeElement === document.body) {
      barRef.current?.focus({ preventScroll: true });
    }
  }, [layoutKey]);

  const handleConfirm = () => {
    setIsReviewOpen(false);
    setIsStopRequested(false);
    onConfirmRun();
  };
  const handleRetry = () => {
    setIsStopRequested(false);
    onRetryFailed();
  };
  const handleStop = () => {
    if (isStopRequested) return;
    setIsStopRequested(true);
    onCancelRun();
  };

  return (
    <section
      ref={barRef}
      tabIndex={-1}
      className={styles.bar}
      data-phase={phase}
      aria-label={t("admin:stickerPacks.publish.regionLabel")}
    >
      <div className={styles.status}>
        {phase === "idle" && pack && inPackCount > 0 && (
          <StickerPublishModeControl
            mode={mode}
            onModeChange={onModeChange}
            inPackCount={inPackCount}
          />
        )}
        <p
          id={statusLineId}
          className={styles.statusLine}
          role="status"
          data-helper-only={phase === "idle" && !blockedReason}
        >
          <StatusLineContent
            phase={phase}
            blockedReason={blockedReason}
            pack={pack}
            run={run}
            summary={summary}
          />
        </p>
        {phase === "running" && (
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label={t("admin:stickerPacks.publish.progressLabel")}
            aria-valuemin={0}
            aria-valuemax={summary.totalCount}
            aria-valuenow={processedCount}
          >
            <div
              className={styles.progressFill}
              style={{ transform: `scaleX(${progressFraction})` }}
            />
          </div>
        )}
        {hasFailureList && run && (
          <FailureList run={run} failedCount={summary.failedCount} />
        )}
      </div>

      <BarActions
        phase={phase}
        pack={pack}
        run={run}
        summary={summary}
        ctaLabel={ctaLabel}
        blockedReason={blockedReason}
        statusLineId={statusLineId}
        canPublishPack={canPublishPack}
        isStopRequested={isStopRequested}
        isRetrying={isRetrying}
        onOpenReview={() => setIsReviewOpen(true)}
        onStop={handleStop}
        onRetryFailed={handleRetry}
        onDismissRun={onDismissRun}
        onViewPack={onViewPack}
        onPublishPack={onPublishPack}
      />

      {isReviewOpen && pack && (
        <StickerPublishReviewDialog
          packName={pack.name}
          packStatus={pack.status}
          plan={plan}
          confirmLabel={ctaLabel}
          onConfirm={handleConfirm}
          onClose={() => setIsReviewOpen(false)}
        />
      )}
    </section>
  );
}
