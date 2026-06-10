import { Link } from 'react-router-dom'
import { StudioShell } from './StudioShell'
import { useToast } from '../../shared/components/feedback/useToast'
import s from './funding.module.css'

const IN = [
  { k: <>Subscription <em>surplus</em></>, d: 'When sustainer revenue beats the payout ledger, the difference pools here.', v: '4,100' },
  { k: <>Tip <em>round-ups</em></>, d: 'The optional 5% some listeners add on top of a tip.', v: '1,860' },
  { k: <>Cleared <em>holds</em></>, d: 'Unmatched DJ-set payouts that stay unclaimed after a year.', v: '720' },
  { k: <>Direct <em>gifts</em></>, d: 'One-off donations from members and a Lisbon foundation.', v: '2,400' },
]
const OUT = [
  { k: <>Transcribers &amp; <em>translators</em></>, d: 'Sheet music, lyric translations — paid per accepted piece.', v: '2,180' },
  { k: <>First-release <em>grants</em></>, d: '€1,200 unrestricted to first-time members on the spring strand.', v: '2,400' },
  { k: <>Emergency <em>artist support</em></>, d: 'No-questions help for a member in a hard month.', v: '1,200' },
  { k: <>Access <em>work</em></>, d: 'LGP interpreters, captioning passes, the screen-reader audit.', v: '460' },
]
const DISB = [
  { d: '8', m: 'Jun', tag: 'Transcriber', tagClass: 'trans', name: <>Teresa <em>Rocha</em></>, note: '14 lead sheets accepted into the archive this fortnight', amt: '210' },
  { d: '6', m: 'Jun', tag: 'Emergency', tagClass: 'emerg', name: <>Withheld by <em>request</em></>, note: "One month's rent for a member between tours — confidential", amt: '600' },
  { d: '5', m: 'Jun', tag: 'Grant', tagClass: 'grant', name: <>Helena <em>Pinto</em> &amp; 6 others</>, note: 'Spring first-release strand · €1,200 unrestricted each', amt: '1,400' },
  { d: '2', m: 'Jun', tag: 'Access', tagClass: 'access', name: <>LGP <em>interpreter</em></>, note: 'Signed the Marsha P. Johnson broadcast · 90 minutes', amt: '240' },
  { d: '29', m: 'May', tag: 'Translator', tagClass: 'trans', name: <>Community <em>pool</em> · 9 people</>, note: 'Lyric translations: PT→EN, PT→ES, FR→PT across 22 tracks', amt: '380' },
  { d: '24', m: 'May', tag: 'Emergency', tagClass: 'emerg', name: <>Instrument <em>replacement</em></>, note: 'A stolen accordion, replaced within a week — no application form', amt: '900' },
]
const tagClass: Record<string, string> = { trans: s.tagTrans, emerg: s.tagEmerg, grant: s.tagGrant, access: s.tagAccess }

export function StudioSolidarityFundPage() {
  const { showToast } = useToast()
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
          {DISB.map((r, i) => (
            <div key={i} className={s.disbRow}>
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
          ))}
          <div className={s.logNote}>
            Showing 6 of 148 this year · <a href="#">full log</a> · <a href="#">export CSV</a>
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
            <Link to="/studio/calls" className={`${s.bt} ${s.btLg}`}>
              See open grants &amp; calls →
            </Link>
          </div>
        </div>
      </div>
    </StudioShell>
  )
}
