import { AnimatePresence } from "motion/react";
import { Collapse } from "../../shared/components/ui/Collapse";
import type { TrustGraph } from "./trustGraph/trustGraphModel";
import { VouchGraphCiteDialog } from "./VouchGraphCiteDialog";
import { VouchGraphCompare } from "./VouchGraphCompare";
import { VouchGraphInspector } from "./VouchGraphInspector";
import { VouchGraphSafetyTriage } from "./VouchGraphSafetyTriage";
import type { VouchGraphController } from "./useVouchGraph";
import { useVouchGraphInspectorActions } from "./useVouchGraphInspectorActions";
import { buildTrustNetworkViewUrl } from "./vouchGraphViewUrl";

/**
 * The inspector plus its "Cite" confirm dialog (ADM-9). Owns
 * `useVouchGraphInspectorActions` itself so `VouchGraphModalLayout` stays under
 * the repo's 200-line component limit. Extracted into its own component because
 * the dialog needs the same action-state (`citingId`/`citeFromGraph`) the
 * inspector's "Cite" button opens it from.
 */
export function InspectorPanel({
  graph,
  controller,
  isSheetSuppressed = false,
}: {
  graph: TrustGraph;
  controller: VouchGraphController;
  /** True in the invites tree and the list view, where the phone sheet
   *  waits for the admin to pick someone before it opens. */
  isSheetSuppressed?: boolean;
}) {
  const {
    verifyFromGraph,
    verifyingId,
    openInModeration,
    citingId,
    openCite,
    closeCite,
    citeFromGraph,
    citing,
  } = useVouchGraphInspectorActions(graph);
  const { selectedId } = controller;

  // Selects a member named in the inspector and pans to them when they are
  // on the canvas.
  const goToMember = (personId: string) => {
    controller.select(personId);
    if (controller.visIds.includes(personId)) controller.centerOn(personId);
  };

  const { pathA, pathB } = controller;
  const hasComparePair = Boolean(pathA && pathB);
  // B6: the compare card stays mounted inside Collapse so it animates in
  // when the second member is picked and out when the pair is cleared.
  const compareSlot = (
    <Collapse isOpen={hasComparePair}>
      {pathA && pathB && (
        <VouchGraphCompare
          firstId={pathA}
          secondId={pathB}
          path={controller.path}
          onGo={goToMember}
          onClear={controller.clearPath}
        />
      )}
    </Collapse>
  );
  // B1: the Safety tab with nothing selected lists the cases to review.
  const triageSlot =
    controller.mode === "safety" ? (
      <VouchGraphSafetyTriage onFocusCase={controller.focusCase} />
    ) : undefined;

  return (
    <>
      <VouchGraphInspector
        selectedId={selectedId}
        focusId={controller.focus}
        activeEdgeId={
          controller.isFullyRevealed ? null : controller.activeEdgeId
        }
        isExpanded={selectedId ? controller.expanded.has(selectedId) : false}
        hoveredId={controller.hoveredId}
        shouldHideWithdrawn={controller.filters.shouldHideWithdrawn}
        isVerifying={verifyingId !== null && verifyingId === selectedId}
        emptyState={triageSlot}
        topSlot={compareSlot}
        hasTopContent={hasComparePair}
        isSheetSuppressed={isSheetSuppressed}
        onGo={goToMember}
        onRecenter={controller.recenter}
        onHoverChange={controller.setHovered}
        onExpand={controller.toggleExpand}
        onShowRing={controller.showRing}
        onVerify={verifyFromGraph}
        onOpenModeration={openInModeration}
        onCite={openCite}
        onCloseSheet={() => controller.select(null)}
      />
      {/* The shared Modal plays its exit inside AnimatePresence. */}
      <AnimatePresence>
        {citingId && (
          <VouchGraphCiteDialog
            key={citingId}
            focusId={controller.focus}
            personId={citingId}
            // The view on screen as the dialog opens; the dialog reads it
            // once, on mount.
            viewUrl={buildTrustNetworkViewUrl(controller.urlView)}
            onClose={closeCite}
            onCite={citeFromGraph}
            citing={citing}
          />
        )}
      </AnimatePresence>
    </>
  );
}
