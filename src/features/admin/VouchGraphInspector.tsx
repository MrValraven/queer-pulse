import { FiLock, FiUser } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import {
  EDGES,
  TONE,
  fmtMonth,
  isIsolated,
  personById,
  type VouchEdge,
  type VouchTone,
} from './adminVouchGraph.data'
import styles from './AdminVouchGraph.module.css'

interface Props {
  sel: string | null
  expanded: boolean
  onGo: (id: string) => void
  onVerify: (id: string) => void
  onExpand: (id: string) => void
  onCite: (id: string) => void
}

function VAvatar({ initials, tone, className }: { initials: string; tone: VouchTone; className: string }) {
  const ink = TONE[tone]
  return (
    <span className={className} style={{ background: ink.fill, color: ink.stroke }}>
      {initials}
    </span>
  )
}

function Banner({ kind, title, body }: { kind: string; title: string; body: string }) {
  return (
    <div className={`${styles.flag} ${styles[`flag_${kind}`]}`}>
      <b>{title}</b>
      <span>{body}</span>
    </div>
  )
}

function VouchList({ title, edges, selId, onGo }: { title: string; edges: VouchEdge[]; selId: string; onGo: (id: string) => void }) {
  return (
    <div className={styles.insSec}>
      <div className={styles.insT}>{title}</div>
      {edges.length === 0 ? (
        <div className={styles.insNone}>None yet.</div>
      ) : (
        edges.map((e) => {
          const otherId = e.from === selId ? e.to : e.from
          const o = personById[otherId]!
          return (
            <button
              key={e.id}
              type="button"
              className={`${styles.insRow}${e.withdrawn ? ` ${styles.insRowWd}` : ''}`}
              onClick={() => onGo(otherId)}
            >
              <VAvatar initials={o.initials} tone={o.tone} className={styles.mini!} />
              <span className={styles.insRowTx}>
                <span className={styles.rn}>
                  {o.name}
                  {e.mutual && <span className={styles.mut}>mutual</span>}
                  {e.tag && <span className={styles.tag}>{e.tag}</span>}
                </span>
                {e.reason && <span className={styles.rr}>“{e.reason}”</span>}
              </span>
            </button>
          )
        })
      )}
    </div>
  )
}

export function VouchGraphInspector({ sel, expanded, onGo, onVerify, onExpand, onCite }: Props) {
  if (!sel) {
    return (
      <aside className={styles.inspector}>
        <div className={styles.insEmpty}>
          <span className={styles.insEmptyIc}><FiUser aria-hidden /></span>
          <h4>Pick anyone</h4>
          <p>Click a node to read who trusts them and what that trust is built on. Double-click to walk the network from there.</p>
        </div>
      </aside>
    )
  }

  const p = personById[sel]!
  const first = p.name.split(' ')[0]
  const vouchedBy = EDGES.filter((e) => e.to === sel && !e.withdrawn)
  const vouchedFor = EDGES.filter((e) => e.from === sel && !e.withdrawn)
  const withdrawn = EDGES.filter((e) => (e.to === sel || e.from === sel) && e.withdrawn)
  const iso = isIsolated(sel)
  const pendingAffected = vouchedFor.some((e) => personById[e.to]!.standing === 'new')

  return (
    <aside className={styles.inspector}>
      <div className={styles.insHead}>
        <VAvatar initials={p.initials} tone={p.tone} className={styles.insAv!} />
        <div>
          <div className={styles.insN}>{p.name}</div>
          <div className={styles.insP}><span className={styles.pron}>{p.pronoun}</span> · {p.role}</div>
        </div>
      </div>

      <div className={styles.sealed}>
        <FiLock aria-hidden /> Legacy identity sealed — chosen name only
      </div>

      {p.scene === 'ring' && <Banner kind="danger" title="Part of a suspected vouch ring" body="Five accounts created within an hour, vouching only for each other — a closed loop with no outside trust." />}
      {iso && <Banner kind="amber" title="Trust isolation" body="Every vouch this member holds comes from new or flagged accounts. Verify with extra care." />}
      {!!p.reports && <Banner kind="coral" title={`${p.reports} report${p.reports > 1 ? 's' : ''} on record`} body="Open the member’s moderation history before acting." />}
      {p.private && <Banner kind="plum" title="Network kept private" body="This member has chosen to hide their vouch graph. Respect it — don’t work around it." />}
      {p.anon && <Banner kind="plum" title="Identity shielded" body="An anonymous voucher. Their identity is protected and cannot be revealed." />}

      <div className={styles.insStats}>
        <div className={styles.stat}><div className={styles.statV}>{vouchedBy.length}</div><div className={styles.statL}>vouches in</div></div>
        <div className={styles.stat}><div className={styles.statV}>{vouchedFor.length}</div><div className={styles.statL}>vouches out</div></div>
        <div className={styles.stat}><div className={styles.statV}>{fmtMonth(p.joined)}</div><div className={styles.statL}>joined</div></div>
      </div>

      <VouchList title="Vouched for by" edges={vouchedBy} selId={sel} onGo={onGo} />
      <VouchList title="Has vouched for" edges={vouchedFor} selId={sel} onGo={onGo} />
      {withdrawn.length > 0 && <VouchList title="Withdrawn" edges={withdrawn} selId={sel} onGo={onGo} />}

      {!p.private && (
        <div className={styles.affected}>
          <div className={styles.insT}>If you removed {first}</div>
          <p>
            <b>{vouchedFor.length}</b> member{vouchedFor.length !== 1 ? 's' : ''} would lose a vouch from them
            {pendingAffected ? ' — including pending members who rely on it' : ''}. Their own {vouchedBy.length} vouch
            {vouchedBy.length !== 1 ? 'es' : ''} stay valid. Weigh the human cost before acting.
          </p>
        </div>
      )}

      <div className={styles.insActions}>
        {!p.private && (
          <Button variant="jade" size="md" onClick={() => onVerify(sel)}>
            Use as verification basis
          </Button>
        )}
        <Button variant="ghost" size="md" onClick={() => onExpand(sel)}>
          {expanded ? 'Collapse network' : 'Expand network'}
        </Button>
        <Button variant="ghost" size="md" onClick={() => onCite(sel)}>
          Cite in audit log
        </Button>
      </div>
    </aside>
  )
}
