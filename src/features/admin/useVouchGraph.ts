import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const [focus, setFocus] = useState(initialFocus);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<VouchMode>("plain");
  const [timeCut, setTimeCut] = useState(graph.tMax);
  const [sel, setSel] = useState<string | null>(initialFocus);
  const [pathA, setPathA] = useState<string | null>(null);
  const [pathB, setPathB] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [crumbs, setCrumbs] = useState<string[]>([]);
  const [replaying, setReplaying] = useState(false);
  const replayRef = useRef<number | null>(null);

  const expandedKey = useMemo(() => [...expanded].sort().join(","), [expanded]);

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
    // time filter: a node stays if it is the focus or has any edge within the cut
    const ids = [...set].filter(
      (id) =>
        id === focus ||
        graph.edges.some(
          (e) => (e.from === id || e.to === id) && ymValue(e.date) <= timeCut,
        ),
    );
    const idSet = new Set(ids);
    const edges: VouchEdge[] = graph.edges.filter(
      (e) => idSet.has(e.from) && idSet.has(e.to) && ymValue(e.date) <= timeCut,
    );
    return { visIds: ids, visEdges: edges };
    // expandedKey stands in for the Set's contents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, focus, expandedKey, mode, timeCut]);

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
    setReplaying(true);
    setTimeCut(graph.tMin);
    let v = graph.tMin;
    replayRef.current = window.setInterval(() => {
      v += 1;
      setTimeCut(v);
      if (v >= graph.tMax) stopReplay();
    }, REPLAY_STEP_MS);
  }, [graph, stopReplay]);

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
