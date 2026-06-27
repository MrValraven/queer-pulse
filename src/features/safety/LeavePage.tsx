import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { Footer } from '../../shared/components/layout'
import s from './flows.module.css'

type State = 'considering' | 'pausing' | 'confirmed'

const DELETED = ['Your profile, bio, and display name', 'Your connections and message history', 'Your gathering history and earned badges', 'Your saved articles and reading history', 'Your invite history and vouches given']
const PAUSE_EFFECTS = ['Your profile becomes invisible to other members', "You won't appear in search or the member directory", 'All notifications are paused', 'All your data, badges, and connections are preserved', 'Sign back in at any time to reactivate instantly']
const DURATIONS = [
  { label: '1 month', back: 'Back on 6 July 2026' },
  { label: '3 months', back: 'Back on 6 September 2026' },
  { label: '6 months', back: 'Back on 6 December 2026' },
]

export function LeavePage() {
  const { showToast } = useToast()
  const [state, setState] = useState<State>('considering')
  const [dur, setDur] = useState('1 month')

  return (
    <>
    <div className={s.page}>
      {state === 'considering' && (
        <div className={`${s.card} ${s.cardWide} ${s.screenIn}`}>
          <Link to={routes.settings} className={s.backLink}>
            ← Back to settings
          </Link>
          <div className={s.title}>
            <em>Leaving</em> QueerPulse
          </div>
          <div className={s.sub}>We're sorry to see you go. Before you delete your account, we want to make sure this is the right choice — and that you have everything you need.</div>

          <div className={s.lossCard}>
            <div className={s.lcLabel}>What gets deleted</div>
            {DELETED.map((d) => (
              <div key={d} className={s.lossItem}>
                <span className={s.lossDot} />
                {d}
              </div>
            ))}
            <div className={s.privacyNote}>
              We retain only anonymised, aggregated data. Your personal data is deleted within 30 days. <Link to={routes.safety}>Read our Privacy Policy →</Link>
            </div>
          </div>

          <div className={s.altLabel}>There might be a gentler option</div>
          <div className={s.altCard}>
            <span className={s.altIcon} style={{ background: 'rgba(74,140,111,.1)' }}>
              <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                <circle cx={9} cy={9} r={6.5} stroke="var(--jade)" strokeWidth={1.6} />
                <path d="M6.5 9h5M9 6.5v5" stroke="var(--jade)" strokeWidth={1.6} strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <div className={s.altTitle}>Take a break — pause for up to 6 months</div>
              <div className={s.altDesc}>Your profile goes private, you disappear from search, and no notifications are sent. Everything is exactly as you left it when you come back.</div>
              <Button variant="ghost" onClick={() => setState('pausing')}>
                Pause instead
              </Button>
            </div>
          </div>
          <div className={s.altCard}>
            <span className={s.altIcon} style={{ background: 'rgba(45,27,61,.06)' }}>
              <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="rgba(45,27,61,.4)" strokeWidth={1.8} strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <div className={s.altTitle}>Step back quietly — reduce your presence</div>
              <div className={s.altDesc}>Set your profile to private, mute all notifications, and come back whenever you're ready. No pressure, no timer, no questions.</div>
              <Button variant="ghost" to={routes.settings}>
                Go quiet instead
              </Button>
            </div>
          </div>

          <div className={s.divider} />
          <div className={s.stillWant}>Still want to delete?</div>
          <textarea className={s.reasonTa} placeholder="Optional — tell us why you're leaving. We read every response." />
          <button className={s.deleteBtn} onClick={() => setState('confirmed')}>
            Delete my account
          </button>
        </div>
      )}

      {state === 'pausing' && (
        <div className={`${s.card} ${s.screenIn}`}>
          <button className={s.backLink} onClick={() => setState('considering')}>
            ← Back
          </button>
          <div className={s.title}>
            Pausing your <em>account</em>
          </div>
          <div className={s.sub} style={{ marginBottom: 22 }}>
            Your profile goes private, you leave search results, and we stop sending notifications. Everything is preserved.
          </div>
          <div className={s.durOpts}>
            {DURATIONS.map((d) => (
              <div
                key={d.label}
                className={[s.durOpt, dur === d.label && s.durOptSelected].filter(Boolean).join(' ')}
                onClick={() => setDur(d.label)}
                role="radio"
                aria-checked={dur === d.label}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setDur(d.label)
                  }
                }}
              >
                <span className={s.ocRadio}>
                  <span className={s.ocDot} />
                </span>
                <div>
                  <div className={s.durTitle}>{d.label}</div>
                  <div className={s.durDesc}>{d.back}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={s.lossCard} style={{ marginBottom: 22 }}>
            <div className={s.lcLabel}>What pausing does</div>
            {PAUSE_EFFECTS.map((e) => (
              <div key={e} className={s.lossItem}>
                <span className={s.lossDot} style={{ background: 'var(--jade)' }} />
                {e}
              </div>
            ))}
          </div>
          <div className={s.actions}>
            <Button onClick={() => showToast(`Account paused for ${dur}`, 'success')}>Pause my account</Button>
            <button className={s.cancelLink} onClick={() => setState('considering')}>
              Actually, I'd rather delete →
            </button>
          </div>
        </div>
      )}

      {state === 'confirmed' && (
        <div className={`${s.card} ${s.center} ${s.screenIn}`}>
          <div className={s.icon} style={{ background: 'rgba(45,27,61,.07)' }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8" stroke="var(--plum)" strokeWidth={1.8} strokeLinecap="round" />
              <path d="M12 8v4.5M16 4l-1.5 4-4-1.5" stroke="var(--plum)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={s.title}>
            Account deletion <em>requested</em>
          </div>
          <div className={s.sub}>Your account will be fully deleted within 30 days. You've been signed out and your profile is no longer visible.</div>
          <div className={s.timeline}>
            <div className={s.tlStep}>
              <div className={`${s.tlDot} ${s.tlActive}`}>1</div>
              <div className={s.tlLabel}>Request submitted</div>
            </div>
            <div className={s.tlLine} />
            <div className={s.tlStep}>
              <div className={`${s.tlDot} ${s.tlPending}`}>2</div>
              <div className={s.tlLabel}>Processing</div>
            </div>
            <div className={s.tlLine} />
            <div className={s.tlStep}>
              <div className={`${s.tlDot} ${s.tlPending}`}>3</div>
              <div className={s.tlLabel}>Deleted</div>
            </div>
          </div>
          <div className={s.reportNote} style={{ borderTop: 'none' }}>
            Changed your mind? You can cancel by signing back in within 30 days.
            <br />
            <Link to={routes.signIn}>Sign in to cancel →</Link>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  )
}
