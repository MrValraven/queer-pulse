import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import { StudioShell } from './StudioShell'
import { useToast } from '../../shared/components/feedback/useToast'
import { PLAN, REASSURE } from './studioCheckout.data'
import ss from './studio.module.css'
import s from './studioPages.module.css'

export function StudioCheckoutPage() {
  const { showToast } = useToast()
  const [done, setDone] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setDone(true)
    showToast('You\'re sustaining the studio — welcome in.')
  }

  if (done) {
    return (
      <StudioShell>
        <div className={`${s.done} ${s.screenIn}`} key="done">
          <div className={s.doneIcon}><FiCheck /></div>
          <h1>
            You're <em>sustaining</em> it now.
          </h1>
          <p>
            Welcome in. Every track you play from here pays the artist who made it. Your first
            payment of {PLAN.price} is done — the rest is just listening.
          </p>
          <div className={s.doneActions}>
            <Link to="/studio" className={ss.btP}>
              Start listening →
            </Link>
            <Link to="/studio/library" className={ss.bt}>
              Go to your library
            </Link>
          </div>
        </div>
      </StudioShell>
    )
  }

  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>Checkout</div>
        <h1>
          Sustain the <em>studio.</em>
        </h1>
        <div className={s.dek}>
          Seven euros a month keeps a fair-pay music platform alive — and pays the artists you
          actually listen to, on every play.
        </div>
      </div>

      <div className={s.coGrid}>
        <form onSubmit={handleSubmit}>
          <div className={s.coField}>
            <label className={s.coLabel} htmlFor="co-name">
              Name on card
            </label>
            <input id="co-name" className={s.coInput} type="text" placeholder="Your name" required />
          </div>
          <div className={s.coField}>
            <label className={s.coLabel} htmlFor="co-card">
              Card number
            </label>
            <input id="co-card" className={s.coInput} inputMode="numeric" placeholder="1234 5678 9012 3456" required />
          </div>
          <div className={s.coRow}>
            <div className={s.coField}>
              <label className={s.coLabel} htmlFor="co-exp">
                Expiry
              </label>
              <input id="co-exp" className={s.coInput} placeholder="MM / YY" required />
            </div>
            <div className={s.coField}>
              <label className={s.coLabel} htmlFor="co-cvc">
                CVC
              </label>
              <input id="co-cvc" className={s.coInput} inputMode="numeric" placeholder="123" required />
            </div>
          </div>
          <button type="submit" className={ss.btP} style={{ width: '100%', marginTop: 8 }}>
            Pay {PLAN.price}{PLAN.cadence} →
          </button>
          <p className={s.sumNote}>
            This is a prototype — no card is charged and nothing is stored.
          </p>
        </form>

        <aside className={s.summary}>
          <div className={s.sumH}>
            {PLAN.name} <em>membership</em>
          </div>
          {PLAN.lines.map((line) => (
            <div key={line.label} className={s.sumLine}>
              <span>{line.label}</span>
              <span>{line.value}</span>
            </div>
          ))}
          <div className={s.sumTotal}>
            <span>Due today</span>
            <span>{PLAN.price}</span>
          </div>
          <p className={s.sumNote}>
            {REASSURE.map((line) => (
              <span key={line} style={{ display: 'block', marginBottom: 6 }}>
                · {line}
              </span>
            ))}
          </p>
        </aside>
      </div>
    </StudioShell>
  )
}
