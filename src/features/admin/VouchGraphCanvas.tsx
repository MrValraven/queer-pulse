import { useRef, type ReactNode } from 'react'
import { FiRotateCcw } from 'react-icons/fi'
import { useVouchCanvas } from './useVouchCanvas'
import { VouchGraphNode } from './VouchGraphNode'
import { VouchGraphTooltip } from './VouchGraphTooltip'
import {
  TONE,
  edgeWeight,
  isIsolated,
  neighbors,
  nodeRadius,
  personById,
  type SceneKey,
  type VouchEdge,
  type VouchTone,
} from './adminVouchGraph.data'
import { portrait } from './adminPeople.data'
import type { VouchMode } from './useVouchGraph'
import styles from './AdminVouchGraph.module.css'

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

const SCENE_TONE: Record<SceneKey, VouchTone> = {
  tf: 'jade',
  creatives: 'violet',
  nightlife: 'coral',
  newly: 'amber',
  elders: 'plum',
  ring: 'danger',
}

const HINTS: Record<VouchMode, string> = {
  plain: 'Drag to move · scroll to zoom · double-click to walk · shift-click two for a path',
  clusters: 'Scenes view: nodes coloured by the community each member belongs to.',
  safety: 'Safety view: rings, isolation and reports are surfaced. Red clusters are closed vouch loops.',
}

interface CanvasProps {
  visIds: string[]
  visEdges: VouchEdge[]
  focus: string
  mode: VouchMode
  sel: string | null
  pathNodes: Set<string>
  pathEdges: Set<string>
  search: string
  onSelect: (id: string | null) => void
  onRecenter: (id: string) => void
  onPickPath: (id: string) => void
  children?: ReactNode
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
  const stageRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const viewportRef = useRef<SVGGElement>(null)
  const c = useVouchCanvas({ visIds, visEdges, focus, cluster: mode === 'clusters', stageRef, svgRef, viewportRef, onSelect, onRecenter, onPickPath })
  const q = search.trim().toLowerCase()

  // hover, or a pinned selection, focuses the view on that member's ego-network
  const active = c.hoverId ?? sel
  const activeNodes = active ? new Set<string>([active, ...neighbors(active, true)]) : null

  return (
    <div className={styles.stage} ref={stageRef}>
      <svg ref={svgRef} className={styles.canvas} {...c.svgHandlers}>
        <defs>
          <pattern id="vgHatch" width={8} height={8} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width={8} height={8} fill="rgba(var(--plum-rgb), .06)" />
            <line x1={0} y1={0} x2={0} y2={8} stroke="rgba(var(--plum-rgb), .18)" strokeWidth={4} />
          </pattern>
          <clipPath id="vgClip30"><circle r={30} /></clipPath>
          <clipPath id="vgClip20"><circle r={20} /></clipPath>
          <clipPath id="vgClip15"><circle r={15} /></clipPath>
        </defs>
        <g ref={viewportRef}>
          <g>
            {visEdges.map((e) => {
              const base = e.withdrawn ? 1 : 0.8 + edgeWeight(e) * 2.2
              const onPath = pathEdges.has(e.id)
              const incident = !!active && (e.from === active || e.to === active)
              return (
                <path
                  key={e.id}
                  ref={(el) => c.registerEdge(e.id, el)}
                  fill="none"
                  className={cx(
                    styles.edge,
                    e.mutual && styles.mutual,
                    e.withdrawn && styles.withdrawn,
                    onPath && styles.onpath,
                    !onPath && active && incident && styles.edgeHi,
                    !onPath && active && !incident && styles.edgeDim,
                    !onPath && !active && (e.from === focus || e.to === focus) && styles.edgeFocus,
                  )}
                  strokeWidth={e.mutual ? base + 1 : base}
                  {...c.edgeHandlers(e)}
                />
              )
            })}
          </g>
          <g>
            {visIds.map((id) => {
              const p = personById[id]
              const isFocus = id === focus
              const radius = nodeRadius(id, focus)
              const ink = mode === 'clusters' ? TONE[SCENE_TONE[p.scene]] : TONE[p.tone]
              const fill = p.anon ? 'url(#vgHatch)' : ink.fill
              const matches = !q || p.name.toLowerCase().includes(q) || p.initials.toLowerCase().includes(q)
              const safety = mode === 'safety'
              const isolated = safety && p.scene !== 'ring' && isIsolated(id)
              const className = cx(
                styles.node,
                sel === id && styles.selected,
                safety && p.scene === 'ring' && styles.ring,
                isolated && styles.isolated,
                safety && p.scene !== 'ring' && !isolated && (!!p.reports || p.standing === 'flagged') && styles.reported,
                pathNodes.has(id) && styles.pathnode,
                q && !matches && styles.searchDim,
                q && matches && styles.searchHit,
                activeNodes && !activeNodes.has(id) && styles.dim,
              )
              return (
                <VouchGraphNode
                  key={id}
                  person={p}
                  radius={radius}
                  isFocus={isFocus}
                  fill={fill}
                  stroke={ink.stroke}
                  photo={portrait(p.name)}
                  className={className}
                  nodeRef={(el) => c.registerNode(id, el)}
                  {...c.nodeHandlers(id)}
                />
              )
            })}
          </g>
        </g>
      </svg>

      {c.tip && <VouchGraphTooltip tip={c.tip.data} x={c.tip.x} y={c.tip.y} />}
      {children}

      <div className={styles.zoom}>
        <button type="button" onClick={() => c.zoomCenter(1.25)} aria-label="Zoom in">+</button>
        <button type="button" onClick={() => c.zoomCenter(0.8)} aria-label="Zoom out">−</button>
        <button type="button" onClick={c.fit} aria-label="Fit to view">⊡</button>
        <button
          type="button"
          onClick={c.reset}
          className={c.hasPins ? styles.zoomActive : undefined}
          aria-label="Reset layout"
          title="Reset layout"
        >
          <FiRotateCcw aria-hidden />
        </button>
      </div>
      <p className={styles.hint}>{HINTS[mode]}</p>
    </div>
  )
}
