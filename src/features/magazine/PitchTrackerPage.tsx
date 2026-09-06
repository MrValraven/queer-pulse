import { useMemo, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ApiError } from "../../shared/api/client";
import { AppShell } from "../../shared/components/layout";
import {
  ConfirmDialog,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PitchTrackerHeader } from "./PitchTrackerHeader";
import { PitchTabs } from "./PitchTabs";
import { PitchCard } from "./PitchCard";
import {
  PITCH_TABS,
  countByTab,
  selectPitches,
  type Pitch,
} from "./pitchTracker.data";
import { useMySubmissions } from "./api/useMySubmissions";
import {
  PITCH_ALREADY_DECIDED_STATUS,
  usePitchMutations,
} from "./api/usePitchMutations";
import styles from "./PitchTrackerPage.module.css";

function PitchCardSkeleton() {
  return (
    <div className={styles.skeletonCard} aria-hidden>
      <SkeletonLine width="55%" height={20} />
      <SkeletonLine width="70%" height={13} style={{ marginTop: 12 }} />
      <SkeletonLine
        width="100%"
        height={5}
        style={{ marginTop: 18, borderRadius: 3 }}
      />
    </div>
  );
}

/**
 * The member's own submission tracker at `/magazine/pitches`.
 *
 * This is a MEMBER surface, reachable by anyone with an active account: it
 * reads `GET /magazine/submissions/mine`, which the backend guards with
 * `ActiveMemberGuard` alone, and every member's account menu links here. It
 * therefore renders inside `AppShell` like the rest of the member app. It used
 * to render inside `MagazineDeskShell`, which put the editor rail
 * (Desk / Pitches / Issue / Archive) around it and fired that shell's
 * `usePieces()` read of the `magazine_editor`-guarded `GET /magazine/admin/pieces`
 * on every visit. With the route no longer demanding `magazine_writer`, leaving
 * that shell in place would have handed a plain member editor navigation they
 * cannot open and a 403 on their own page. PRD-125.
 */
export function PitchTrackerPage() {
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

  // The masthead's two numbers, counted from the member's own rows. "Active"
  // is everything the desk has not finished with: published and closed are the
  // two terminal states. `null` while the first read is in flight, so the
  // header holds the line back instead of claiming zero of each.
  const activeCount = isPending
    ? null
    : base.filter(
        (pitch) => pitch.status !== "published" && pitch.status !== "rejected",
      ).length;
  const publishedCount = isPending
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
      setPitchAwaitingConfirm(null);
      withdrawInDemo(pitch);
      return;
    }
    withdraw.mutate(
      { id: pitch.id },
      {
        onSuccess: () =>
          showToast(t("magazine:pitchTracker.withdraw.doneToast"), "success"),
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

  function stub(label: string) {
    showToast(t("magazine:pitchTracker.page.stubToast", { label }), "info");
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <PitchTrackerHeader
          activeCount={activeCount}
          publishedCount={publishedCount}
        />
        <PitchTabs
          tabs={PITCH_TABS}
          active={tab}
          counts={counts}
          onChange={setTab}
        />

        {isError ? (
          // Never an empty state on a failed read: "you have no pitches" would
          // be a lie told to someone whose pitches are sitting on the desk.
          <LoadErrorState
            onRetry={() => void refetch()}
            title={t("magazine:pitchTracker.page.loadErrorTitle")}
            description={t("magazine:pitchTracker.page.loadErrorBody")}
          />
        ) : isPending ? (
          Array.from({ length: 4 }, (_unused, index) => (
            <PitchCardSkeleton key={index} />
          ))
        ) : visible.length === 0 ? (
          <div className={styles.empty}>
            <h3>{t("magazine:pitchTracker.page.emptyTitle")}</h3>
            <p>{t("magazine:pitchTracker.page.emptyBody")}</p>
          </div>
        ) : (
          visible.map((pitch, index) => (
            <FadeIn key={pitch.id} delay={Math.min(index, 8) * 55}>
              <PitchCard
                pitch={pitch}
                onWithdraw={setPitchAwaitingConfirm}
                onStub={stub}
              />
            </FadeIn>
          ))
        )}
      </div>

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
    </AppShell>
  );
}
