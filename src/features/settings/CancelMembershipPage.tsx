import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import styles from './CancelMembershipPage.module.css'

type Step = 1 | 2 | 3 | 'done'

const REASONS = [
  { id: 'r1', label: <><b>Money is tight.</b> The price isn't right for me right now.</> },
  { id: 'r2', label: <><b>I'm not using it enough.</b> Logging in less than I'd like.</> },
  { id: 'r3', label: <><b>I'm leaving Lisbon</b> or no longer based here.</> },
  { id: 'r4', label: <><b>Something happened on the platform</b> that I want to flag.</> },
  { id: 'r5', label: <><b>I don't see the value</b> in the perks I'm paying for.</> },
  { id: 'r6', label: <><b>Other / prefer not to say.</b></> },
]

const ENDS: { t: string; d: ReactNode }[] = [
  { t: 'Sustainer-only Open Studio', d: "You'll lose your standing invite to the monthly sessions." },
  { t: 'Magazine subscription', d: 'Quarterly print magazine stops shipping after the next issue.' },
  { t: 'Free ILGA legal consult', d: 'Your unused consult for this year expires when membership ends.' },
  { t: 'Sustainer badge', d: <>The little <FiHeart /> on your profile goes away.</> },
]

const STAYS = [
  { t: 'Your account & connections', d: 'Profile, messages, connections, communities — all stay.' },
  { t: 'Gatherings & communities', d: 'You can still RSVP, attend, and host.' },
  { t: 'Wellbeing resources', d: 'Crisis chat, directory, vetted therapists — open to everyone.' },
  { t: 'Safe-spaces network', d: 'The whole point of QueerPulse stays free.' },
]

export function CancelMembershipPage() {
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>(1)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [confirmed, setConfirmed] = useState(false)

  function goStep(n: Step) { setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  function pickAlt(kind: 'pause' | 'downshift') {
    if (kind === 'pause') showToast('Membership paused for 3 months — confirmed', 'success')
    if (kind === 'downshift') showToast('Downshifted to Member · next charge €36', 'success')
  }

  function doCancel() {
    goStep('done')
    showToast('Membership cancelled · email sent', 'success')
  }

  const stepNum = step === 'done' ? 3 : step

  return (
    <AppShell>
      <div className={styles.page}>
        <Link to={routes.membership} className={styles.back}>← Membership</Link>
        <div className={styles.eyebrow}>Cancel · Sustainer (annual)</div>
        <h1 className={styles.h1}>Sorry to see you <em>thinking about it.</em></h1>
        <p className={styles.lead}>No dark patterns — three quick steps and you're out, or you can pause or downshift instead. Either way, no shame. Your community access remains.</p>

        <div className={styles.stepper}>
          {[1, 2, 3].map((n, i) => {
            const labels = ['Options', 'Tell us why', 'Confirm']
            const isActive = step !== 'done' && stepNum === n
            const isDone = step === 'done' ? true : stepNum > n
            return (
              <>
                <div key={n} className={`${styles.cs} ${isActive ? styles.csActive : ''} ${isDone ? styles.csDone : ''}`}>
                  <div className={styles.csN}>{n}</div>
                  <div className={styles.csL}>{labels[i]}</div>
                </div>
                {i < 2 && <div key={`bar-${n}`} className={`${styles.csBar} ${isDone ? styles.csBarDone : ''}`} />}
              </>
            )
          })}
        </div>

        {step === 1 && (
          <div className={styles.pane}>
            <h2>Your current <em>membership</em></h2>
            <div className={styles.curr}>
              <div className={styles.currBadge}>S</div>
              <div><div className={styles.currTier}>Sustainer · <em>annual</em></div><div className={styles.currMeta}>Renewed <b>6 Jun 2026</b> · next charge <b>6 Jun 2027</b></div></div>
              <div className={styles.currPrice}>€96<span className={styles.currCy}>/ year</span></div>
            </div>
            <h2 style={{ marginTop: 14 }}>Before you go — <em>three softer options</em></h2>
            <p className={styles.paneSub}>Each takes 30 seconds. You can always come back to cancel.</p>
            <div className={styles.altList}>
              <button className={styles.alt} onClick={() => pickAlt('pause')}>
                <div className={styles.altIc}>⏸</div>
                <div className={styles.altText}><div className={styles.altT}>Pause for 3 months</div><div className={styles.altD}>We freeze your renewal. You keep access. We don't charge until you resume.</div></div>
                <div className={styles.altArrow}>→</div>
              </button>
              <button className={styles.alt} onClick={() => pickAlt('downshift')}>
                <div className={styles.altIc} style={{ background: 'rgba(var(--accent-rgb),.12)', color: 'var(--accent-ink)' }}>↓</div>
                <div className={styles.altText}><div className={styles.altT}>Downshift to Member (€36/year)</div><div className={styles.altD}>Keep all community access. Drop Sustainer-only perks (open studio, ILGA consult, magazine).</div></div>
                <div className={styles.altArrow}>→</div>
              </button>
              <Link to={routes.solidarity} className={styles.alt}>
                <div className={styles.altIc} style={{ background: 'rgba(45,27,61,.08)', color: 'var(--plum)' }}><FiHeart /></div>
                <div className={styles.altText}><div className={styles.altT}>Drop to solidarity rate</div><div className={styles.altD}>€12/year, no questions asked. The fund covers the difference. <b>Genuinely.</b></div></div>
                <div className={styles.altArrow}>→</div>
              </Link>
            </div>
            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => goStep(2)}>Continue cancelling →</Button>
              <Link to={routes.membership}><Button variant="ghost">Keep my Sustainer</Button></Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.pane}>
            <h2>Help us <em>understand.</em></h2>
            <p className={styles.paneSub}>Optional, but useful. We read every response. Pick what fits.</p>
            <div className={styles.reasonList}>
              {REASONS.map((r) => (
                <label key={r.id} className={`${styles.reason} ${checked.has(r.id) ? styles.reasonChecked : ''}`}>
                  <input type="checkbox" checked={checked.has(r.id)} onChange={(e) => setChecked((prev) => { const n = new Set(prev); if (e.target.checked) n.add(r.id); else n.delete(r.id); return n })} />
                  <div className={styles.reasonText}>{r.label}</div>
                </label>
              ))}
            </div>
            <p style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--ink-40)', marginTop: 8 }}>Anything you'd like to add? (optional)</p>
            <textarea className={styles.reasonTextarea} placeholder="A sentence or two helps us notice patterns. Nothing's shown to other members." />
            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => goStep(1)}>← Back</Button>
              <Button variant="ghost" onClick={() => goStep(3)}>Continue →</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.pane}>
            <h2>One last <em>check.</em></h2>
            <p className={styles.paneSub}>Here's what changes when you cancel — and what doesn't.</p>
            <div className={styles.secLabel}>What ends</div>
            <div className={styles.loseGrid}>
              {ENDS.map((e) => <div key={e.t} className={styles.lose}><b>{e.t}</b><span>{e.d}</span></div>)}
            </div>
            <div className={styles.secLabel}>What stays — free, forever</div>
            <div className={styles.loseGrid}>
              {STAYS.map((s) => <div key={s.t} className={`${styles.lose} ${styles.keep}`}><b>{s.t}</b><span>{s.d}</span></div>)}
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink-60)', lineHeight: 1.65, marginBottom: 8 }}>Your access continues until <b style={{ color: 'var(--plum)' }}>6 Jun 2027</b>. No refund — but no further charges.</p>
            <p style={{ fontSize: 14, color: 'var(--ink-60)', lineHeight: 1.65, marginBottom: 18 }}>If something feels off, write to <a href="mailto:cancel@queerpulse.app" style={{ color: 'var(--plum)', fontWeight: 600, textDecoration: 'none' }}>cancel@queerpulse.app</a> — a real person reads it.</p>
            <div className={styles.confirmRow}>
              <input type="checkbox" id="confirm-check" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              <label htmlFor="confirm-check">I understand my Sustainer membership will not renew, and <b>my access ends 6 Jun 2027</b>. I can come back any time.</label>
            </div>
            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => goStep(2)}>← Back</Button>
              <div className={styles.actionRight}>
                <Link to={routes.membership}><Button variant="primary">Keep my Sustainer</Button></Link>
                <Button variant="ghost" disabled={!confirmed} onClick={doCancel}>Cancel my membership</Button>
              </div>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className={styles.pane}>
            <div className={styles.farewell}>
              <div className={styles.farewellIc}><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg></div>
              <h2 className={styles.h1} style={{ margin: '0 auto 10px', fontSize: 36 }}>Until <em>next time.</em></h2>
              <p style={{ fontSize: 15, color: 'var(--ink-60)', lineHeight: 1.65, maxWidth: '42ch', margin: '0 auto 8px' }}>Your Sustainer membership won't renew. Access continues through <b style={{ color: 'var(--plum)', fontWeight: 700 }}>6 Jun 2027</b>.</p>
              <p style={{ fontSize: 15, color: 'var(--ink-60)', lineHeight: 1.65, maxWidth: '42ch', margin: '0 auto 8px' }}>We sent a confirmation to <b style={{ color: 'var(--plum)' }}>tomas@example.com</b> with everything written down.</p>
              <p style={{ fontSize: 13, color: 'var(--ink-40)', marginTop: 12 }}>If this was a mistake, you can resubscribe one-tap from the email or your account settings — no penalty.</p>
              <div className={styles.farewellBtns}>
                <Button variant="primary" to="/">Back to home</Button>
                <Button variant="ghost" to={routes.membership}>Resubscribe</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
