import { FiZap, FiSettings } from 'react-icons/fi'
import { StudioCreatorShell } from './StudioCreatorShell'
import { useToast } from '../../shared/components/feedback/useToast'
import s from './creator.module.css'

const SUMMARY = [
  { k: 'From streaming', v: '1,712' },
  { k: 'From tips', v: '312' },
  { k: 'From album buys', v: '76' },
  { k: 'Direct €3/mo subs', v: '40' },
]

const PAYOUTS = [
  { d: '5', m: 'Jul', title: <>July 2026 payout · <em>pending</em></>, meta: <>36,400 plays · 87 tips · 1 album buy · 12 direct subs · <em>splits to 3 collaborators</em></>, amt: '2,140', status: 'pending' },
  { d: '5', m: 'Jun', title: <>June 2026 payout</>, meta: '24,260 plays · 64 tips · 4 album buys · 8 direct subs', amt: '1,213', status: 'paid' },
  { d: '5', m: 'May', title: <>May 2026 payout · <em>first month of CDS</em></>, meta: '18,420 plays · 42 tips · 12 album buys · 6 direct subs', amt: '1,084', status: 'paid' },
  { d: '5', m: 'Apr', title: <>April 2026 payout</>, meta: '8,140 plays · 18 tips · 3 album buys · 4 direct subs', amt: '486', status: 'paid' },
  { d: '5', m: 'Mar', title: <>March 2026 payout · <em>first on Studio</em></>, meta: '2,140 plays · 6 tips · 1 album buy · 2 direct subs', amt: '142', status: 'paid' },
]

const BREAKDOWN = [
  { n: '06', nm: <>Carta para a <em>santa</em></>, plays: '25,832 plays', total: '1,291.60' },
  { n: '04', nm: <>A <em>vizinha</em> que reza</>, plays: '4,144 plays', total: '207.20' },
  { n: '03', nm: <>Mãe, três <em>vezes</em></>, plays: '2,880 plays', total: '144.00' },
  { n: '01', nm: <>Mãe, <em>vento</em></>, plays: '1,684 plays', total: '84.20' },
  { n: '08', nm: <>O <em>nome</em></>, plays: '920 plays', total: '46.00' },
  { n: '—', nm: <>Seven other tracks <em>· combined</em></>, plays: '940 plays', total: '47.00' },
]

export function StudioPayoutsPage() {
  const { showToast } = useToast()
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
              <a href="#" className={s.allLink} onClick={(e) => { e.preventDefault(); showToast('Exporting payout history as CSV', 'success') }}>
                Export CSV →
              </a>
            </div>
            {PAYOUTS.map((p) => (
              <div key={p.m} className={s.payRow}>
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
            {BREAKDOWN.map((b, i) => (
              <div key={i} className={s.bdRow}>
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
