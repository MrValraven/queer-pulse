import { useState } from 'react'
import { VOUCH_NODES, VOUCH_EDGES } from './adminMembers.data'
import styles from './AdminMembersPage.module.css'

interface Props {
  onSelectMember: (id: string) => void
}

const COHORT_CLASS: Record<number, string> = {
  2023: styles.cohort2023,
  2024: styles.cohort2024,
  2025: styles.cohort2025,
}

const NODE_RADIUS = 3.8

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Lookup map for node positions by id — computed once from module-level data */
const NODE_MAP: Record<string, { x: number; y: number }> = (() => {
  const map: Record<string, { x: number; y: number }> = {}
  for (const n of VOUCH_NODES) map[n.id] = { x: n.x, y: n.y }
  return map
})()

export function AdminVouchGraph({ onSelectMember }: Props) {
  const [zoom, setZoom] = useState(1)
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()

  function changeZoom(delta: number) {
    setZoom((z) => clamp(z + delta, 0.6, 1.8))
  }

  function isHighlighted(label: string): boolean {
    return query.length >= 2 && label.toLowerCase().includes(query)
  }

  return (
    <div className={styles.graphWrap}>
      <div className={styles.graphControls}>
        <input
          className={styles.graphSearch}
          placeholder="Search node…"
          aria-label="Search vouch graph nodes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className={styles.zoomBtn}
          aria-label="Zoom out"
          onClick={() => changeZoom(-0.2)}
        >
          −
        </button>
        <button
          type="button"
          className={styles.zoomBtn}
          aria-label="Zoom in"
          onClick={() => changeZoom(0.2)}
        >
          +
        </button>
      </div>

      <svg
        viewBox="0 0 100 66"
        className={styles.graphSvg}
        aria-label="Vouch network graph"
        role="img"
      >
        <g transform={`scale(${zoom})`} style={{ transformOrigin: '50px 33px' }}>
          {/* Edges drawn first */}
          {VOUCH_EDGES.map((edge) => {
            const from = NODE_MAP[edge.from]
            const to = NODE_MAP[edge.to]
            if (!from || !to) return null
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                className={styles.edge}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
              />
            )
          })}

          {/* Nodes */}
          {VOUCH_NODES.map((node) => {
            const highlighted = isHighlighted(node.label)
            const isolated = node.vouches === 0
            const cohortClass = COHORT_CLASS[node.cohort] ?? ''

            const nodeClasses = [
              styles.node,
              highlighted ? styles.nodeHighlight : '',
            ]
              .filter(Boolean)
              .join(' ')

            const circleClasses = [
              styles.nodeCircle,
              cohortClass,
              isolated ? styles.nodeIsolated : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <g
                key={node.id}
                className={nodeClasses}
                onClick={() => onSelectMember(node.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectMember(node.id)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${node.label}${isolated ? ' — isolated, no vouches' : ''}`}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  className={circleClasses}
                />
                <text
                  x={node.x}
                  y={node.y + NODE_RADIUS + 2.8}
                  className={styles.nodeLabel}
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
