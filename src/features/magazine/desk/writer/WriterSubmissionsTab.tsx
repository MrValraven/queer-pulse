import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../../shared/api/client";
import { ConfirmDialog } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { PitchTabs } from "../../PitchTabs";
import {
  PITCH_TABS,
  countByTab,
  selectPitches,
  type Pitch,
} from "../../pitchTracker.data";
import { useMySubmissions } from "../../api/useMySubmissions";
import {
  PITCH_ALREADY_DECIDED_STATUS,
  usePitchMutations,
} from "../../api/usePitchMutations";
import { SubmissionsStatusBody } from "./SubmissionsStatusBody";
import { SubmissionsSummary } from "./SubmissionsSummary";
import pieceStyles from "../pieceTabs.module.css";

/**
 * The "Submissions" tab body of `WriterWorkspacePage`: the member's own story
 * submissions from `/magazine/submit-story`, read from
 * `GET /magazine/submissions/mine`, with a status filter and a withdraw
 * action. It fetches for itself, so the workspace's own loading and error
 * gates (which cover the writer-workspace read) do not apply to it; it owns
 * its skeleton and retry states.
 */
export function WriterSubmissionsTab() {
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [tab, setTab] = useState("all");
  const [locallyWithdrawnIds, setLocallyWithdrawnIds] = useState<Set<string>>(
    new Set(),
  );
  const [pitchAwaitingConfirm, setPitchAwaitingConfirm] =
    useState<Pitch | null>(null);
  const { data: pitches, isPending, isError, refetch } = useMySubmissions();
  const { withdraw } = usePitchMutations();
  const filterGroupRef = useRef<HTMLDivElement>(null);

  // `useMySubmissions` already returns the demo PITCHES in demo mode and the
  // member's real submissions live, so an empty result here means "none yet".
  // `locallyWithdrawnIds` only ever fills up in demo mode: live withdrawals are
  // a real server write, so the row simply stops coming back.
  const base = useMemo(
    () => (pitches ?? []).filter((pitch) => !locallyWithdrawnIds.has(pitch.id)),
    [pitches, locallyWithdrawnIds],
  );
  const counts = useMemo(() => countByTab(base), [base]);
  const visible = useMemo(() => selectPitches(base, tab), [base, tab]);

  // The summary row's two numbers, counted from the member's own rows.
  // "Active" is everything the desk has not finished with: published and
  // closed are the two terminal states. `null` while the first read is in
  // flight or after it failed, so the row shows its counts line only once
  // real numbers have arrived.
  const hasCounts = !isPending && !isError;
  const activeCount = !hasCounts
    ? null
    : base.filter(
        (pitch) => pitch.status !== "published" && pitch.status !== "rejected",
      ).length;
  const publishedCount = !hasCounts
    ? null
    : base.filter((pitch) => pitch.status === "published").length;

  /**
   * Demo mode's withdraw: local state plus an Undo, because the sandbox has no
   * server that could forget the row. Live mode has no Undo, which is exactly
   * why both modes go through the confirm dialog first.
   */
  function withdrawInDemo(pitch: Pitch) {
    setLocallyWithdrawnIds((previous) => new Set(previous).add(pitch.id));
    showToast(
      t("magazine:pitchTracker.page.withdrawnToast"),
      "info",
      undefined,
      {
        label: t("magazine:pitchTracker.page.undoCta"),
        onClick: () =>
          setLocallyWithdrawnIds((previous) => {
            const remaining = new Set(previous);
            remaining.delete(pitch.id);
            return remaining;
          }),
      },
    );
  }

  function confirmWithdraw() {
    const pitch = pitchAwaitingConfirm;
    if (!pitch) return;
    if (demoMode) {
      closeConfirmOntoFilter(() => withdrawInDemo(pitch));
      return;
    }
    withdraw.mutate(
      { id: pitch.id },
      {
        onSuccess: () => {
          closeConfirmOntoFilter();
          showToast(t("magazine:pitchTracker.withdraw.doneToast"), "success");
        },
        onError: (error) => {
          // A 409 means the desk answered while this card was on screen. Say so
          // plainly and pull the real state back down, so the member sees the
          // decision rather than a button that keeps failing.
          const hasBeenDecided =
            error instanceof ApiError &&
            error.status === PITCH_ALREADY_DECIDED_STATUS;
          showToast(
            t(
              hasBeenDecided
                ? "magazine:pitchTracker.withdraw.decidedToast"
                : "magazine:pitchTracker.withdraw.failedToast",
            ),
            "error",
          );
          if (hasBeenDecided) void refetch();
        },
        onSettled: () => setPitchAwaitingConfirm(null),
      },
    );
  }

  function focusPressedFilterChip() {
    filterGroupRef.current
      ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      ?.focus();
  }

  /** Closes the confirm, then focuses the pressed chip (the Withdraw card is
   *  leaving). A sync commit runs the dialog's focus-restore cleanup inside
   *  `flushSync`, so the chip wins; the chip row outlives an emptied list. */
  function closeConfirmOntoFilter(alongside?: () => void) {
    flushSync(() => {
      setPitchAwaitingConfirm(null);
      alongside?.();
    });
    focusPressedFilterChip();
  }

  /** The empty state's way out of a narrow filter. The chip it pressed for
   *  them is where focus lands, since the button itself unmounts. */
  function showAll() {
    flushSync(() => setTab("all"));
    focusPressedFilterChip();
  }

  function stub(label: string) {
    showToast(t("magazine:pitchTracker.page.stubToast", { label }), "info");
  }

  return (
    <div className={pieceStyles.stack}>
      <SubmissionsSummary
        activeCount={activeCount}
        publishedCount={publishedCount}
      />
      {/* The counts only mean something once the read has landed. */}
      {hasCounts && (
        <PitchTabs
          tabs={PITCH_TABS}
          active={tab}
          counts={counts}
          onChange={setTab}
          groupRef={filterGroupRef}
        />
      )}

      <SubmissionsStatusBody
        isPending={isPending}
        isError={isError}
        onRetry={() => void refetch()}
        visiblePitches={visible}
        isFiltered={tab !== "all"}
        onShowAll={showAll}
        onWithdraw={setPitchAwaitingConfirm}
        onStub={stub}
      />

      <ConfirmDialog
        open={pitchAwaitingConfirm !== null}
        onClose={() => setPitchAwaitingConfirm(null)}
        onConfirm={confirmWithdraw}
        tone="destructive"
        loading={withdraw.isPending}
        title={t("magazine:pitchTracker.withdraw.confirmTitle")}
        description={t("magazine:pitchTracker.withdraw.confirmBody")}
        confirmLabel={t("magazine:pitchTracker.withdraw.confirmCta")}
      />
    </div>
  );
}
