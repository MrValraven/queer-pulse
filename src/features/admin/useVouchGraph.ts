import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  EDGES,
  PEOPLE,
  T_MAX,
  T_MIN,
  findEdge,
  isIsolated,
  neighbors,
  personById,
  shortestPath,
  ym,
  type VouchEdge,
} from "./adminVouchGraph.data";

export type VouchMode = "plain" | "clusters" | "safety";

const REPLAY_STEP_MS = 130;

/**
 * All view state for the trust-network modal: focus, expanded neighbourhoods,
 * overlay mode, time cut-off, selection, the two-point trust path, search, and
 * the re-centre breadcrumb trail. Derives the visible node/edge sets.
 */
export function useVouchGraph(initialFocus: string) {
  const { showToast } = useToast();

  const [focus, setFocus] = useState(initialFocus);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<VouchMode>("plain");
  const [timeCut, setTimeCut] = useState(T_MAX);
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
    neighbors(focus, true).forEach((n) => set.add(n));
    expanded.forEach((id) => neighbors(id, true).forEach((n) => set.add(n)));
    if (mode === "safety") {
      PEOPLE.forEach((p) => {
        if (p.scene === "ring" || p.standing === "flagged" || isIsolated(p.id))
          set.add(p.id);
      });
      [...set].forEach((id) => neighbors(id, true).forEach((n) => set.add(n)));
    }
    // time filter: a node stays if it is the focus or has any edge within the cut
    const ids = [...set].filter(
      (id) =>
        id === focus ||
        EDGES.some(
          (e) => (e.from === id || e.to === id) && ym(e.date) <= timeCut,
        ),
    );
    const idSet = new Set(ids);
    const edges: VouchEdge[] = EDGES.filter(
      (e) => idSet.has(e.from) && idSet.has(e.to) && ym(e.date) <= timeCut,
    );
    return { visIds: ids, visEdges: edges };
    // expandedKey stands in for the Set's contents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, expandedKey, mode, timeCut]);

  const { pathNodes, pathEdges } = useMemo(() => {
    const nodes = new Set<string>();
    const edges = new Set<string>();
    if (pathA && pathB) {
      const path = shortestPath(pathA, pathB);
      if (path) {
        path.forEach((id, i) => {
          nodes.add(id);
          if (i > 0) {
            const e = findEdge(path[i - 1]!, path[i]!);
            if (e) edges.add(e.id);
          }
        });
      }
    }
    return { pathNodes: nodes, pathEdges: edges };
  }, [pathA, pathB]);

  const select = useCallback((id: string | null) => setSel(id), []);

  const recenter = useCallback(
    (id: string) => {
      if (personById[id]?.private) {
        showToast("This member keeps their network private", "info");
        return;
      }
      setCrumbs((c) => [...c, focus]);
      setFocus(id);
      setExpanded(new Set());
      setSel(id);
    },
    [focus, showToast],
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
    setTimeCut(T_MIN);
    let v = T_MIN;
    replayRef.current = window.setInterval(() => {
      v += 1;
      setTimeCut(v);
      if (v >= T_MAX) stopReplay();
    }, REPLAY_STEP_MS);
  }, [stopReplay]);

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
