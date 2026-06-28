import styles from './AdminVouchGraph.module.css'

export type TipData =
  | {
      kind: 'node'
      name: string
      pronoun: string
      role: string
      vouchesIn: number
      vouchesOut: number
      joined: string
    }
  | {
      kind: 'edge'
      label: string
      tag?: string
      reason?: string
      date: string
      withdrawn?: boolean
    }

interface Props {
  tip: TipData
  x: number
  y: number
}

/** Floating, cursor-following tooltip for nodes and edges. Pointer-events: none. */
export function VouchGraphTooltip({ tip, x, y }: Props) {
  return (
    <div className={styles.tip} style={{ left: x, top: y }} role="tooltip">
      {tip.kind === 'node' ? (
        <>
          <div className={styles.tipName}>
            {tip.name} <span>{tip.pronoun}</span>
          </div>
          <div className={styles.tipRole}>{tip.role}</div>
          <div className={styles.tipMeta}>
            <b>{tip.vouchesIn}</b> vouch{tip.vouchesIn !== 1 ? 'es' : ''} in · <b>{tip.vouchesOut}</b>{' '}
            out · joined {tip.joined}
          </div>
          <div className={styles.tipHint}>click to inspect · double-click to re-centre</div>
        </>
      ) : (
        <>
          <div className={styles.tipName}>{tip.label}</div>
          {tip.tag && <div className={styles.tipTag}>{tip.tag}</div>}
          {tip.reason && <div className={styles.tipRole}>“{tip.reason}”</div>}
          <div className={tip.withdrawn ? styles.tipMetaWd : styles.tipMeta}>
            {tip.withdrawn ? `withdrawn ${tip.date}` : tip.date}
          </div>
        </>
      )}
    </div>
  )
}
