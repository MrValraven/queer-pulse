import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ymValue,
  type TrustGraph,
  type VouchEdge,
} from "./trustGraph/trustGraphModel";

export type VouchMode = "plain" | "clusters" | "safety";

const REPLAY_STEP_MS = 130;

/**
 * All view state for the trust-network modal: focus, expanded neighbourhoods,
 * overlay mode, time cut-off, selection, the two-point trust path, search, and
 * the re-centre breadcrumb trail. Derives the visible node/edge sets from the
 * fetched `graph` (demo fixture or live `/admin/trust-network` data).
 */
export function useVouchGraph(graph: TrustGraph, initialFocus: string) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  // On a phone the inspector is a bottom sheet (see the `@media (max-width:
  // 920px)` block in AdminVouchGraph.module.css), so pre-selecting the focus
  // node would open that sheet over the whole graph the moment the modal opens.
  // Start with nothing selected on narrow viewports so the graph is visible and
  // the sheet only surfaces once a node is tapped; keep the desktop right rail
  // pre-focused on the member the modal was opened for.
  const isNarrow = useMediaQuery("(max-width: 920px)");

  const [focus, setFocus] = useState(initialFocus);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<VouchMode>("plain");
  // `timeCut` is a *step index* 0…eventCount: how many connection events are
  // revealed. 0 = just the focus node, before anyone connected; eventCount =
  // the whole network. Starts fully revealed.
  const [timeCut, setTimeCut] = useState(graph.edges.length);
  const [sel, setSel] = useState<string | null>(isNarrow ? null : initialFocus);
  const [pathA, setPathA] = useState<string | null>(null);
  const [pathB, setPathB] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [crumbs, setCrumbs] = useState<string[]>([]);
  const [replaying, setReplaying] = useState(false);
  const replayRef = useRef<number | null>(null);

  const expandedKey = useMemo(() => [...expanded].sort().join(","), [expanded]);

  /**
   * Every connection as its own event, in true chronological order: one entry
   * per edge (each edge is one real invite/vouch act), sorted by month then by
   * the edge's original position so same-month connections keep a stable,
   * deterministic sequence. Replay walks this list one step at a time — evenly
   * spaced by *event*, not by calendar distance — so people who joined in the
   * same month appear as separate, ordered steps instead of one lump, and empty
   * months never stretch the timeline. (In live mode the adapter emits edges
   * pre-sorted by full `createdAt`, so original order is real within-month
   * order too.)
   */
  const events = useMemo(() => {
    return graph.edges
      .map((edge, index) => ({ edge, index }))
      .sort((a, b) => {
        const delta = ymValue(a.edge.date) - ymValue(b.edge.date);
        return delta !== 0 ? delta : a.index - b.index;
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

  const { visIds, visEdges } = useMemo(() => {
    const set = new Set<string>([focus]);
    graph.neighbors(focus, true).forEach((n) => set.add(n));
    expanded.forEach((id) =>
      graph.neighbors(id, true).forEach((n) => set.add(n)),
    );
    if (mode === "safety") {
      graph.people.forEach((p) => {
        if (p.standing === "flagged" || graph.isIsolated(p.id)) set.add(p.id);
      });
      [...set].forEach((id) =>
        graph.neighbors(id, true).forEach((n) => set.add(n)),
      );
    }
    // time filter: an edge is revealed once its step is reached; a node stays if
    // it is the focus or has any revealed edge.
    const isRevealed = (edge: VouchEdge) =>
      (eventIndexById.get(edge.id) ?? -1) < timeCut;
    const ids = [...set].filter(
      (id) =>
        id === focus ||
        graph.edges.some((e) => (e.from === id || e.to === id) && isRevealed(e)),
    );
    const idSet = new Set(ids);
    const edges: VouchEdge[] = graph.edges.filter(
      (e) => idSet.has(e.from) && idSet.has(e.to) && isRevealed(e),
    );
    return { visIds: ids, visEdges: edges };
    // expandedKey stands in for the Set's contents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, focus, expandedKey, mode, timeCut, eventIndexById]);

  const { pathNodes, pathEdges } = useMemo(() => {
    const nodes = new Set<string>();
    const edges = new Set<string>();
    if (pathA && pathB) {
      const path = graph.shortestPath(pathA, pathB);
      if (path) {
        path.forEach((id, i) => {
          nodes.add(id);
          if (i > 0) {
            const e = graph.findEdge(path[i - 1]!, path[i]!);
            if (e) edges.add(e.id);
          }
        });
      }
    }
    return { pathNodes: nodes, pathEdges: edges };
  }, [graph, pathA, pathB]);

  const select = useCallback((id: string | null) => setSel(id), []);

  const recenter = useCallback(
    (id: string) => {
      if (graph.peopleById[id]?.private) {
        showToast(t("admin:vouchGraph.modal.privateToast"), "info");
        return;
      }
      setCrumbs((c) => [...c, focus]);
      setFocus(id);
      setExpanded(new Set());
      setSel(id);
    },
    [focus, graph, showToast, t],
  );

  const gotoCrumb = useCallback((index: number) => {
    setCrumbs((c) => {
      const target = c[index];
      if (target !== undefined) {
        setFocus(target);
        setExpanded(new Set());
        setSel(target);
      }
      return c.slice(0, index);
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onPickPath = useCallback(
    (id: string) => {
      if (!pathA) {
        setPathA(id);
        setPathB(null);
      } else if (!pathB) {
        setPathB(id);
      } else {
        setPathA(id);
        setPathB(null);
      }
    },
    [pathA, pathB],
  );

  const clearPath = useCallback(() => {
    setPathA(null);
    setPathB(null);
  }, []);

  const changeMode = useCallback((m: VouchMode) => setMode(m), []);

  const stopReplay = useCallback(() => {
    if (replayRef.current !== null) {
      clearInterval(replayRef.current);
      replayRef.current = null;
    }
    setReplaying(false);
  }, []);

  const replay = useCallback(() => {
    if (replayRef.current !== null) return;
    if (eventCount === 0) return;
    setReplaying(true);
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
    focus,
    mode,
    timeCut,
    sel,
    pathA,
    pathB,
    search,
    crumbs,
    expanded,
    replaying,
    eventCount,
    currentEvent,
    activeEdgeId: currentEvent?.id ?? null,
    visIds,
    visEdges,
    pathNodes,
    pathEdges,
    setSearch,
    setTime: setTimeCut,
    select,
    recenter,
    gotoCrumb,
    toggleExpand,
    pickPath: onPickPath,
    clearPath,
    changeMode,
    replay,
    stopReplay,
  };
}
