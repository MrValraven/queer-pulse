import { useEffect, useMemo, useRef, type RefObject } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { VouchGraphCanvas } from "./VouchGraphCanvas";
import { VouchGraphCanvasSummary } from "./VouchGraphCanvasSummary";
import { VouchGraphFooter } from "./VouchGraphFooter";
import { InspectorPanel } from "./VouchGraphInspectorPanel";
import { VouchGraphInviteTree } from "./VouchGraphInviteTree";
import { VouchGraphListView } from "./VouchGraphListView";
import { VouchGraphPathBar } from "./VouchGraphPathBar";
import { VouchGraphTopBar } from "./VouchGraphTopBar";
import { useVouchGraph, type VouchGraphController } from "./useVouchGraph";
import { useVouchGraphViewActions } from "./useVouchGraphViewActions";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import type { VouchGraphUrlView } from "./vouchGraph.types";
import styles from "./vouchGraphShell.module.css";

/** The mode tabs' `aria-controls` target. */
const STAGE_ID = "vouch-graph-stage";
/** The canvas `aria-describedby` target (VouchGraphCanvas). */
const SUMMARY_ID = "vouch-graph-summary";
const STAGE_FADE_SECONDS = 0.16;
const STAGE_FADE_EASE = [0.22, 0.68, 0.16, 1] as const;

type StageView = "canvas" | "list" | "tree";

/**
 * The main area: the invite tree in Invites mode, the member table when
 * "View as list" is on, the graph canvas otherwise. A swap fades the old
 * view out and the new one in. The live summary the canvas points at stays
 * mounted whichever view shows.
 */
function VouchGraphStage({
  controller,
  svgRef,
}: {
  controller: VouchGraphController;
  svgRef: RefObject<SVGSVGElement | null>;
}) {
  const { reducedMotion } = useMotionPrefs();
  const { pathA, pathB } = controller;
  const pathEndpointIds = useMemo(
    () => [pathA, pathB].filter((id): id is string => id !== null),
    [pathA, pathB],
  );
  const stageView: StageView =
    controller.mode === "invites"
      ? "tree"
      : controller.isListView
        ? "list"
        : "canvas";
  const duration = reducedMotion ? 0 : STAGE_FADE_SECONDS;
  // B4: "Show in network" leaves the tree for the graph, centred on them.
  const showInNetwork = (personId: string) => {
    controller.changeMode("plain");
    controller.recenter(personId);
  };

  return (
    <div id={STAGE_ID} className={styles.stageArea}>
      <AnimatePresence initial={false} mode="wait">
        <m.div
          key={stageView}
          className={styles.stageView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: STAGE_FADE_EASE }}
        >
          {stageView === "tree" ? (
            <VouchGraphInviteTree
              focusId={controller.focus}
              selectedId={controller.selectedId}
              onSelect={controller.select}
              onShowInNetwork={showInNetwork}
            />
          ) : stageView === "list" ? (
            <VouchGraphListView
              focusId={controller.focus}
              visIds={controller.visIds}
              visEdges={controller.visEdges}
              selectedId={controller.selectedId}
              bubbles={controller.bubbles}
              onSelect={controller.select}
              onToggleBubble={controller.toggleBubble}
            />
          ) : (
            <VouchGraphCanvas
              visIds={controller.visIds}
              visEdges={controller.visEdges}
              bubbles={controller.bubbles}
              focus={controller.focus}
              mode={controller.mode}
              layoutKind={controller.layoutKind}
              selectedId={controller.selectedId}
              hoveredId={controller.hoveredId}
              path={controller.path}
              pathEndpointIds={pathEndpointIds}
              searchMatchIds={controller.searchMatchIds}
              isSearchActive={controller.search.trim().length > 0}
              highlightedRingId={controller.highlightedRingId}
              centerRequest={controller.centerRequest}
              isCompactViewport={controller.isCompactViewport}
              isFilteredEmpty={controller.isFilteredEmpty}
              svgRef={svgRef}
              onSelect={controller.select}
              onRecenter={controller.recenter}
              onPickPath={controller.pickPath}
              onToggleBubble={controller.toggleBubble}
              onHoverChange={controller.setHovered}
              onClearFilters={controller.clearFilters}
            >
              <VouchGraphPathBar
                pathA={controller.pathA}
                pathB={controller.pathB}
                path={controller.path}
                onClear={controller.clearPath}
              />
            </VouchGraphCanvas>
          )}
        </m.div>
      </AnimatePresence>
      <VouchGraphCanvasSummary
        id={SUMMARY_ID}
        focusId={controller.focus}
        visIds={controller.visIds}
        visEdges={controller.visEdges}
        path={controller.path}
        isReplaying={controller.isReplaying}
      />
    </div>
  );
}

/** The loaded graph: top bar, stage, inspector and footer. It renders inside
 *  `GraphModalShell`, which `AdminVouchGraphModal` mounts once for every
 *  state of the network. */
export function VouchGraphModalLayout({
  initialView,
  onClose,
  onJumpToMember,
  onViewChange,
}: {
  initialView: VouchGraphUrlView;
  /** The modal's `exit.close`: silenced while the exit plays. */
  onClose: () => void;
  onJumpToMember: (slug: string) => void;
  /** Called with every shareable view change (and the initial view). */
  onViewChange: (view: VouchGraphUrlView) => void;
}) {
  const graph = useTrustGraph();
  const controller = useVouchGraph(graph, initialView, { onJumpToMember });
  const focusPerson = graph.peopleById[controller.focus]!;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isTreeShown = controller.mode === "invites";
  // The invite tree or the member list fills the stage. The downloads read
  // the canvas SVG, and the replay controls and the phone inspector sheet
  // belong to the graph, so they all wait for the graph view.
  const isGraphViewHidden = isTreeShown || controller.isListView;
  const isDownloadDisabled = isGraphViewHidden;
  const { urlView } = controller;
  const viewActions = useVouchGraphViewActions({
    svgRef,
    urlView,
    isDownloadDisabled,
  });
  useEffect(() => onViewChange(urlView), [onViewChange, urlView]);
  // Claims focus as the graph appears, on first open, after loading and
  // after a jump's remount. `GraphModalShell` (the overlay and dialog this
  // renders inside) relies on it: focus has to be inside before the drawer
  // underneath goes inert, and the shell returns focus to the opener. The
  // dialog itself takes it (tabIndex -1, drawn ringless), so screen readers hear
  // its name and the first Tab lands on the first control in the bar.
  useEffect(() => {
    const dialog =
      closeButtonRef.current?.closest<HTMLElement>('[role="dialog"]');
    if (!dialog) {
      closeButtonRef.current?.focus();
      return;
    }
    if (!dialog.hasAttribute("tabindex")) dialog.tabIndex = -1;
    dialog.focus({ preventScroll: true });
  }, []);

  // A4: a pick from "In this graph" selects and pans when the member is on
  // the canvas; anyone outside the view gets recentred (or selected, when
  // their network is private).
  const selectInGraph = (personId: string) => {
    if (controller.visIds.includes(personId)) {
      controller.select(personId);
      controller.centerOn(personId);
      return;
    }
    controller.focusCase(personId);
  };
  // The list toggle leaves the invite tree for the Network tab's list.
  const toggleListView = () => {
    if (isTreeShown) {
      controller.changeMode("plain");
      controller.setListView(true);
      return;
    }
    controller.setListView(!controller.isListView);
  };

  return (
    <>
      <VouchGraphTopBar
        focusPerson={focusPerson}
        crumbs={controller.crumbs}
        mode={controller.mode}
        openCaseCount={graph.openCaseCount}
        isScenesAvailable={controller.isScenesAvailable}
        search={controller.search}
        filters={controller.filters}
        activeFilterCount={controller.activeFilterCount}
        isListView={controller.isListView && !isTreeShown}
        isDownloadDisabled={isDownloadDisabled}
        stageId={STAGE_ID}
        closeButtonRef={closeButtonRef}
        onGotoCrumb={controller.gotoCrumb}
        onChangeMode={controller.changeMode}
        onSearchChange={controller.setSearch}
        onSelectInGraph={selectInGraph}
        onJumpToMember={onJumpToMember}
        onFiltersChange={controller.setFilters}
        onClearFilters={controller.clearFilters}
        onToggleListView={toggleListView}
        onCopyLink={viewActions.copyLink}
        onDownload={viewActions.download}
        onClose={onClose}
      />

      <div className={styles.main}>
        <VouchGraphStage controller={controller} svgRef={svgRef} />
        <InspectorPanel
          graph={graph}
          controller={controller}
          isSheetSuppressed={isGraphViewHidden}
        />
      </div>

      <VouchGraphFooter
        mode={controller.mode}
        timeCut={controller.timeCut}
        eventCount={controller.eventCount}
        currentEvent={controller.currentEvent}
        isReplaying={controller.isReplaying}
        onReplay={controller.replay}
        onSetTime={controller.setTime}
        isFullyRevealed={controller.isFullyRevealed}
        visIds={controller.visIds}
        visEdges={controller.visEdges}
        focusName={focusPerson.name}
        isTimeControlsHidden={isGraphViewHidden}
        isLegendHidden={controller.isListView}
      />
    </>
  );
}
