import { useEffect, useRef, useState, type RefObject } from "react";
import { ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import { StickerPublishBar } from "./StickerPublishBar";
import { buildFlagPlan } from "./stickerFlags";
import { summarizeRun, type useStickerPublish } from "./useStickerPublish";
import type { StickerBuilderState } from "./useStickerBuilderState";
import type { StickerPackActions } from "./useStickerPackActions";
import styles from "./StickerPublishDock.module.css";

type StickerPublisher = ReturnType<typeof useStickerPublish>;

/** Read by the sticky style column in StickerBuilderWorkspace.module.css. */
const DOCK_RESERVE_PROPERTY = "--workspace-dock-reserve";

/**
 * Keeps the workspace's dock reserve equal to the dock's real footprint. A
 * blocked reason, the PT legend or the failure list make the dock taller
 * than any guess, and the sticky style column above it must stop short of
 * it, or its last controls slide under the dock. On wide screens the dock's
 * own stylesheet floats it `var(--gap-xs)` above the viewport edge (0 on
 * phones), so the reserve has to add that computed `bottom` offset to the
 * border-box height, or the column's clearance shrinks to whatever the
 * layout gap happens to leave over.
 */
function useDockReserve(dockRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const dock = dockRef.current;
    const workspace = dock?.closest<HTMLElement>("[data-sticker-workspace]");
    if (!dock || !workspace || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const dockHeight = Math.ceil(dock.getBoundingClientRect().height);
      const dockBottomOffset = Math.ceil(
        parseFloat(getComputedStyle(dock).bottom) || 0,
      );
      workspace.style.setProperty(
        DOCK_RESERVE_PROPERTY,
        `${dockHeight + dockBottomOffset}px`,
      );
    });
    observer.observe(dock);
    return () => {
      observer.disconnect();
      workspace.style.removeProperty(DOCK_RESERVE_PROPERTY);
    };
  }, [dockRef]);
}

/**
 * Clears a finished run with no failures once the admin starts a second
 * pass (ticks a flag, restyles, or changes the mode), so the bar returns to
 * idle with its Add button instead of waiting for the dismiss X. A run with
 * failures stays, so "Retry failed" never vanishes. A pack switch only
 * rebases the comparison: the builder resets the mode and style for the new
 * pack, and that is no edit of the admin's.
 */
function useDismissFinishedRunOnEdit({
  packId,
  state,
  publisher,
  failedCount,
}: {
  packId: string;
  state: StickerBuilderState;
  publisher: StickerPublisher;
  failedCount: number;
}) {
  const { selectedFlagIds, params, mode } = state;
  const { run, dismiss } = publisher;
  const baselineRef = useRef({ packId, selectedFlagIds, params, mode });

  useEffect(() => {
    const baseline = baselineRef.current;
    baselineRef.current = { packId, selectedFlagIds, params, mode };
    if (baseline.packId !== packId) return;
    const isEdited =
      baseline.selectedFlagIds !== selectedFlagIds ||
      baseline.params !== params ||
      baseline.mode !== mode;
    if (!isEdited || !run || run.isRunning || failedCount > 0) return;
    dismiss();
  }, [packId, selectedFlagIds, params, mode, run, failedCount, dismiss]);
}

/**
 * The publish bar in its sticky dock at the bottom of the workspace, plus
 * what the bar's buttons set off: the run itself (with a translated label per
 * flag) and "Publish pack now", which confirms with the same dialog and copy
 * as the header's Publish action before the pack goes live.
 */
export function StickerPublishDock({
  pack,
  state,
  actions,
  publisher,
  onViewPack,
}: {
  pack: AdminStickerPackResponse;
  state: StickerBuilderState;
  actions: StickerPackActions;
  publisher: StickerPublisher;
  onViewPack: () => void;
}) {
  const { t } = useTranslation();
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const { run } = publisher;
  const summary = summarizeRun(run);
  const plan = buildFlagPlan(state.selectedFlagIds, pack, state.mode);

  useDockReserve(dockRef);
  useDismissFinishedRunOnEdit({
    packId: pack.id,
    state,
    publisher,
    failedCount: summary.failedCount,
  });

  function handleConfirmRun() {
    const labelsByFlagId: Record<string, string> = {};
    for (const entry of plan) {
      labelsByFlagId[entry.flagId] = t(
        "admin:stickerPacks.publish.stickerLabel",
        { flag: t(`cards:flag.${entry.flagId}`) },
      );
    }
    void publisher.start({
      pack,
      plan,
      mode: state.mode,
      params: state.params,
      labelsByFlagId,
    });
  }

  return (
    <div ref={dockRef} className={styles.publishDock}>
      <StickerPublishBar
        pack={pack}
        plan={plan}
        mode={state.mode}
        onModeChange={state.setMode}
        run={run}
        summary={summary}
        onConfirmRun={handleConfirmRun}
        onCancelRun={publisher.cancel}
        onRetryFailed={() => void publisher.retryFailed()}
        isRetrying={publisher.isRetrying}
        onDismissRun={publisher.dismiss}
        onViewPack={onViewPack}
        onPublishPack={() => setIsPublishConfirmOpen(true)}
      />
      <ConfirmDialog
        open={isPublishConfirmOpen}
        onClose={() => setIsPublishConfirmOpen(false)}
        onConfirm={() => {
          setIsPublishConfirmOpen(false);
          actions.handleSetStatus("published");
        }}
        loading={actions.isMutatingPack}
        title={t("admin:stickerPacks.header.publishConfirm.title", {
          name: pack.name,
        })}
        description={t("admin:stickerPacks.header.publishConfirm.body", {
          count: pack.stickers.length,
        })}
        confirmLabel={t("admin:stickerPacks.header.action.publish")}
      />
    </div>
  );
}
