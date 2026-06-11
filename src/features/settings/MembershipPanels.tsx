import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  TIERS,
  CURRENT_PLAN,
  BILLING_ROWS,
  PAYMENT_METHOD,
  INVOICES,
  ACCESS_ITEMS,
  type TierKey,
} from './membership.data'
import styles from './MembershipPage.module.css'

const CheckIcon = () => (
  <svg viewBox="0 0 11 11">
    <polyline points="1.5,5.5 4,8 9.5,2.5" />
  </svg>
)

export function PlanPanel() {
  const { showToast } = useToast()
  const [tierKey, setTierKey] = useState<TierKey>('sustaining')
  const [amount, setAmount] = useState<string>('20')
  const [saving, setSaving] = useState(false)
  const [pauseOpen, setPauseOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const tier = TIERS.find((t) => t.key === tierKey)!

  function pickTier(next: TierKey) {
    setTierKey(next)
    const t = TIERS.find((x) => x.key === next)!
    if (t.defaultAmt) setAmount(t.defaultAmt)
  }

  function savePlan() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast('Plan updated. Changes take effect on 5 June.', 'success')
    }, 1400)
  }

  function confirmPause() {
    setPauseOpen(false)
    showToast('Membership paused from 5 June. Resume anytime from this page.', 'success')
  }

  function confirmCancel() {
    setCancelOpen(false)
    showToast('Membership cancelled. Your access continues until 5 June.', 'info')
  }

  return (
    <div className={styles.panel}>
      <div className={styles.current}>
        <div className={styles.currEye}>Current plan</div>
        <div className={styles.currTier}>{CURRENT_PLAN.tier}</div>
        <div className={styles.currAmt}>
          {CURRENT_PLAN.amount} <span>{CURRENT_PLAN.cadence}</span>
        </div>
        <div className={styles.currMeta}>{CURRENT_PLAN.since}</div>
        <div className={styles.currPill}>
          <span className={styles.cpillDot} />
          Active
        </div>
      </div>

      <div className={styles.sec}>Switch tier</div>
      <div className={styles.tierGrid}>
        {TIERS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tierBtn} ${tierKey === t.key ? styles.sel : ''}`}
            onClick={() => pickTier(t.key)}
          >
            {t.name}
            <small>{t.sub}</small>
          </button>
        ))}
      </div>
      <div className={styles.tierDesc}>{tier.desc}</div>

      {tier.amounts && (
        <div>
          <div className={styles.amtGrid}>
            {tier.amounts.map((a) => (
              <button
                key={a}
                className={`${styles.amtBtn} ${amount === a ? styles.sel : ''}`}
                onClick={() => setAmount(a)}
              >
                {a === 'other' ? 'Other' : `€${a}`}
                <small>{a === 'other' ? 'amount' : '/ mo'}</small>
              </button>
            ))}
          </div>
          {amount === 'other' && (
            <input
              className={styles.customIn}
              type="text"
              placeholder="e.g. €35 / month"
              autoFocus
            />
          )}
        </div>
      )}

      <p className={styles.fineprint}>
        Changes take effect at the next billing date. You'll never be locked out mid-cycle.
      </p>
      <Button variant="primary" onClick={savePlan} disabled={saving}>
        {saving ? 'Saving…' : 'Save changes →'}
      </Button>

      <div className={styles.danger}>
        <button className={styles.dngBtn} onClick={() => setPauseOpen((v) => !v)}>
          Pause for 1 month
        </button>
        <button className={styles.dngBtn} onClick={() => setCancelOpen((v) => !v)}>
          Cancel membership
        </button>
      </div>

      {pauseOpen && (
        <div className={styles.confirmBox}>
          <p className={styles.confirmText}>
            Pausing means your access continues until 5 June, then suspends for 30 days. You can
            unpause at any time. Your position in the community is never affected.
          </p>
          <div className={styles.confirmRow}>
            <Button variant="ghost" onClick={confirmPause}>
              Confirm pause
            </Button>
            <Button variant="ghost" onClick={() => setPauseOpen(false)}>
              Keep active
            </Button>
          </div>
        </div>
      )}

      {cancelOpen && (
        <div className={styles.confirmBox}>
          <p className={styles.confirmHead}>Before you go</p>
          <p className={styles.confirmText}>
            If it's financial, there's a hardship waiver — you stay in the community at no cost. If
            you're taking a break, the pause option keeps your account warm. If we've done something
            wrong, we want to know.
          </p>
          <div className={styles.confirmRow}>
            <Button variant="ghost" onClick={confirmCancel}>
              Cancel membership
            </Button>
            <Button variant="primary" onClick={() => setCancelOpen(false)}>
              Keep membership
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function BillingPanel() {
  const { showToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [cardNum, setCardNum] = useState('')
  const [last4, setLast4] = useState('4242')
  const [saving, setSaving] = useState(false)

  function formatCard(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    setCardNum(digits.match(/.{1,4}/g)?.join(' ') ?? digits)
  }

  function saveCard() {
    const digits = cardNum.replace(/\s/g, '')
    if (digits.length < 16) {
      showToast('Please enter a valid card number.', 'error')
      return
    }
    setSaving(true)
    setTimeout(() => {
      setLast4(digits.slice(-4))
      setSaving(false)
      setFormOpen(false)
      setCardNum('')
      showToast('Card updated.', 'success')
    }, 1200)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.sec} style={{ marginTop: 0 }}>
        Payment history
      </div>
      <div className={styles.infoCard}>
        {BILLING_ROWS.map((row) => (
          <div key={row.label} className={styles.infoRow}>
            <span className={styles.infoLbl}>{row.label}</span>
            <span className={`${styles.infoVal} ${row.ok ? styles.ok : ''}`}>{row.value}</span>
          </div>
        ))}
      </div>

      <div className={styles.sec}>Payment method</div>
      <div className={styles.pm}>
        <div className={styles.pmIco}>{PAYMENT_METHOD.brand}</div>
        <div style={{ flex: 1 }}>
          <div className={styles.pmNum}>•••• •••• •••• {last4}</div>
          <div className={styles.pmExp}>{PAYMENT_METHOD.expiry}</div>
        </div>
        <button className={styles.updBtn} onClick={() => setFormOpen((v) => !v)}>
          Update card
        </button>
      </div>

      {formOpen && (
        <div className={styles.cardForm}>
          <p className={styles.cardFormNote}>
            Enter your new card details. We use Stripe for secure card handling — we never store card
            numbers.
          </p>
          <div>
            <label className={styles.cfl}>Card number</label>
            <input
              className={styles.cfi}
              type="text"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={cardNum}
              onChange={(e) => formatCard(e.target.value)}
            />
          </div>
          <div className={styles.cfRow}>
            <div>
              <label className={styles.cfl}>Expiry</label>
              <input className={styles.cfi} type="text" placeholder="MM / YY" maxLength={7} />
            </div>
            <div>
              <label className={styles.cfl}>CVC</label>
              <input className={styles.cfi} type="text" placeholder="•••" maxLength={4} />
            </div>
          </div>
          <div className={styles.cfStack}>
            <label className={styles.cfl}>Name on card</label>
            <input className={styles.cfi} type="text" placeholder="Full name" />
          </div>
          <div className={styles.cardFormActions}>
            <Button variant="primary" onClick={saveCard} disabled={saving}>
              {saving ? 'Saving…' : 'Save card'}
            </Button>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className={styles.sec}>Invoices</div>
      <div>
        {INVOICES.map((inv) => (
          <div key={inv.period} className={styles.invRow}>
            <span className={styles.invPeriod}>{inv.period}</span>
            <span className={styles.invAmt}>{inv.amount}</span>
            <button
              className={styles.invDl}
              onClick={() => showToast(`Downloading invoice for ${inv.period}…`, 'info')}
            >
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AccessPanel() {
  return (
    <div className={styles.panel}>
      <p className={styles.accessLead}>
        Everything your Sustaining membership unlocks. Changing tiers doesn't affect access until the
        current cycle ends.
      </p>
      <div className={styles.acList}>
        {ACCESS_ITEMS.map((item) => (
          <div key={item.label} className={styles.acItem}>
            <div className={styles.acIc}>
              <CheckIcon />
            </div>
            <span className={styles.acLabel}>{item.label}</span>
            <span className={styles.acNote}>{item.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
