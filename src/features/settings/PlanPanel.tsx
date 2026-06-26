import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { TIERS, CURRENT_PLAN, type TierKey } from './membership.data'
import styles from './MembershipPage.module.css'

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
