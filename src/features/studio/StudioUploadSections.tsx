import { useState } from 'react'
import { FiPlus, FiCheck } from 'react-icons/fi'
import { useToast } from '../../shared/components/feedback/useToast'
import { Button } from '../../shared/components/ui'
import { UPLOAD_FILES, UPLOAD_SPLITS, UPLOAD_SIDE_INFO } from './studioUpload.data'
import { routes } from '../../app/routeMap'
import s from './creator.module.css'

interface Collaborator {
  av: string
  nm: string
  sub: string
  role: string
  pct: string
  tone?: string
  onTrack?: string
}

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
  const [showLoud, setShowLoud] = useState(false)
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
          <strong>Track 4 is loud.</strong> Master comes in at −7.8 LUFS — our floor is −14 default. <em>This isn't fatal:</em> we can normalise on the fly per listener. If you intended this peak, leave it.{' '}
          <button type="button" className={s.loudToggle} aria-expanded={showLoud} onClick={() => setShowLoud((v) => !v)}>
            What we do with loud masters {showLoud ? '↑' : '→'}
          </button>
          {showLoud && (
            <div className={s.loudExplainer}>
              We keep your master <em>exactly as delivered</em> and store it untouched. For playback we apply
              per-listener loudness normalisation to roughly −14 LUFS, so your track sits at a comfortable level
              next to everything else in a set — <em>without re-encoding or clipping your file</em>. Listeners who
              turn normalisation off in their settings hear your original peak. Nothing is baked in; you can change
              the target or opt out per release at any time.
            </div>
          )}
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

export function SplitsTable({
  collaborators,
  onAdd,
}: {
  collaborators: Collaborator[]
  onAdd: (handle: string) => void
}) {
  const { showToast } = useToast()
  const [adding, setAdding] = useState(false)
  const [handle, setHandle] = useState('')

  function submit() {
    const trimmed = handle.trim()
    if (!trimmed) return
    onAdd(trimmed)
    showToast(`Invited ${trimmed} to the splits`, 'success')
    setHandle('')
    setAdding(false)
  }

  const rows = [...UPLOAD_SPLITS, ...collaborators]

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
          {rows.map((sp) => (
            <tr key={sp.nm}>
              <td>
                <div className={s.splitWho}>
                  <span className="av" style={sp.tone === 'jade' ? { background: 'rgba(var(--jade-rgb),.18)', color: 'var(--jade-light)' } : undefined}>
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
        <Button variant="ghost" onClick={() => setAdding((v) => !v)}>
          <FiPlus /> Add collaborator
        </Button>
      </div>
      {adding && (
        <div className={s.collabForm}>
          <input
            autoFocus
            placeholder="QP handle or email"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          />
          <Button onClick={submit} disabled={!handle.trim()}>Invite</Button>
        </div>
      )}
    </div>
  )
}

export function UploadSidebar() {
  return (
    <div className={s.col}>
      {UPLOAD_SIDE_INFO.map((info) => (
        <div key={info.eyebrow} className={s.sideCard}>
          <div className={s.sideEb}>{info.eyebrow}</div>
          <h4>{info.title}</h4>
          <p>{info.body}</p>
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

function MetadataStep({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  return (
    <div className={s.card}>
      <div className={s.cardH}>
        <h3>
          Metadata &amp; <em>credits</em>
        </h3>
        <div className="sub" style={{ fontSize: 12.5, color: 'var(--text40)', width: '100%' }}>
          A few last details and your release goes to the council queue for review.
        </div>
      </div>
      <div className={s.field}>
        <label>Release title</label>
        <input type="text" defaultValue="Cidade dos santos" />
      </div>
      <div className={s.field}>
        <label>Release year</label>
        <input type="text" defaultValue="2026" />
      </div>
      <div className={s.field}>
        <label>Primary genre</label>
        <select defaultValue="Fado / contemporary">
          <option>Fado / contemporary</option>
          <option>Electronic</option>
          <option>Folk</option>
          <option>Experimental</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Button variant="ghost" onClick={onBack}>← Back to files</Button>
        <Button onClick={onSubmit}>Submit for review →</Button>
      </div>
    </div>
  )
}

function SubmittedPanel() {
  return (
    <div className={s.submitted}>
      <div className={s.submittedIcon}>
        <FiCheck size={26} aria-hidden />
      </div>
      <h2>
        Submitted for <em>review.</em>
      </h2>
      <p>
        Your release is in the council queue. A curator will check the files, splits and credits — usually within a
        day or two — and you'll get a note the moment it's live. Nothing publishes without your final yes.
      </p>
      <Button variant="ghost-dark" to={routes.studioPayouts}>View your payouts →</Button>
    </div>
  )
}

export function UploadMainCol() {
  const { showToast } = useToast()
  const [step, setStep] = useState<'files' | 'metadata' | 'done'>('files')
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])

  function addCollaborator(handle: string) {
    const initials = handle.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'QP'
    setCollaborators((prev) => [
      ...prev,
      { av: initials, nm: handle, sub: 'invited · IBAN pending', role: 'collaborator · all tracks', pct: '0', tone: 'jade' },
    ])
  }

  if (step === 'done') {
    return (
      <div className={`${s.col} ${s.screenIn}`} key="done">
        <SubmittedPanel />
      </div>
    )
  }

  if (step === 'metadata') {
    return (
      <div className={`${s.col} ${s.screenIn}`} key="metadata">
        <MetadataStep
          onBack={() => setStep('files')}
          onSubmit={() => {
            setStep('done')
            showToast('Release submitted for review', 'success')
          }}
        />
      </div>
    )
  }

  return (
    <div className={`${s.col} ${s.screenIn}`} key="files">
      <DropZone />
      <FileList />
      <CoverArt />
      <SplitsTable collaborators={collaborators} onAdd={addCollaborator} />
      <div style={{ display: 'flex', gap: 10 }}>
        <Button onClick={() => setStep('metadata')}>Continue to metadata →</Button>
      </div>
    </div>
  )
}
