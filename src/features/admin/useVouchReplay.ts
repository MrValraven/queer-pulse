import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ymValue, type TrustGraph } from "./trustGraph/trustGraphModel";

const REPLAY_STEP_MS = 130;

/**
 * The time cut-off and replay of the trust-network modal. `timeCut` is a
 * *step index* 0…eventCount: how many connection events are revealed. 0 = just
 * the focus node, before anyone connected; eventCount = the whole network.
 * Starts fully revealed.
 */
export function useVouchReplay(graph: TrustGraph) {
  const [timeCut, setTimeCut] = useState(graph.edges.length);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayRef = useRef<number | null>(null);

  /**
   * Every connection as its own event, in true chronological order: one entry
   * per edge (each edge is one real invite/vouch act), sorted by month then by
   * the edge's original position so same-month connections keep a stable,
   * deterministic sequence. Replay walks this list one step at a time, evenly
   * spaced by *event* (calendar distance plays no part), so people who joined
   * in the same month appear as separate, ordered steps and empty months never
   * stretch the timeline. (In live mode the adapter emits edges
   * pre-sorted by full `createdAt`, so original order is real within-month
   * order too.)
   */
  const events = useMemo(() => {
    return graph.edges
      .map((edge, index) => ({ edge, index }))
      .sort((firstEntry, secondEntry) => {
        const delta =
          ymValue(firstEntry.edge.date) - ymValue(secondEntry.edge.date);
        return delta !== 0 ? delta : firstEntry.index - secondEntry.index;
      })
      .map((entry) => entry.edge);
  }, [graph]);
  const eventCount = events.length;
  const eventIndexById = useMemo(() => {
    const map = new Map<string, number>();
    events.forEach((edge, index) => map.set(edge.id, index));
    return map;
  }, [events]);

  /** The connection revealed by the current step (the most recent event), or
   *  null at step 0 (before anyone connected). Drives the footer label and the
   *  inspector-row highlight. */
  const currentEvent = timeCut > 0 ? (events[timeCut - 1] ?? null) : null;

  /** A7: every connection is revealed (the resting state outside a replay
   *  or a scrub), so the footer reads as the whole network. */
  const isFullyRevealed = timeCut === eventCount;

  /** An edge is revealed once its step is reached. */
  const isEdgeRevealed = useCallback(
    (edgeId: string) => (eventIndexById.get(edgeId) ?? -1) < timeCut,
    [eventIndexById, timeCut],
  );

  const stopReplay = useCallback(() => {
    if (replayRef.current !== null) {
      clearInterval(replayRef.current);
      replayRef.current = null;
    }
    setIsReplaying(false);
  }, []);

  const replay = useCallback(() => {
    if (replayRef.current !== null) return;
    if (eventCount === 0) return;
    setIsReplaying(true);
    setTimeCut(0); // start before anyone connected
    let step = 0;
    replayRef.current = window.setInterval(() => {
      step += 1;
      setTimeCut(step);
      if (step >= eventCount) stopReplay();
    }, REPLAY_STEP_MS);
  }, [eventCount, stopReplay]);

  useEffect(() => stopReplay, [stopReplay]);

  return {
    events,
    eventCount,
    eventIndexById,
    timeCut,
    setTimeCut,
    replay,
    stopReplay,
    isReplaying,
    currentEvent,
    isFullyRevealed,
    isEdgeRevealed,
  };
}
