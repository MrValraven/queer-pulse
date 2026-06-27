import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { StudioShell } from './StudioShell'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { IN, OUT, DISB, DISB_MORE } from './studioSolidarityFund.data'
import s from './funding.module.css'

const tagClass: Record<string, string> = { trans: s.tagTrans, emerg: s.tagEmerg, grant: s.tagGrant, access: s.tagAccess }

function DisbursementRowSkeleton() {
  return (
    <div className={s.disbRow}>
      <div className={s.dt}>
        <div className={s.skel} style={{ width: 30, height: 22, margin: '0 auto' }} />
        <div className={s.skel} style={{ width: 26, height: 9, margin: '6px auto 0' }} />
      </div>
      <div className={s.di}>
        <div className={s.skel} style={{ width: '55%', height: 15 }} />
        <div className={s.skel} style={{ width: '80%', height: 12, marginTop: 8 }} />
      </div>
      <div className={s.skel} style={{ width: 56, height: 18 }} />
    </div>
  )
}

function downloadCsv(filename: string, rows: string[][]) {
  const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`
  const csv = rows.map((r) => r.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function StudioSolidarityFundPage() {
  const { showToast } = useToast()
  const [showFull, setShowFull] = useState(false)
  const rows = showFull ? [...DISB, ...DISB_MORE] : DISB
  const loading = useSimulatedLoad()

  function exportCsv() {
    const data: string[][] = [
      ['Date', 'Category', 'Recipient', 'Note', 'Amount (EUR)'],
      ...[...DISB, ...DISB_MORE].map((r) => [`${r.d} ${r.m}`, r.tag, r.csvName, r.note, r.amt.replace(/,/g, '')]),
    ]
    downloadCsv('solidarity-fund-disbursements.csv', data)
    showToast('Disbursement log exported as CSV', 'success')
  }

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={s.eb}>
            <span className={s.live} /> Public · updated Mondays at noon
          </div>
          <h1>
            The <em>solidarity</em> fund.
          </h1>
          <div className={s.dek}>
            A small pooled reserve that pays the people the per-stream rate can't reach — <em>transcribers, translators, first-timers, and artists in a hard month</em>. Where it comes from and where it goes, in full.
          </div>
        </div>

        <div className={s.bal}>
          <div className={s.balMain}>
            <div className="l" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(247,243,238,.4)' }}>
              Fund balance · today
            </div>
            <div className="v" style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 56, color: 'var(--cream)', letterSpacing: '-0.025em', lineHeight: 1, margin: '8px 0' }}>
              €<em style={{ fontStyle: 'normal', color: 'var(--jade-light)' }}>24,180</em>
            </div>
            <div className="sub" style={{ fontSize: 13.5, color: 'rgba(247,243,238,.55)', lineHeight: 1.6, maxWidth: '52ch' }}>
              Healthy: roughly four months of current disbursement. Anything above six months' runway rolls into the next quarterly grant round by council vote.
            </div>
          </div>
          <div className={s.balSide}>
            <div className={s.mini}>
              <div className="v" style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 28, color: 'var(--cream)' }}>
                €<em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>6,240</em>
              </div>
              <div className="l" style={{ fontSize: 11.5, color: 'rgba(247,243,238,.4)' }}>paid out this quarter</div>
            </div>
            <div className={s.mini}>
              <div className="v" style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 28, color: 'var(--cream)' }}>
                <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>148</em>
              </div>
              <div className="l" style={{ fontSize: 11.5, color: 'rgba(247,243,238,.4)' }}>people paid from it this year</div>
            </div>
          </div>
        </div>

        <section className={s.sec}>
          <h2>
            Where it <em>comes from</em>, where it <em>goes</em>
          </h2>
          <div className={s.secDek}>
            No new fee funds this. It's the overflow of a system designed to overflow toward people — <em>never the artist's 80%, never your tips</em>.
          </div>
          <div className={s.flow2}>
            <div className={s.flowCol}>
              <h3>
                <span style={{ color: 'var(--jade-light)' }}>▼</span> Money in · this quarter
              </h3>
              {IN.map((f, i) => (
                <div key={i} className={s.flowItem}>
                  <div>
                    <div className={s.k}>{f.k}</div>
                    <div className={s.d}>{f.d}</div>
                  </div>
                  <div className={`${s.amt} ${s.amtIn}`}>
                    €<em>{f.v}</em>
                  </div>
                </div>
              ))}
            </div>
            <div className={s.flowCol}>
              <h3>
                <span style={{ color: 'var(--accent)' }}>▲</span> Money out · this quarter
              </h3>
              {OUT.map((f, i) => (
                <div key={i} className={s.flowItem}>
                  <div>
                    <div className={s.k}>{f.k}</div>
                    <div className={s.d}>{f.d}</div>
                  </div>
                  <div className={`${s.amt} ${s.amtOut}`}>
                    €<em>{f.v}</em>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={s.sec}>
          <h2>
            Recent <em>disbursements</em>
          </h2>
          <div className={s.secDek}>
            Every payment from the fund is logged here with a name (where consent is given) and a reason. <em>No black box.</em>
          </div>
          {loading
            ? Array.from({ length: rows.length }).map((_, i) => <DisbursementRowSkeleton key={i} />)
            : rows.map((r, i) => (
              <FadeIn key={i} delay={Math.min(i, 8) * 60}>
              <div className={s.disbRow}>
                <div className={s.dt}>
                  <b>{r.d}</b>
                  <span>{r.m}</span>
                </div>
                <div className={s.di}>
                  <h5>
                    <span className={`${s.tag2} ${tagClass[r.tagClass]}`}>{r.tag}</span>
                    {r.name}
                  </h5>
                  <p>{r.note}</p>
                </div>
                <div className={s.disbAmt}>
                  €<em>{r.amt}</em>
                </div>
              </div>
              </FadeIn>
            ))}
          <div className={s.logNote}>
            Showing {rows.length} of 148 this year ·{' '}
            <button type="button" onClick={() => setShowFull((v) => !v)}>
              {showFull ? 'show less' : 'full log'}
            </button>{' '}
            · <button type="button" onClick={exportCsv}>export CSV</button>
          </div>
        </section>

        <div className={s.apply}>
          <div>
            <h2>
              Need it? <em>Ask.</em>
            </h2>
            <p>
              If you're a member having a hard month, the emergency strand is a short form and a fast yes — <em>no portfolio, no means test, no shame</em>. Transcribers and translators are paid per accepted piece; grants open each quarter.
            </p>
          </div>
          <div className={s.acts}>
            <button className={`${s.bt} ${s.btJade} ${s.btLg}`} onClick={() => showToast('Emergency support form opens in a private flow', 'info')}>
              Request emergency support
            </button>
            <Link to={routes.studioCalls} className={`${s.bt} ${s.btLg}`}>
              See open grants &amp; calls →
            </Link>
          </div>
        </div>
      </div>
    </StudioShell>
  )
}
