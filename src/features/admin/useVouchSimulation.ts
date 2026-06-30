import { useCallback, useEffect, useRef } from "react";
import {
  SCENE_ANCHOR,
  personById,
  type VouchEdge,
} from "./adminVouchGraph.data";

export interface NodePos {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface RunArgs {
  visIds: string[];
  edges: VouchEdge[];
  focusId: string;
  /** how strongly nodes are pulled toward their community sector */
  clusterStrength?: number;
  /** nodes the user has dragged into place — the layout leaves these fixed */
  pinned?: Set<string>;
  /** called after every physics step so the caller can paint the DOM imperatively */
  paint: () => void;
  /** called once the layout has settled (caller fits the view) */
  onSettled?: () => void;
}

const TICKS = 140;
const PRESETTLE = 150;

/**
 * Force-directed layout for the trust network. Positions live in a ref and are
 * mutated in place each frame; the caller paints them onto SVG nodes/edges via
 * `paint` (transform/opacity only). Under reduced motion the graph is laid out
 * statically in a single pass — no rAF loop, no movement.
 */
export function useVouchSimulation(reduced: boolean) {
  const posRef = useRef<Map<string, NodePos>>(new Map());
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const getPos = useCallback((id: string) => posRef.current.get(id), []);

  const setPos = useCallback((id: string, x: number, y: number) => {
    const p = posRef.current.get(id);
    if (p) {
      p.x = x;
      p.y = y;
      p.vx = 0;
      p.vy = 0;
    }
  }, []);

  /** drop cached positions so the next run lays the graph out fresh */
  const clearPositions = useCallback(() => posRef.current.clear(), []);

  const run = useCallback(
    ({
      visIds,
      edges,
      focusId,
      clusterStrength = 0.014,
      pinned,
      paint,
      onSettled,
    }: RunArgs) => {
      stop();
      const pos = posRef.current;
      const n = visIds.length;

      // seed positions: focus pinned at origin, newcomers near their community sector
      visIds.forEach((id) => {
        const existing = pos.get(id);
        if (!existing) {
          if (id === focusId) {
            pos.set(id, { x: 0, y: 0, vx: 0, vy: 0 });
          } else {
            const anchor = SCENE_ANCHOR[personById[id]!.scene];
            pos.set(id, {
              x: anchor.x + (Math.random() * 70 - 35),
              y: anchor.y + (Math.random() * 70 - 35),
              vx: 0,
              vy: 0,
            });
          }
        } else {
          existing.vx = 0;
          existing.vy = 0;
        }
      });
      const f = pos.get(focusId);
      if (f) {
        f.x = 0;
        f.y = 0;
      }

      const physics = () => {
        // repulsion between every visible pair
        for (let a = 0; a < n; a++) {
          for (let b = a + 1; b < n; b++) {
            const pa = pos.get(visIds[a]!)!;
            const pb = pos.get(visIds[b]!)!;
            const dx = pa.x - pb.x;
            const dy = pa.y - pb.y;
            const d2 = dx * dx + dy * dy + 0.01;
            const d = Math.sqrt(d2);
            const force = 4200 / d2;
            const fx = (dx / d) * force;
            const fy = (dy / d) * force;
            pa.vx += fx;
            pa.vy += fy;
            pb.vx -= fx;
            pb.vy -= fy;
          }
        }
        // spring along each edge
        for (const e of edges) {
          const pa = pos.get(e.from);
          const pb = pos.get(e.to);
          if (!pa || !pb) continue;
          const len = e.mutual ? 150 : 175;
          const dx = pb.x - pa.x;
          const dy = pb.y - pa.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
          const force = (d - len) * 0.018;
          const fx = (dx / d) * force;
          const fy = (dy / d) * force;
          pa.vx += fx;
          pa.vy += fy;
          pb.vx -= fx;
          pb.vy -= fy;
        }
        // integrate (focus stays pinned, dragged nodes are held by the caller)
        for (const id of visIds) {
          const p = pos.get(id)!;
          if (id === focusId) {
            p.x = 0;
            p.y = 0;
            p.vx = 0;
            p.vy = 0;
            continue;
          }
          if (pinned?.has(id)) {
            // user dropped this node here — hold it still
            p.vx = 0;
            p.vy = 0;
            continue;
          }
          // pull toward the member's community sector instead of the centre
          const anchor = SCENE_ANCHOR[personById[id]!.scene];
          p.vx += (anchor.x - p.x) * clusterStrength;
          p.vy += (anchor.y - p.y) * clusterStrength;
          p.vx *= 0.86;
          p.vy *= 0.86;
          p.x += p.vx;
          p.y += p.vy;
        }
      };

      if (reduced) {
        // static layout grouped by community sector — no motion
        const sceneIndex: Record<string, number> = {};
        for (const id of visIds) {
          const p = pos.get(id)!;
          if (id === focusId) {
            p.x = 0;
            p.y = 0;
            continue;
          }
          if (pinned?.has(id)) continue; // keep a dropped node where it is
          const scene = personById[id]!.scene;
          const anchor = SCENE_ANCHOR[scene];
          const k = sceneIndex[scene] ?? 0;
          sceneIndex[scene] = k + 1;
          p.x = anchor.x + Math.cos(k * 1.7) * (24 + k * 10);
          p.y = anchor.y + Math.sin(k * 1.7) * (24 + k * 10);
        }
        paint();
        onSettled?.();
        return;
      }

      // pre-settle synchronously so the first painted frame is already spread out
      for (let s = 0; s < PRESETTLE; s++) physics();
      paint();
      onSettled?.();

      let ticks = 0;
      const step = () => {
        ticks++;
        physics();
        paint();
        if (ticks < TICKS) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          onSettled?.();
        }
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [reduced, stop],
  );

  return { getPos, setPos, clearPositions, run, stop };
}
