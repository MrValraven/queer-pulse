import { Link } from 'react-router-dom'
import { FiPlus, FiCheck } from 'react-icons/fi'
import { ImageSlot } from '../../shared/components/ui'
import { useSaved } from '../../app/providers/SavedProvider'
import { useToast } from '../../shared/components/feedback/useToast'
import { StudioShell } from './StudioShell'
import { ROWS, SET, coverImage } from './studioSet.data'
import ss from './studio.module.css'
import s from './studioPages.module.css'

const SET_ITEM = {
  id: 'post:studio-set',
  kind: 'post' as const,
  title: 'Studio set',
  href: '/studio/set',
  meta: 'Set',
}

export function StudioSetPage() {
  const { isSaved, toggleSave } = useSaved()
  const { showToast } = useToast()
  const saved = isSaved(SET_ITEM.id)

  return (
    <StudioShell>
      <div className={s.collHero}>
        <div className={s.collCov}>
          <ImageSlot src={coverImage} tint="plum" width="100%" height="100%" radius={14} placeholder="set" style={{ position: 'absolute', inset: 0 }} />
        </div>
        <div className={s.collInfo}>
          <div className={s.eb}>Set · programmed by {SET.by}</div>
          <h1>
            {SET.title}
            <em>{SET.em}</em>
          </h1>
          <div className={s.collMeta}>
            {SET.recorded} · <strong>{SET.length}</strong>
          </div>
          <div className={s.dek}>{SET.blurb}</div>
          <div className={s.collActions}>
            <button className={ss.playBig} aria-label="Play set">
              <svg viewBox="0 0 12 14" fill="currentColor">
                <path d="M1 1l10 6-10 6z" />
              </svg>
            </button>
            <button onClick={() => { const now = toggleSave(SET_ITEM); showToast(now ? 'Set added to your library' : 'Removed from your library', now ? 'success' : 'info') }}>
              {saved ? <><FiCheck /> In library</> : <><FiPlus /> Library</>}
            </button>
            <Link to="/studio/live" className={ss.bt}>
              Join the live room →
            </Link>
          </div>
        </div>
      </div>

      <section className={ss.row}>
        <div className={ss.rowH}>
          <h2>
            The <em>tracklist</em>
          </h2>
          <span className={s.eb}>Every play pays the artist</span>
        </div>
        <div className={ss.setCard}>
          {ROWS.map((row) => (
            <div key={row.n} className={[ss.setRow, row.now && ss.setRowNow].filter(Boolean).join(' ')}>
              <div className={ss.n}>{row.n}</div>
              <div className={ss.srCov}>
                <ImageSlot src={row.image} tint="coral" width={36} height={36} radius={5} placeholder="" />
              </div>
              <div>
                <h5>
                  {row.pre}
                  {row.em && <em>{row.em}</em>}
                  {row.post}
                </h5>
                <div className={ss.who}>{row.who}</div>
              </div>
              <div className={ss.pay}>{row.now ? <><b>paying now</b>€0.05</> : '€0.05 / play'}</div>
              <div className={ss.tm}>{row.tm}</div>
            </div>
          ))}
        </div>
      </section>
    </StudioShell>
  )
}
