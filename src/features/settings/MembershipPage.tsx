import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { FadeIn } from '../../shared/components/ui'
import { PlanPanel, BillingPanel, AccessPanel } from './MembershipPanels'
import { routes } from '../../app/routeMap'
import { MembershipSidebar } from './MembershipSidebar'
import styles from './MembershipPage.module.css'

type Tab = 'plan' | 'billing' | 'access'

const TABS: { key: Tab; label: string }[] = [
  { key: 'plan', label: 'Plan' },
  { key: 'billing', label: 'Billing' },
  { key: 'access', label: 'Access' },
]

export function MembershipPage() {
  const [tab, setTab] = useState<Tab>('plan')

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.bc}>
          <Link to={routes.homepage}>Account</Link>
          <span className={styles.bcSep}>›</span>
          <span className={styles.bcCurrent}>Membership</span>
        </div>
        <h1 className={styles.title}>
          Your <em>membership</em>
        </h1>

        <div className={styles.layout}>
          <div>
            <div className={styles.tabs}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`${styles.tab} ${tab === t.key ? styles.active : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <FadeIn key={tab}>
              {tab === 'plan' && <PlanPanel />}
              {tab === 'billing' && <BillingPanel />}
              {tab === 'access' && <AccessPanel />}
            </FadeIn>
          </div>

          <MembershipSidebar />
        </div>
      </div>
    </AppShell>
  )
}
