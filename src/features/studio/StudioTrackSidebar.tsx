import { Link } from 'react-router-dom'
import { SPLIT, CREDITS } from './studioTrack.data'
import t from './track.module.css'

export function StudioTrackSidebar() {
  return (
    <div className={t.rSide}>
      <div className={t.sCard}>
        <div className={t.sEb}>Curator's note</div>
        <div className={t.noteHead}>
          <div className={t.noteAv}>SM</div>
          <div>
            <div className={t.noteName}>Sara Marques</div>
            <div className={t.noteRole}>programming lead · the Wednesday set</div>
          </div>
        </div>
        <p>"Track six of an album I have not stopped playing since April. A devotional addressed plainly to a saint who isn't listening; a piano arrangement that knows when to step out of the room. <em>Stay through the second verse.</em>"</p>
      </div>

      <div className={t.sCard}>
        <div className={t.sEb}>Where €1 goes when you play this</div>
        <div className={t.splitLead}>
          €<em>0.80</em> to Mariana. €<em>0.20</em> keeps the room open.
        </div>
        <div className={t.splitBar}>
          <span style={{ width: '80%', background: 'var(--accent)' }} />
          <span style={{ width: '8%', background: 'var(--jade)' }} />
          <span style={{ width: '8%', background: 'var(--plum)' }} />
          <span style={{ width: '4%', background: 'rgba(247,243,238,.2)' }} />
        </div>
        <div>
          {SPLIT.map((r) => (
            <div key={r.k} className={t.splRow}>
              <span className={t.splDot} style={{ background: r.c }} />
              <span className={t.splK}>
                <b>{r.k}</b>
                {r.sub}
              </span>
              <span className={t.splV}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={t.sCard}>
        <div className={t.sEb}>Credits · per-track splits</div>
        {CREDITS.map((c) => (
          <div key={c.who} className={t.credRow}>
            <span className="who">{c.who}</span>
            <span className="role">{c.role}</span>
          </div>
        ))}
      </div>

      <div className={t.sheetMini}>
        <span className="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 4h12l4 4v12H4z" />
            <path d="M16 4v4h4M8 13h8M8 17h5" />
          </svg>
        </span>
        <div className="nm">
          <b>Lead sheet · <em>Carta para a santa</em></b>
          <small>6 pages · piano + voice · CC-BY-NC · Mariana Sol</small>
        </div>
        <Link to="/studio/sheet-store">Download →</Link>
      </div>
    </div>
  )
}
