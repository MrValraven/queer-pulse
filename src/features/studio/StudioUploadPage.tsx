import { StudioCreatorShell } from './StudioCreatorShell'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import s from './creator.module.css'

const STEPS = [
  { num: 1, nm: 'Files', sub: '· WAV / FLAC · cover art · lyrics', on: true },
  { num: 2, nm: 'Metadata & credits', sub: '· title · year · per-track splits' },
  { num: 3, nm: 'Licence & release', sub: '· CC / ARR · pricing · publish date' },
]

const FILES = [
  { name: '01_abertura.wav', meta: '24 bit / 48 kHz · 2:14 · −14.2 LUFS · 18.4 MB', ok: true },
  { name: '02_o_regresso.wav', meta: '24 bit / 48 kHz · 3:42 · −14.0 LUFS · 30.4 MB', ok: true },
  { name: '03_mae_tres_vezes.wav', meta: '24 bit / 48 kHz · 4:08 · −14.1 LUFS · 33.8 MB', ok: true },
  { name: '04_a_vizinha.wav', meta: '24 bit / 48 kHz · 5:31 · −7.8 LUFS · 45.2 MB', ok: false },
  { name: '05_intervalo.wav', meta: '24 bit / 48 kHz · 1:48 · −14.3 LUFS · 14.7 MB', ok: true },
]

const SPLITS = [
  { av: 'MS', tone: 'coral', nm: 'Mariana Sol', sub: 'you · songwriter, voice, piano · all tracks', role: 'writer + performer · 1 – 11', pct: '85' },
  { av: 'JA', tone: 'jade', nm: 'João Anjos', sub: 'cellist · IBAN pending invite', role: 'cello · 2, 7, 11', pct: '10' },
  { av: 'IT', tone: 'coral', nm: 'Inês T.', sub: 'mix & master · QP member', role: 'production · all tracks', pct: '5' },
  { av: 'CO', tone: 'jade', nm: 'Coro de Outubro', sub: 'choir · 15 voices, treated as one', role: 'choir · 4 only', pct: '20', onTrack: 'on track 4' },
]

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

export function StudioUploadPage() {
  const { showToast } = useToast()
  return (
    <StudioCreatorShell>
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.eb}>New release · upload</div>
          <h1>
            Bring it <em>home.</em>
          </h1>
          <div className="sub" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'rgba(247,243,238,.62)', marginTop: 14 }}>
            Drop the masters. We transcode, you keep the originals. Three steps, about eight minutes.
          </div>
        </div>
      </section>

      <div className={s.stepper}>
        {STEPS.map((st) => (
          <div key={st.num} className={[s.step, st.on && s.stepOn].filter(Boolean).join(' ')}>
            <span className={s.stepNum}>{st.num}</span>
            <span className={s.stepNm}>
              {st.nm}
              <small>{st.sub}</small>
            </span>
          </div>
        ))}
      </div>

      <section className={s.body}>
        <div className={s.col}>
          <div className={s.dropzone}>
            <div className="icon" style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(var(--accent-rgb),.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 22, height: 22 }}>
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
            <h3>
              Drop a folder of <em>WAVs</em>, or click to browse.
            </h3>
            <p>An EP, an album, a single — same flow. We'll figure out track order from filenames.</p>
            <p className="types" style={{ fontSize: 12, color: 'var(--text40)', marginTop: 12 }}>
              accepts · <em style={{ color: 'var(--jade-light)' }}>WAV · FLAC · AIFF</em> · max 96 kHz / 24 bit · up to 24 tracks
            </p>
          </div>

          <div className={s.uploaded}>
            <h4>
              Uploaded <em>5 of 5 ready</em>
            </h4>
            {FILES.map((f) => (
              <div key={f.name} className={s.fileRow}>
                <span className={[s.fileIc, !f.ok && s.fileIcWarn].filter(Boolean).join(' ')}>{f.ok ? <WaveIcon /> : <Warn />}</span>
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

          <div className={s.uploaded}>
            <h4>
              Cover art <em>1 of 1 · linted</em>
            </h4>
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
              <span className={s.fileCheck}>
                <Check />
                OK · ready
              </span>
            </div>
          </div>

          <div className={s.card}>
            <div className={s.cardH}>
              <h3>
                Per-track <em>splits</em> · default 100% to you
              </h3>
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
                {SPLITS.map((sp) => (
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
                      <span className={s.splitPct}>
                        <em>{sp.pct}</em>%
                      </span>
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

          <div style={{ display: 'flex', gap: 10 }}>
            <Button onClick={() => showToast('Saved — continue to metadata & credits', 'success')}>Continue to metadata →</Button>
          </div>
        </div>

        <div className={s.col}>
          <div className={s.sideCard}>
            <div className={s.sideEb}>What we do with your files</div>
            <h4>
              Yours, <em>still</em>.
            </h4>
            <p>You drop the masters; we transcode and stream. Your original WAV / FLAC stays your property — we hold a copy <em>only</em> for delivery. Takedown removes the listening copy in 14 days. Non-exclusive, always.</p>
            <ul className={s.sideList}>
              <li>
                <span>Source kept</span>
                <em>your file, untouched</em>
              </li>
              <li>
                <span>Listener delivery</span>FLAC + AAC 256
              </li>
              <li>
                <span>Loudness target</span>−14 LUFS
              </li>
              <li>
                <span>ISRC assignment</span>
                <em>automatic</em>
              </li>
            </ul>
          </div>

          <div className={s.sideCard}>
            <div className={s.sideEb}>Lyrics &amp; translations</div>
            <h4>
              Lyrics <em>required</em>, translations paid.
            </h4>
            <p>Upload lyrics in any language. For a line-by-line translation, the solidarity fund pays a community translator <em>€40 per song</em>. They keep their byline; you approve before publish.</p>
            <ul className={s.sideList}>
              <li>
                <span>Auto-transcribe</span>
                <em>free · ~94%</em>
              </li>
              <li>
                <span>Community translation</span>€40 → translator
              </li>
              <li>
                <span>Your approval</span>before publish
              </li>
            </ul>
          </div>
        </div>
      </section>
    </StudioCreatorShell>
  )
}
