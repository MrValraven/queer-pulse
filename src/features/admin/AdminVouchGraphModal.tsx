import { Fragment, useEffect } from 'react'
import { FiLock, FiPlay, FiSearch, FiX } from 'react-icons/fi'
import { useScrollLock } from '../../shared/hooks'
import { useToast } from '../../shared/components/feedback/useToast'
import { VouchGraphCanvas } from './VouchGraphCanvas'
import { VouchGraphInspector } from './VouchGraphInspector'
import { useVouchGraph, type VouchMode } from './useVouchGraph'
import { SCENES, T_MAX, T_MIN, monthLabel, personById, shortestPath } from './adminVouchGraph.data'
import styles from './AdminVouchGraph.module.css'

const MODES: { key: VouchMode; label: string }[] = [
  { key: 'plain', label: 'Network' },
  { key: 'clusters', label: 'Scenes' },
  { key: 'safety', label: 'Safety' },
]

function PathBar({ pathA, pathB, onClear }: { pathA: string | null; pathB: string | null; onClear: () => void }) {
  if (!pathA) return null
  let content
  if (pathA && pathB) {
    const path = shortestPath(pathA, pathB)
    content = path ? (
      <span><b>{path.length}-step trust path:</b> {path.map((id) => personById[id].initials).join(' → ')}</span>
    ) : (
      <span><b>No trust path</b> between {personById[pathA].initials} and {personById[pathB].initials}</span>
    )
  } else {
    content = <span>Path from <b>{personById[pathA].initials}</b> — shift-click a second person</span>
  }
  return (
    <div className={styles.pathbar}>
      {content}
      <button type="button" onClick={onClear}>clear</button>
    </div>
  )
}

function Legend({ mode }: { mode: VouchMode }) {
  if (mode === 'clusters') {
    return (
      <div className={styles.legend}>
        {Object.values(SCENES).map((s) => (
          <span key={s.label} className={styles.leg}><span className={styles.legDot} style={{ background: s.color }} />{s.label}</span>
        ))}
      </div>
    )
  }
  if (mode === 'safety') {
    return (
      <div className={styles.legend}>
        <span className={styles.leg}><span className={styles.legDot} style={{ background: 'var(--danger)' }} />Suspected ring</span>
        <span className={styles.leg}><span className={styles.legDot} style={{ background: 'var(--amber)' }} />Trust-isolated</span>
        <span className={styles.leg}><span className={styles.legDot} style={{ background: 'var(--accent-ink)' }} />Has reports</span>
        <span className={styles.leg}><span className={styles.legDash} />Withdrawn vouch</span>
      </div>
    )
  }
  return (
    <div className={styles.legend}>
      <span className={styles.leg}><span className={styles.legDot} style={{ background: 'var(--jade)' }} />Trusted</span>
      <span className={styles.leg}><span className={styles.legRing} />Verified</span>
      <span className={styles.leg}><span className={styles.legBond} />Mutual vouch</span>
      <span className={styles.leg}><span className={styles.legHatch} />Anonymous</span>
      <span className={styles.leg}><FiLock aria-hidden /> Private network</span>
    </div>
  )
}

export function AdminVouchGraphModal({ focusId, onClose }: { focusId: string; onClose: () => void }) {
  useScrollLock()
  const { showToast } = useToast()
  const g = useVouchGraph(focusId)
  const focusPerson = personById[g.focus]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.shell} role="dialog" aria-modal="true" aria-label="Trust network" onClick={(e) => e.stopPropagation()}>
        <header className={styles.top}>
          <div className={styles.titleBlock}>
            <span className={styles.eyebrow}>Trust network</span>
            <div className={styles.h}>{focusPerson.name} <span className={styles.pron}>{focusPerson.pronoun}</span></div>
          </div>

          <div className={styles.crumbs}>
            {g.crumbs.map((id, i) => (
              <Fragment key={`${id}-${i}`}>
                <button type="button" className={styles.crumb} onClick={() => g.gotoCrumb(i)}>{personById[id].initials}</button>
                <span className={styles.crumbSep}>›</span>
              </Fragment>
            ))}
            <span className={`${styles.crumb} ${styles.crumbCur}`}>{focusPerson.initials}</span>
          </div>

          <div className={styles.search}>
            <FiSearch aria-hidden />
            <input value={g.search} onChange={(e) => g.setSearch(e.target.value)} placeholder="Find a member…" aria-label="Find a member" />
          </div>

          <div className={styles.modes}>
            {MODES.map((m) => (
              <button key={m.key} type="button" className={`${styles.mode}${g.mode === m.key ? ` ${styles.modeOn}` : ''}`} onClick={() => g.changeMode(m.key)}>
                {m.label}
              </button>
            ))}
          </div>

          <button type="button" className={styles.close} onClick={onClose} aria-label="Close"><FiX /></button>
        </header>

        <div className={styles.main}>
          <VouchGraphCanvas
            visIds={g.visIds}
            visEdges={g.visEdges}
            focus={g.focus}
            mode={g.mode}
            sel={g.sel}
            pathNodes={g.pathNodes}
            pathEdges={g.pathEdges}
            search={g.search}
            onSelect={g.select}
            onRecenter={g.recenter}
            onPickPath={g.pickPath}
          >
            <PathBar pathA={g.pathA} pathB={g.pathB} onClear={g.clearPath} />
          </VouchGraphCanvas>

          <VouchGraphInspector
            sel={g.sel}
            expanded={g.sel ? g.expanded.has(g.sel) : false}
            onGo={g.select}
            onVerify={() => showToast('Trust basis attached — opening verification', 'success')}
            onExpand={g.toggleExpand}
            onCite={() => showToast('Trust path cited in the audit log', 'success')}
          />
        </div>

        <footer className={styles.bottom}>
          <Legend mode={g.mode} />
          <div className={styles.timeWrap}>
            <button type="button" className={styles.replay} onClick={g.replay} disabled={g.replaying}>
              <FiPlay aria-hidden /> Replay
            </button>
            <input
              type="range"
              min={T_MIN}
              max={T_MAX}
              value={g.timeCut}
              onChange={(e) => g.setTime(Number(e.target.value))}
              aria-label="Time cut-off"
            />
            <span className={styles.timeLbl}>{monthLabel(g.timeCut)}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
