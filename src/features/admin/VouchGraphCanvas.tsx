import { useRef, type ReactNode } from "react";
import { FiMaximize, FiRotateCcw, FiMinus, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { TONE } from "./trustGraph/trustGraphModel";
import type { VouchEdge } from "./trustGraph/trustGraphModel";
import { useVouchCanvas } from "./useVouchCanvas";
import { VouchGraphNode } from "./VouchGraphNode";
import { VouchGraphTooltip } from "./VouchGraphTooltip";
import type { VouchMode } from "./useVouchGraph";
import styles from "./AdminVouchGraph.module.css";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

/** `admin:vouchGraph.canvas.hint.*` catalog keys, resolved with `t()`. */
const HINT_KEYS: Record<VouchMode, string> = {
  plain: "vouchGraph.canvas.hint.plain",
  clusters: "vouchGraph.canvas.hint.clusters",
  safety: "vouchGraph.canvas.hint.safety",
};

interface CanvasProps {
  visIds: string[];
  visEdges: VouchEdge[];
  focus: string;
  mode: VouchMode;
  sel: string | null;
  pathNodes: Set<string>;
  pathEdges: Set<string>;
  search: string;
  onSelect: (id: string | null) => void;
  onRecenter: (id: string) => void;
  onPickPath: (id: string) => void;
  children?: ReactNode;
}

export function VouchGraphCanvas({
  visIds,
  visEdges,
  focus,
  mode,
  sel,
  pathNodes,
  pathEdges,
  search,
  onSelect,
  onRecenter,
  onPickPath,
  children,
}: CanvasProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<SVGGElement>(null);
  const c = useVouchCanvas({
    visIds,
    visEdges,
    focus,
    cluster: mode === "clusters",
    graph,
    stageRef,
    svgRef,
    viewportRef,
    onSelect,
    onRecenter,
    onPickPath,
  });
  const q = search.trim().toLowerCase();

  // hover, or a pinned selection, focuses the view on that member's ego-network
  const active = c.hoverId ?? sel;
  const activeNodes = active
    ? new Set<string>([active, ...graph.neighbors(active, true)])
    : null;

  return (
    <div className={styles.stage} ref={stageRef}>
      <svg ref={svgRef} className={styles.canvas} {...c.svgHandlers}>
        <defs>
          <pattern
            id="vgHatch"
            width={8}
            height={8}
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <rect width={8} height={8} fill="rgba(var(--plum-rgb), .06)" />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={8}
              stroke="rgba(var(--plum-rgb), .18)"
              strokeWidth={4}
            />
          </pattern>
          <clipPath id="vgClip30">
            <circle r={30} />
          </clipPath>
          <clipPath id="vgClip20">
            <circle r={20} />
          </clipPath>
          <clipPath id="vgClip15">
            <circle r={15} />
          </clipPath>
        </defs>
        <g ref={viewportRef}>
          <g>
            {visEdges.map((e) => {
              const base = e.withdrawn ? 1 : 0.8 + graph.edgeWeight(e) * 2.2;
              const onPath = pathEdges.has(e.id);
              const incident =
                !!active && (e.from === active || e.to === active);
              return (
                <path
                  key={e.id}
                  ref={(el) => c.registerEdge(e.id, el)}
                  fill="none"
                  className={cx(
                    styles.edge,
                    e.kind === "invite" && styles.invite,
                    e.mutual && styles.mutual,
                    e.withdrawn && styles.withdrawn,
                    onPath && styles.onpath,
                    !onPath && active && incident && styles.edgeHi,
                    !onPath && active && !incident && styles.edgeDim,
                    !onPath &&
                      !active &&
                      (e.from === focus || e.to === focus) &&
                      styles.edgeFocus,
                  )}
                  strokeWidth={e.mutual ? base + 1 : base}
                  {...c.edgeHandlers(e)}
                />
              );
            })}
          </g>
          <g>
            {visIds.map((id) => {
              const p = graph.peopleById[id]!;
              const isFocus = id === focus;
              const radius = graph.nodeRadius(id, focus);
              const ink = TONE[p.tone];
              const fill =
                mode === "clusters"
                  ? (graph.scenes.find((s) => s.id === p.sceneId)?.color ??
                    ink.fill)
                  : ink.fill;
              const matches =
                !q ||
                p.name.toLowerCase().includes(q) ||
                p.initials.toLowerCase().includes(q);
              const safety = mode === "safety";
              // ADM-23: real cycle detection (`inRing`) — not
              // `standing === "flagged"`, which also covers
              // suspended/frozen/high-report-count members who aren't
              // necessarily part of a self-vouching ring.
              const inRing = !!p.inRing;
              // Ring nodes keep their red "ring" halo — don't also paint them
              // with the amber "isolated" halo, which (declared later in the
              // CSS) would override and hide the ring signal.
              const isolated = safety && !inRing && graph.isIsolated(id);
              const className = cx(
                styles.node,
                sel === id && styles.selected,
                safety && inRing && styles.ring,
                isolated && styles.isolated,
                safety &&
                  !inRing &&
                  !isolated &&
                  !!p.reports &&
                  styles.reported,
                pathNodes.has(id) && styles.pathnode,
                q && !matches && styles.searchDim,
                q && matches && styles.searchHit,
                activeNodes && !activeNodes.has(id) && styles.dim,
              );
              return (
                <VouchGraphNode
                  key={id}
                  person={p}
                  radius={radius}
                  isFocus={isFocus}
                  fill={fill}
                  stroke={ink.stroke}
                  photo={p.avatarUrl ?? undefined}
                  className={className}
                  nodeRef={(el) => c.registerNode(id, el)}
                  {...c.nodeHandlers(id)}
                />
              );
            })}
          </g>
        </g>
      </svg>

      {c.tip && <VouchGraphTooltip tip={c.tip.data} x={c.tip.x} y={c.tip.y} />}
      {children}

      <div className={styles.zoom}>
        <button
          type="button"
          onClick={() => c.zoomCenter(1.25)}
          aria-label={t("admin:vouchGraph.canvas.zoomIn")}
        >
          <FiPlus aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => c.zoomCenter(0.8)}
          aria-label={t("admin:vouchGraph.canvas.zoomOut")}
        >
          <FiMinus aria-hidden />
        </button>
        <button
          type="button"
          onClick={c.fit}
          aria-label={t("admin:vouchGraph.canvas.fitToView")}
        >
          <FiMaximize aria-hidden />
        </button>
        <button
          type="button"
          onClick={c.reset}
          className={c.hasPins ? styles.zoomActive : undefined}
          aria-label={t("admin:vouchGraph.canvas.resetLayout")}
          title={t("admin:vouchGraph.canvas.resetLayout")}
        >
          <FiRotateCcw aria-hidden />
        </button>
      </div>
      <p className={styles.hint}>{t(`admin:${HINT_KEYS[mode]}`)}</p>
    </div>
  );
}
