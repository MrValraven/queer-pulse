import { FiZap, FiSettings } from 'react-icons/fi'
import { FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { StudioCreatorShell } from './StudioCreatorShell'
import { useToast } from '../../shared/components/feedback/useToast'
import { SUMMARY, PAYOUTS, BREAKDOWN } from './studioPayouts.data'
import { PayoutRowSkeleton, BreakdownRowSkeleton } from './StudioPayoutsSkeletons'
import s from './creator.module.css'

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

export function StudioPayoutsPage() {
  const { showToast } = useToast()
  const loading = useSimulatedLoad()

  function exportCsv() {
    const data: string[][] = [
      ['Period', 'Date', 'Detail', 'Amount (EUR)', 'Status'],
      ...PAYOUTS.map((p) => [p.period, `${p.d} ${p.m}`, p.csvMeta, p.amt.replace(/,/g, ''), p.status]),
    ]
    downloadCsv('studio-payout-history.csv', data)
    showToast('Payout history exported as CSV', 'success')
  }

  return (
    <StudioCreatorShell>
      <section className={s.hero}>
        <div className={s.heroInner} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'end' }}>
          <div>
            <div className={s.eb}>Payouts &amp; banking</div>
            <h1>
              <em>€2,140</em> lands on the 5th.
            </h1>
            <div className="sub" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'rgba(247,243,238,.62)', marginTop: 14 }}>
              Paid monthly by SEPA transfer, with your recibo verde issued automatically. No minimums you didn't choose.
            </div>
          </div>
          <div className={s.sideCard} style={{ minWidth: 0 }}>
            <div className={s.sideEb}>July payout · breakdown</div>
            {SUMMARY.map((l) => (
              <div key={l.k} className={s.ln}>
                <span>{l.k}</span>
                <span className="v2" style={{ fontFamily: 'var(--serif)', color: 'var(--text)' }}>
                  €<em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>{l.v}</em>
                </span>
              </div>
            ))}
            <div className={s.ln}>
              <span>Splits routed to others</span>
              <span className="v2" style={{ fontFamily: 'var(--serif)', color: 'var(--text40)' }}>
                −€<em style={{ fontStyle: 'normal' }}>198</em>
              </span>
            </div>
            <div className={s.ln}>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>→ to your IBAN</span>
              <span className="v2" style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>
                €<em style={{ fontStyle: 'normal', color: 'var(--jade-light)' }}>2,140</em>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={s.body}>
        <div className={s.col}>
          <div className={s.card}>
            <div className={s.cardH}>
              <h3>
                Recent <em>payouts</em>
              </h3>
              <a href="#" className={s.allLink} onClick={(e) => { e.preventDefault(); exportCsv() }}>
                Export CSV →
              </a>
            </div>
            {loading
              ? Array.from({ length: PAYOUTS.length }).map((_, i) => <PayoutRowSkeleton key={i} />)
              : PAYOUTS.map((p, i) => (
                  <FadeIn key={p.m} delay={Math.min(i, 8) * 60}>
                    <div className={s.payRow}>
                      <div className={s.payDate}>
                        <div className="d" style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 26, color: 'var(--text)', lineHeight: 1 }}>
                          {p.d}
                        </div>
                        <div className="m" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                          {p.m}
                        </div>
                      </div>
                      <div>
                        <h5>{p.title}</h5>
                        <div className={s.payMeta}>{p.meta}</div>
                      </div>
                      <div className={s.payAmt}>
                        €<em>{p.amt}</em>
                      </div>
                      <span className={`${s.payStatus} ${p.status === 'pending' ? s.statusPending : s.statusPaid}`}>{p.status === 'pending' ? 'Pending' : 'Paid'}</span>
                    </div>
                  </FadeIn>
                ))}
          </div>

          <div className={s.card}>
            <div className={s.cardH}>
              <h3>
                This month, <em>track-by-track</em>
              </h3>
              <div className="sub" style={{ fontSize: 12.5, color: 'var(--text40)', width: '100%' }}>
                €0.05 per qualifying play (≥30s, capped 1/listener/track/day). Updates nightly at 02:00 Lisbon.
              </div>
            </div>
            {loading
              ? Array.from({ length: BREAKDOWN.length }).map((_, i) => <BreakdownRowSkeleton key={i} />)
              : BREAKDOWN.map((b, i) => (
                  <FadeIn key={i} delay={Math.min(i, 8) * 60}>
                    <div className={s.bdRow}>
                      <span className="n" style={{ fontFamily: 'monospace', color: 'var(--text40)', fontSize: 12 }}>
                        {b.n}
                      </span>
                      <span className="nm" style={{ color: 'var(--text)', fontFamily: 'var(--serif)', fontSize: 14 }}>
                        {b.nm}
                      </span>
                      <span className="plays" style={{ color: 'var(--text60)', whiteSpace: 'nowrap' }}>
                        {b.plays}
                      </span>
                      <span className="rate" style={{ color: 'var(--text40)', fontSize: 12 }}>
                        @ €0.05
                      </span>
                      <span className="bdTotal" style={{ fontFamily: 'var(--serif)', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        €<em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>{b.total}</em>
                      </span>
                    </div>
                  </FadeIn>
                ))}
            <div className={s.bdFoot}>
              <span>Streaming subtotal · before splits + tips + buys</span>
              <span className="v" style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text)' }}>
                €<em style={{ fontStyle: 'normal', color: 'var(--jade-light)' }}>1,820.00</em>
              </span>
            </div>
          </div>
        </div>

        <div className={s.col}>
          <div className={s.sideCard}>
            <div className={s.sideEb}>Payout method · active</div>
            <h4>
              Sending to <em>SEPA</em>
            </h4>
            <div className={s.method}>
              <span className={s.methodIc}>€</span>
              <span className={s.methodNm}>
                SEPA — IBAN
                <small>LU 82 0019 … 1844 3700</small>
              </span>
              <span className={s.methodBadge}>Active</span>
            </div>
            <div className={s.method}>
              <span className={`${s.methodIc} ${s.methodIcAlt}`}><FiZap /></span>
              <span className={s.methodNm}>
                Stripe Connect
                <small>connected · backup, not primary</small>
              </span>
              <span className={s.methodSwitch}>Switch</span>
            </div>
            <div className={s.method}>
              <span className={`${s.methodIc} ${s.methodIcAlt}`}><FiSettings /></span>
              <span className={s.methodNm}>
                Co-op credit
                <small>spend at Casa do Comum, rehearsal rooms · €0 fees</small>
              </span>
              <span className={s.methodSwitch}>Add</span>
            </div>
          </div>

          <div className={s.sideCard}>
            <div className={s.cardH}>
              <h3>
                Payout <em>preferences</em>
              </h3>
            </div>
            <div className={s.field}>
              <label>Minimum threshold</label>
              <select defaultValue="€5 (default · ships every month)">
                <option>€5 (default · ships every month)</option>
                <option>€20 (quarterly · save on fees)</option>
                <option>€100 (hold &amp; release on request)</option>
              </select>
              <span className={s.fhint}>Below threshold rolls over to next month.</span>
            </div>
            <div className={s.field}>
              <label>Tax residency</label>
              <input type="text" defaultValue="Portugal · NIF on file" />
              <span className={s.fhint}>We auto-issue your IRS recibo verde for each payout.</span>
            </div>
            <div className={s.field}>
              <label>Notification email</label>
              <input type="email" defaultValue="mariana@queerpulse.org" />
            </div>
          </div>
        </div>
      </section>
    </StudioCreatorShell>
  )
}
