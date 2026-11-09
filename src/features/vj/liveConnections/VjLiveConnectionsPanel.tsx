import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCast, FiChevronDown, FiChevronUp, FiPower } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjLiveDTO } from "../../../shared/contracts/vj";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { VjReasonLine } from "../VjReasonLine";
import { useVjLive, VJ_LIVE_POLL_MS } from "./useVjLive";
import { useStopVjLiveConnection } from "./useVjLiveStop";
import { VjLiveConnectionList } from "./VjLiveConnectionList";
import { VjLiveStopDialog } from "./VjLiveStopDialog";
import {
  VJ_LIVE_DISCONNECT_ATTRIBUTE,
  vjLiveCountLine,
  vjLiveCountsOf,
  vjLiveNeighbourConnectionIdOf,
} from "./vjLiveCounts";
import styles from "./VjLiveConnections.module.css";

const NOTHING_CONNECTED: VjLiveDTO = { stages: [], idleStageCount: 0 };
const VJ_LIVE_LIST_ID = "vj-live-connections-list";
const VJ_LIVE_TITLE_ID = "vj-live-title";
const FADE_SECONDS = 0.18;

type VjLiveReadState = "pending" | "error" | "success";

/** A panel action that fades in and out as it becomes useful. */
function VjLiveFade({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : FADE_SECONDS }}
    >
      {children}
    </m.span>
  );
}

/** The summary line, and the quiet line about a show held with nothing on
 *  it. Before the first answer it says the list is on its way, or that it
 *  could not be read (the reason line under it names why). */
function useSummary(
  live: VjLiveDTO,
  readState: VjLiveReadState,
): {
  summary: string;
  idleLine: string | null;
} {
  const { t } = useTranslation();
  if (readState === "pending") {
    return { summary: t("vj:live.summary.loading"), idleLine: null };
  }
  if (readState === "error") {
    return { summary: t("vj:live.summary.unread"), idleLine: null };
  }
  const countLine = vjLiveCountLine(t, vjLiveCountsOf(live), {
    bothKey: "vj:live.summary.both",
    oneKey: "vj:live.summary.one",
  });
  const idleLine =
    countLine === null && live.idleStageCount > 0
      ? t("vj:live.idle", { count: live.idleStageCount })
      : null;
  return { summary: countLine ?? t("vj:live.summary.none"), idleLine };
}

/** Focuses the Disconnect button of `connectionId` inside `panel`; false
 *  when that row is no longer there. */
function focusDisconnectOf(panel: HTMLElement, connectionId: string): boolean {
  const buttons = panel.querySelectorAll<HTMLElement>(
    `[${VJ_LIVE_DISCONNECT_ATTRIBUTE}]`,
  );
  for (const button of buttons) {
    if (button.getAttribute(VJ_LIVE_DISCONNECT_ATTRIBUTE) === connectionId) {
      button.focus();
      return true;
    }
  }
  return false;
}

/** A Disconnect refusal stays up until a read lands a full poll after it, so
 *  the reason can be read first (the re-read right after a refusal would
 *  clear it at once). By then the row it named is gone or the reason is old. */
function useClearStaleStopError(
  error: Error | null,
  dataUpdatedAt: number,
  reset: () => void,
): void {
  const errorShownAtRef = useRef<number | null>(null);
  useEffect(() => {
    errorShownAtRef.current = error === null ? null : Date.now();
  }, [error]);
  useEffect(() => {
    const errorShownAt = errorShownAtRef.current;
    if (
      errorShownAt !== null &&
      dataUpdatedAt - errorShownAt >= VJ_LIVE_POLL_MS
    )
      reset();
  }, [dataUpdatedAt, reset]);
}

interface VjLiveHeadProps {
  live: VjLiveDTO;
  readState: VjLiveReadState;
  isListOpen: boolean;
  toggleRef: Ref<HTMLButtonElement>;
  onToggleList: () => void;
  onStopEverything: () => void;
}

/** The icon, title and summary, with Show connections and Stop everything. */
function VjLiveHead({
  live,
  readState,
  isListOpen,
  toggleRef,
  onToggleList,
  onStopEverything,
}: VjLiveHeadProps) {
  const { t } = useTranslation();
  const { summary, idleLine } = useSummary(live, readState);
  const hasConnections = live.stages.length > 0;
  const canStopEverything = hasConnections || live.idleStageCount > 0;
  return (
    <div className={styles.head}>
      <span className={styles.icon} aria-hidden="true">
        <FiCast focusable="false" fill="none" />
      </span>
      <div className={styles.text}>
        <h2 id={VJ_LIVE_TITLE_ID} className={styles.title}>
          {t("vj:live.title")}
        </h2>
        <p className={styles.summary} role="status">
          {summary}
        </p>
        <Collapse isOpen={idleLine !== null}>
          <p className={styles.hint}>{idleLine}</p>
        </Collapse>
      </div>
      <div className={styles.actions}>
        <AnimatePresence initial={false}>
          {hasConnections ? (
            <VjLiveFade key="toggle">
              <Button
                ref={toggleRef}
                variant="quiet"
                size="sm"
                aria-expanded={isListOpen}
                aria-controls={VJ_LIVE_LIST_ID}
                onClick={onToggleList}
              >
                {isListOpen ? (
                  <FiChevronUp aria-hidden="true" focusable="false" />
                ) : (
                  <FiChevronDown aria-hidden="true" focusable="false" />
                )}
                {isListOpen
                  ? t("vj:live.hideConnections")
                  : t("vj:live.showConnections")}
              </Button>
            </VjLiveFade>
          ) : null}
          {canStopEverything ? (
            <VjLiveFade key="stop">
              <Button
                variant="quiet"
                size="sm"
                className={styles.stopTrigger}
                onClick={onStopEverything}
              >
                <FiPower aria-hidden="true" fill="none" focusable="false" />
                {t("vj:live.stopEverything")}
              </Button>
            </VjLiveFade>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Live connections at the top of the VJ library: how many screens and remotes
 * are connected right now, the list of them by show with a Disconnect action
 * on each, and Stop everything, which frees the server's stages too. With
 * nothing connected and no show held it folds to one quiet line, and grows
 * back when something connects. Reads again every five seconds while the tab
 * is in view.
 */
export function VjLiveConnectionsPanel() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const liveQuery = useVjLive();
  const live = liveQuery.data ?? NOTHING_CONNECTED;
  const stopConnection = useStopVjLiveConnection();
  const panelRef = useRef<HTMLElement>(null);
  // Once the card has folded to the quiet line, a focused panel (after Stop
  // everything) may sit under the sticky top bar: bring it back into view.
  const bringFocusedPanelIntoView = () => {
    const panel = panelRef.current;
    if (panel === null || document.activeElement !== panel) return;
    panel.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };
  const toggleRef = useRef<HTMLButtonElement>(null);
  const shouldFocusPanelRef = useRef(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isConfirmingStop, setIsConfirmingStop] = useState(false);
  const readState: VjLiveReadState =
    liveQuery.data !== undefined
      ? "success"
      : liveQuery.isError
        ? "error"
        : "pending";
  const hasConnections = live.stages.length > 0;
  const isQuiet =
    readState === "pending" ||
    (readState === "success" && !hasConnections && live.idleStageCount === 0);
  const stoppingConnectionId = stopConnection.isPending
    ? (stopConnection.variables?.connectionId ?? null)
    : null;
  useClearStaleStopError(
    stopConnection.error,
    liveQuery.dataUpdatedAt,
    stopConnection.reset,
  );

  // Stop everything's button leaves with what it stopped, so once the dialog
  // starts to close focus lands on the panel itself.
  useEffect(() => {
    if (isConfirmingStop || !shouldFocusPanelRef.current) return;
    shouldFocusPanelRef.current = false;
    panelRef.current?.focus();
  }, [isConfirmingStop]);

  const disconnect = (connectionId: string) => {
    if (stopConnection.isPending) return;
    const neighbourId = vjLiveNeighbourConnectionIdOf(live, connectionId);
    stopConnection.mutate(
      { connectionId },
      {
        // The row leaves: focus goes to the next row's Disconnect, else the
        // previous one's, else Show connections, else the panel.
        onSuccess: () => {
          const panel = panelRef.current;
          if (panel === null) return;
          if (neighbourId === null) panel.focus();
          else if (!focusDisconnectOf(panel, neighbourId))
            (toggleRef.current ?? panel).focus();
        },
      },
    );
  };
  const toggleList = () => {
    stopConnection.reset();
    setIsListOpen((isOpen) => !isOpen);
  };

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={styles.panel}
      data-quiet={isQuiet || undefined}
      aria-labelledby={isQuiet ? undefined : VJ_LIVE_TITLE_ID}
      aria-label={isQuiet ? t("vj:live.title") : undefined}
    >
      <Collapse isOpen={isQuiet}>
        <p className={styles.quietLine} role="status">
          {readState === "pending"
            ? t("vj:live.summary.loading")
            : t("vj:live.quietLine")}
        </p>
      </Collapse>
      <Collapse isOpen={!isQuiet} onExitComplete={bringFocusedPanelIntoView}>
        <div className={styles.body}>
          <VjLiveHead
            live={live}
            readState={readState}
            isListOpen={isListOpen}
            toggleRef={toggleRef}
            onToggleList={toggleList}
            onStopEverything={() => setIsConfirmingStop(true)}
          />
          <Collapse isOpen={isListOpen && hasConnections}>
            <div id={VJ_LIVE_LIST_ID}>
              <VjLiveConnectionList
                stages={live.stages}
                now={liveQuery.dataUpdatedAt}
                stoppingConnectionId={stoppingConnectionId}
                onDisconnect={disconnect}
              />
            </div>
          </Collapse>
        </div>
      </Collapse>
      <VjReasonLine
        error={
          stopConnection.error ?? (liveQuery.isError ? liveQuery.error : null)
        }
      />
      <AnimatePresence>
        {isConfirmingStop ? (
          <VjLiveStopDialog
            key="stop-everything"
            onClose={() => setIsConfirmingStop(false)}
            onStopped={() => {
              shouldFocusPanelRef.current = true;
              setIsConfirmingStop(false);
            }}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
