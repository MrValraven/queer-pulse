import { Link } from 'react-router-dom'
import { StudioCreatorShell } from './StudioCreatorShell'
import { routes } from '../../app/routeMap'
import { STATS, BARS, CURATORS, CITIES } from './studioDashboard.data'
import s from './creator.module.css'

export function StudioDashboardPage() {
  return (
    <StudioCreatorShell>
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.eb}>
            <span className="live" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--jade)' }} />
            Studio · this month
          </div>
          <h1>
            Good week, <em>Mariana.</em>
          </h1>
          <div className="sub" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'rgba(247,243,238,.62)', marginTop: 14 }}>
            <em style={{ color: 'var(--accent)' }}>Cidade dos santos</em> is two months old and still climbing — the curators kept it in rotation.
          </div>
          <div className={s.bigstats}>
            {STATS.map((st) => (
              <div key={st.lbl} className={[s.bigstat, st.payout && s.bigstatPayout].filter(Boolean).join(' ')}>
                <div className={s.bsLbl}>{st.lbl}</div>
                <div className={s.bsV}>{st.v}</div>
                <div className={s.bsTrend}>{st.trend}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.body}>
        <div className={s.col}>
          <div className={s.card}>
            <div className={s.cardH}>
              <h3>
                Daily plays · <em>last 14 days</em>
              </h3>
              <div className={s.range}>
                {['7d', '14d', '30d', '1y'].map((r) => (
                  <button key={r} className={[s.rangeBtn, r === '14d' && s.rangeBtnOn].filter(Boolean).join(' ')}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.chart}>
              {BARS.map((h, i) => (
                <div key={i} className={[s.bar, i === BARS.length - 1 && s.barToday].filter(Boolean).join(' ')} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className={s.chartFoot}>
              <span>
                Peak: <em>today</em> · 4,212 plays · Sara picked you on Monday
              </span>
              <span>
                <em>Carta para a santa</em> is 71% of this
              </span>
            </div>
          </div>

          <div className={s.card}>
            <div className={s.cardH}>
              <h3>
                Curators &amp; <em>placements</em> · what landed your work this week
              </h3>
            </div>
            {CURATORS.map((c, i) => (
              <div key={i} className={s.row}>
                <span className={s.rowAv} style={c.tone === 'jade' ? { background: 'rgba(74,140,111,.2)', color: 'var(--jade-light)' } : undefined}>
                  {c.av}
                </span>
                <div>
                  <div className={s.rowWhat}>{c.what}</div>
                  <div className={s.rowWho}>{c.who}</div>
                </div>
                <div className={s.rowWhen}>{c.when}</div>
              </div>
            ))}
          </div>

          <div className={s.card}>
            <div className={s.cardH}>
              <h3>
                Where they're <em>listening</em> from
              </h3>
            </div>
            <div className={s.hint}>
              City-level only · we never see street or finer. <em>This is the most we'll ever tell you about a listener.</em>
            </div>
            {CITIES.map((c) => (
              <div key={c.nm} className={s.cityRow}>
                <span className={s.cityNm}>{c.nm}</span>
                <div className={s.barWrap}>
                  <div className={s.barBg}>
                    <div className={s.barFl} style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className={s.pct}>{c.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={s.col}>
          <div className={s.card}>
            <div className={s.cardH}>
              <h3>
                Things you can <em>do</em> from here
              </h3>
            </div>
            <div className={s.quickList}>
              <Link to={routes.studioUpload} className={s.quickItem}>
                <span className={s.quickIc}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </span>
                <span className={s.quickNm}>
                  Upload a new release
                  <small>WAV / FLAC · 3 steps · 8 minutes</small>
                </span>
                <span className={s.quickArr}>→</span>
              </Link>
              <Link to={routes.studio} className={s.quickItem}>
                <span className={s.quickIc}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx={12} cy={12} r={9} />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                <span className={s.quickNm}>
                  Go live — host a listening room
                  <small>Plan: Wed 10 Jun · premiere of Cidade dos santos</small>
                </span>
                <span className={s.quickArr}>→</span>
              </Link>
              <Link to={routes.studioPayouts} className={s.quickItem}>
                <span className={s.quickIc}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </span>
                <span className={s.quickNm}>
                  Review payouts &amp; banking
                  <small>Next: €2,140 on 5 Jul · SEPA</small>
                </span>
                <span className={s.quickArr}>→</span>
              </Link>
            </div>
          </div>

          <div className={s.sideCard}>
            <div className={s.sideEb}>The deal, always</div>
            <h4>
              80% to <em>you.</em>
            </h4>
            <p>Every play, every tip, every buy. The split is the same for a first release as for a festival winner — and it's printed on the public ledger.</p>
            <ul className={s.sideList}>
              <li>
                <span>Per play</span>
                <em>€0.05</em>
              </li>
              <li>
                <span>Your share</span>
                <em>80%+</em>
              </li>
              <li>
                <span>Tips</span>
                <em>100% to you</em>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </StudioCreatorShell>
  )
}
