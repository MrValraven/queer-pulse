import { useState } from 'react'
import { StudioShell } from './StudioShell'
import { useToast } from '../../shared/components/feedback/useToast'
import { FILTERS, CALLS } from './studioOpenCalls.data'
import { StudioOpenCallCard } from './StudioOpenCallCard'
import s from './funding.module.css'

export function StudioOpenCallsPage() {
  const { showToast } = useToast()
  const [filter, setFilter] = useState('All open')

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={`${s.eb} ${s.ebAccent}`}>From the council</div>
          <h1>
            Open <em>calls</em> &amp; commissions.
          </h1>
          <div className={s.dek}>
            Briefs the council and co-op have funded. Apply inline — attach a <em>single track or release</em> from your catalogue. No cover letters, no portfolios; the work speaks.
          </div>
        </div>

        <div className={s.filter}>
          {FILTERS.map((f) => (
            <button key={f} className={[s.chip, filter === f && s.chipOn].filter(Boolean).join(' ')} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
          <span className={s.filterCount}>
            <em>7</em> open · you've applied to 2
          </span>
        </div>

        <div className={s.calls}>
          {CALLS.map((c) => (
            <StudioOpenCallCard key={c.id} call={c} />
          ))}

          {/* Applied state */}
          <div className={s.call} style={{ opacity: 0.72 }}>
            <div className={s.callTop}>
              <div className={s.callCur}>
                <span className={`${s.av} ${s.jade}`}>SM</span>
                <div>
                  <div className={s.nm}>Sara Marques</div>
                  <div className={s.ro}>Council · seat 1</div>
                </div>
              </div>
              <div className={s.callMain}>
                <div className={s.callTags}>
                  <span className={`${s.callTag} ${s.tagCommission}`}>Commission</span>
                  <span className={`${s.callTag} ${s.tagApplied}`}>Applied · 2 Jun</span>
                </div>
                <h3>
                  Closing theme for the <em>Pride assembly</em>
                </h3>
                <p className={s.brief}>
                  You attached <em>A Beja</em> and a note. Sara claimed it on 4 June. Decision by 18 June — you'll hear back here and by email, with a sentence either way.
                </p>
              </div>
              <div className={s.callAmt}>
                <div className="v" style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 28, color: 'var(--cream)' }}>
                  €<em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>500</em>
                </div>
                <div className="l" style={{ fontSize: 11, color: 'rgba(247,243,238,.4)' }}>flat</div>
              </div>
            </div>
            <div className={s.callFoot}>
              <div className={s.callMeta}>
                <span>Status · <em>in review with Sara</em></span>
                <span className={s.dot} />
                <span>decision by 18 Jun</span>
              </div>
              <div className={s.callActions}>
                <button className={s.bt} onClick={() => showToast('Application withdrawn', 'info')}>
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudioShell>
  )
}
