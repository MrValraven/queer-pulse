import { useToast } from '../../shared/components/feedback/useToast'
import { Button } from '../../shared/components/ui'
import { UPLOAD_FILES, UPLOAD_SPLITS, UPLOAD_SIDE_INFO } from './studioUpload.data'
import s from './creator.module.css'

const WaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M9 18V5l12-2v13" />
    <circle cx={6} cy={18} r={3} />
    <circle cx={18} cy={16} r={3} />
  </svg>
)
const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
    <path d="M5 12l5 5 9-11" />
  </svg>
)
const Warn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
)

export function DropZone() {
  return (
    <div className={s.dropzone}>
      <div className="icon" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(var(--accent-rgb),.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 22, height: 22 }}>
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </div>
      <h3>Drop a folder of <em>WAVs</em>, or click to browse.</h3>
      <p>An EP, an album, a single — same flow. We'll figure out track order from filenames.</p>
      <p className="types" style={{ fontSize: 12, color: 'var(--text40)', marginTop: 12 }}>
        accepts · <em style={{ color: 'var(--jade-light)' }}>WAV · FLAC · AIFF</em> · max 96 kHz / 24 bit · up to 24 tracks
      </p>
    </div>
  )
}

export function FileList() {
  return (
    <div className={s.uploaded}>
      <h4>Uploaded <em>5 of 5 ready</em></h4>
      {UPLOAD_FILES.map((f) => (
        <div key={f.name} className={s.fileRow}>
          <span className={[s.fileIc, !f.ok && s.fileIcWarn].filter(Boolean).join(' ')}>
            {f.ok ? <WaveIcon /> : <Warn />}
          </span>
          <div>
            <h5>{f.name}</h5>
            <div className={s.fileMeta}>{f.meta}</div>
          </div>
          <span className={[s.fileCheck, !f.ok && s.fileCheckWarn].filter(Boolean).join(' ')}>
            {f.ok ? <Check /> : <Warn />}
            {f.ok ? 'OK · ready' : 'Loudness check'}
          </span>
        </div>
      ))}
      <div className={s.warnCard}>
        <Warn />
        <div>
          <strong>Track 4 is loud.</strong> Master comes in at −7.8 LUFS — our floor is −14 default. <em>This isn't fatal:</em> we can normalise on the fly per listener. If you intended this peak, leave it. <a href="#">What we do with loud masters →</a>
        </div>
      </div>
    </div>
  )
}

export function CoverArt() {
  return (
    <div className={s.uploaded}>
      <h4>Cover art <em>1 of 1 · linted</em></h4>
      <div className={s.fileRow}>
        <span className={s.fileIc} style={{ background: 'rgba(var(--accent-rgb),.16)', color: 'var(--accent)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
            <rect x={3} y={3} width={18} height={18} rx={2} />
            <circle cx={9} cy={9} r={2} />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </span>
        <div>
          <h5>cidade_cover.jpg</h5>
          <div className={s.fileMeta}>2400 × 2400 · sRGB · 4.2 MB · no text in upper third</div>
        </div>
        <span className={s.fileCheck}><Check />OK · ready</span>
      </div>
    </div>
  )
}

export function SplitsTable() {
  const { showToast } = useToast()
  return (
    <div className={s.card}>
      <div className={s.cardH}>
        <h3>Per-track <em>splits</em> · default 100% to you</h3>
        <div className="sub" style={{ fontSize: 12.5, color: 'var(--text40)', width: '100%' }}>
          Add collaborators and we route each cent directly to their bank.
        </div>
      </div>
      <table className={s.splitTable}>
        <thead>
          <tr>
            <th>Collaborator</th>
            <th>Role · tracks</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {UPLOAD_SPLITS.map((sp) => (
            <tr key={sp.nm}>
              <td>
                <div className={s.splitWho}>
                  <span className="av" style={sp.tone === 'jade' ? { background: 'rgba(74,140,111,.18)', color: 'var(--jade-light)' } : undefined}>
                    {sp.av}
                  </span>
                  <span className="nm">
                    {sp.nm}
                    <small>{sp.sub}</small>
                  </span>
                </div>
              </td>
              <td style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>{sp.role}</td>
              <td>
                <span className={s.splitPct}><em>{sp.pct}</em>%</span>
                {sp.onTrack && <small style={{ display: 'block', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--text40)' }}>{sp.onTrack}</small>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={s.splitFoot}>
        <span className="total" style={{ fontSize: 12.5, color: 'var(--text40)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          Default split sums to <em style={{ color: 'var(--jade-light)', fontWeight: 600 }}>100%</em> · per-track adjustments override
        </span>
        <button className={s.addBtn} onClick={() => showToast('Add a collaborator by QP handle or email', 'info')}>
          ＋ Add collaborator
        </button>
      </div>
    </div>
  )
}

export function UploadSidebar() {
  return (
    <div className={s.col}>
      {UPLOAD_SIDE_INFO.map((info) => (
        <div key={info.eyebrow} className={s.sideCard}>
          <div className={s.sideEb}>{info.eyebrow}</div>
          <h4 dangerouslySetInnerHTML={{ __html: info.title }} />
          <p dangerouslySetInnerHTML={{ __html: info.body }} />
          <ul className={s.sideList}>
            {info.list.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                {item.em ? <em>{item.value}</em> : item.value}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function UploadMainCol() {
  const { showToast } = useToast()
  return (
    <div className={s.col}>
      <DropZone />
      <FileList />
      <CoverArt />
      <SplitsTable />
      <div style={{ display: 'flex', gap: 10 }}>
        <Button onClick={() => showToast('Saved — continue to metadata & credits', 'success')}>Continue to metadata →</Button>
      </div>
    </div>
  )
}
