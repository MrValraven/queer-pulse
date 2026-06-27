import { useState, type FormEvent } from 'react'
import { FiCheck, FiLock } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { ModalShell, SuccessPanel, Sending, useSubmitFlow } from '../economy/ModalKit'
import modal from '../economy/ApplicationModals.module.css'
import styles from './DonateModal.module.css'

const FEE_RATE = 0.03

/** Pull the numeric value out of a "€15" style label. */
function parseAmount(label: string) {
  return Number(label.replace(/[^0-9.]/g, '')) || 0
}

function money(n: number) {
  return `€${n % 1 === 0 ? n : n.toFixed(2)}`
}

function formatCard(raw: string) {
  return raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits
}

export function DonateModal({
  amount,
  monthly,
  onClose,
}: {
  amount: string
  monthly: boolean
  onClose: () => void
}) {
  const { submit, sending, done } = useSubmitFlow()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [coverFee, setCoverFee] = useState(true)

  const base = parseAmount(amount)
  const fee = coverFee ? Math.round(base * FEE_RATE * 100) / 100 : 0
  const total = base + fee
  const cadence = monthly ? ' / month' : ''

  const ready =
    name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(email) &&
    card.replace(/\s/g, '').length >= 15 &&
    expiry.replace(/\D/g, '').length === 4 &&
    cvc.length >= 3

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!ready || sending) return
    submit(undefined, 1100)
  }

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title="You're in."
          em={monthly ? 'See you next month.' : 'Thank you.'}
          onClose={onClose}
          closeLabel="Done"
        >
          Your {money(total)}
          {cadence} goes straight to mutual aid, gatherings, and paying queer creatives fairly.{' '}
          {monthly
            ? 'Cancel anytime from your account — no questions asked.'
            : "We'll email your receipt shortly."}
        </SuccessPanel>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={modal.eyebrow}>Support QueerPulse</div>
          <h2 className={modal.title}>
            Confirm your <em>gift.</em>
          </h2>
          <p className={modal.sub}>No ads, no investors — just members keeping this alive.</p>

          <div className={modal.panel}>
            <div className={modal.rows}>
              <div className={modal.row}>
                <span className={modal.rowK}>{monthly ? 'Monthly gift' : 'One-off gift'}</span>
                <span className={modal.rowV}>
                  {money(base)}
                  {cadence}
                </span>
              </div>
              {coverFee && (
                <div className={modal.row}>
                  <span className={modal.rowK}>Processing fee covered</span>
                  <span className={modal.rowV}>{money(fee)}</span>
                </div>
              )}
              <div className={modal.row}>
                <span className={modal.rowK}>Charged today</span>
                <span className={modal.rowV}>
                  {money(total)}
                  {cadence}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={`${modal.checkRow} ${coverFee ? modal.checkRowOn : ''}`}
            onClick={() => setCoverFee((v) => !v)}
            aria-pressed={coverFee}
          >
            <span className={modal.checkBox}>{coverFee && <FiCheck size={14} aria-hidden />}</span>
            <span className={modal.checkText}>
              <span className={modal.checkLabel}>
                Cover the {Math.round(FEE_RATE * 100)}% processing fee
              </span>
              <span className={modal.checkHint}>
                So 100% of your {money(base)} reaches the community.
              </span>
            </span>
          </button>

          <div className={modal.field}>
            <label htmlFor="dn-name">Name on card</label>
            <input
              id="dn-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              autoComplete="cc-name"
            />
          </div>
          <div className={modal.field}>
            <label htmlFor="dn-email">Email for receipt</label>
            <input
              id="dn-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className={modal.field}>
            <label htmlFor="dn-card">Card number</label>
            <input
              id="dn-card"
              inputMode="numeric"
              value={card}
              onChange={(e) => setCard(formatCard(e.target.value))}
              placeholder="4242 4242 4242 4242"
              autoComplete="cc-number"
            />
          </div>
          <div className={modal.fieldRow}>
            <div className={modal.field}>
              <label htmlFor="dn-exp">Expiry</label>
              <input
                id="dn-exp"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM / YY"
                autoComplete="cc-exp"
              />
            </div>
            <div className={modal.field}>
              <label htmlFor="dn-cvc">CVC</label>
              <input
                id="dn-cvc"
                inputMode="numeric"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                autoComplete="cc-csc"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="jade"
            size="lg"
            disabled={!ready || sending}
            style={{ width: '100%' }}
          >
            {sending ? (
              <Sending label="Processing…" />
            ) : (
              <>
                Donate {money(total)}
                {cadence}
              </>
            )}
          </Button>
          <p className={styles.secure}>
            <FiLock size={12} aria-hidden /> Encrypted &amp; secure. This is a prototype — no real
            charge is made.
          </p>
        </form>
      )}
    </ModalShell>
  )
}
