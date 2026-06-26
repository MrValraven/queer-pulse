import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import { ImageSlot } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { StudioShell } from './StudioShell'
import ss from './studio.module.css'
import s from './sheet.module.css'
import { SPECS, SPLIT, ALSO } from './studioSheetStore.data'

export function StudioSheetStorePage() {
  const { showToast } = useToast()
  const [pm, setPm] = useState(0)
  const [bought, setBought] = useState(false)

  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>Sheet music &amp; lyrics archive</div>
        <h1>
          Buy the <em>score</em>, pay the people.
        </h1>
        <div className={s.dek}>
          A €1 micropayment unlocks a clean, printable PDF — and splits <em>90/10</em> to the people who made and transcribed it. Reading is free; downloading pays.
        </div>
      </div>

      <div className={s.grid}>
        <div>
          <div className={s.sheetHead}>
            <div className={s.sheetCv}>
              <ImageSlot tint="coral" width="100%" height="100%" radius={10} placeholder="score cover" style={{ position: 'absolute', inset: 0 }} />
            </div>
            <div className={s.sheetHi}>
              <div className={s.eb}>Lead sheet · transcription</div>
              <h1>
                Carta para a <em>santa</em>
              </h1>
              <div className={s.sheetBy}>
                music &amp; lyrics by <strong>Mariana Sol</strong> · from <em>Cidade dos santos</em>
              </div>
              <div className={s.specs}>
                {SPECS.map((sp) => (
                  <span key={sp} className={s.spec}>
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={s.previewLbl}>
            Free preview · <em>page 1 of 4</em>
          </div>
          <div className={s.pdf}>
            <div className={s.watermark}>QUEERPULSE · PREVIEW</div>
            <div className={s.pdfTitle}>Carta para a santa</div>
            <div className={s.pdfSub}>Mariana Sol · voice &amp; piano · D minor</div>
            {[0, 1, 2].map((g) => (
              <div key={g}>
                <div className={s.staff}>
                  {[0, 1, 2, 3, 4].map((l) => (
                    <div key={l} className={s.ln} />
                  ))}
                </div>
                {g < 2 && (
                  <div className={s.notesRow}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <span key={n} className={[s.noteD, n % 3 === 1 && s.s].filter(Boolean).join(' ')} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className={s.pdfFade}>
              <span className={s.lock}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x={3} y={11} width={18} height={11} rx={2} />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Pages 2–4 unlock on purchase
              </span>
            </div>
          </div>

          <div className={s.transcriber}>
            <span className="av" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(74,140,111,.2)', color: 'var(--jade-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 14, flex: 'none' }}>
              TR
            </span>
            <div>
              <h5>
                Transcribed by <em>Teresa Rocha</em>
              </h5>
              <p>
                Community transcriber · <em>paid from your purchase, not the fund, when you buy</em>
              </p>
            </div>
          </div>
        </div>

        <div className={s.checkout}>
          <h2>
            Your <em>download</em>
          </h2>
          <div className={s.chSub}>One sheet · clean PDF · yours to keep &amp; print</div>
          <div className={s.line}>
            <span className="k">
              Lead sheet — Carta para a santa
              <small>voice + piano · 4 pages</small>
            </span>
            <span className={s.v}>€1.00</span>
          </div>
          <div className={s.line}>
            <span className="k">
              Processing
              <small>co-op SEPA rate</small>
            </span>
            <span className={s.v}>€0.04</span>
          </div>
          <div className={`${s.line} ${s.lineTotal}`}>
            <span className="k">Total</span>
            <span className={s.v}>
              €<em>1.04</em>
            </span>
          </div>

          <div className={s.splitViz}>
            <div className={s.sl}>Where your €1 goes · 90 / 10</div>
            <div className={s.splitBar}>
              <div className={s.a} style={{ width: '55%' }} />
              <div className={s.b} style={{ width: '35%' }} />
              <div className={s.c} style={{ width: '10%' }} />
            </div>
            {SPLIT.map((r, i) => (
              <div key={i} className={s.splitR}>
                <span className={s.sw} style={{ background: r.c }} />
                <span className={s.sn}>{r.nm}</span>
                <span className={s.sv}>
                  <b>{r.v}</b>
                </span>
              </div>
            ))}
            <div className={s.splitFoot}>
              Sheets pay <em>90%</em> to the makers — more generous than the 80% streaming split, because the work is one-off and hosting a PDF costs near zero. <em>Voted in at the 9 June assembly.</em>
            </div>
          </div>

          <div className={s.payMethod}>
            {[
              { nm: 'Saved card · Visa ·· 4291', sub: 'one-tap, no re-entry' },
              { nm: 'SEPA direct', sub: 'lower fee, 1–2 day settle' },
            ].map((m, i) => (
              <div key={i} className={[s.pm, pm === i && s.pmOn].filter(Boolean).join(' ')} role="button" tabIndex={0} onClick={() => setPm(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPm(i) } }}>
                <span className={s.pmDot} />
                <span className={s.pn}>
                  {m.nm}
                  <small>{m.sub}</small>
                </span>
              </div>
            ))}
          </div>

          <button
            className={s.chBtn}
            disabled={bought}
            onClick={() => {
              setBought(true)
              showToast('Downloaded — €0.90 paid to Teresa & Mariana tonight', 'success')
            }}
          >
            {bought ? <>Paid <FiCheck /> · downloading PDF…</> : 'Pay €1.04 & download →'}
          </button>
          <div className={s.chNote}>
            Instant download · re-download any time from your library · <em>the makers are paid tonight</em>.
          </div>
        </div>
      </div>

      <section className={ss.row}>
        <div className={ss.rowH}>
          <h2>
            From the same <em>transcriber</em>
          </h2>
          <div className={ss.sub}>Teresa Rocha · 84 sheets · €0.55 reaches her per download</div>
        </div>
        <div className={ss.rowGrid}>
          {ALSO.map((a) => (
            <Link key={a.pre} to="/studio/sheet-store" className={ss.card}>
              <div className={ss.cardCov} style={{ aspectRatio: '0.77' }}>
                <ImageSlot tint={a.tint} width="100%" height="100%" radius={10} placeholder="score" style={{ position: 'absolute', inset: 0 }} />
                <span className={`${ss.tag} ${a.tag === 'Free read' ? ss.tagFree : ss.tagMem}`}>{a.tag}</span>
              </div>
              <h4>
                {a.pre}
                <em>{a.em}</em>
              </h4>
              <div className={ss.meta}>{a.who}</div>
            </Link>
          ))}
        </div>
      </section>
    </StudioShell>
  )
}
