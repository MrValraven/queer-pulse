import { useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { TABS, type TabId } from './sexualHealth.data'
import { GuidesTab, HivTab, PrepTab, TestingTab } from './SexualHealthTabs'
import styles from './SexualHealthPage.module.css'

export function SexualHealthPage() {
  const [tab, setTab] = useState<TabId>('testing')

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Sexual health</div>
          <h1>
            Your health, on your <em>own terms.</em>
          </h1>
          <p className={styles.lead}>
            Direct, queer-specific, non-judgmental. Testing, PrEP, HIV resources, and a
            community-reviewed provider directory — all in one place.
          </p>
          <div className={styles.tabs}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={[styles.tab, tab === t.id && styles.tabActive].filter(Boolean).join(' ')}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          {tab === 'testing' && <TestingTab />}
          {tab === 'prep' && <PrepTab />}
          {tab === 'hiv' && <HivTab />}
          {tab === 'guides' && <GuidesTab />}
        </div>
      </div>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Your health <em>matters.</em>
          </h2>
          <p className={styles.outroSub}>
            Questions, concerns, or just not sure where to start — the community is here.
          </p>
          <div className={styles.outroBtns}>
            <Button to={routes.wellbeing} variant="primary" size="lg">
              Wellbeing resources
            </Button>
            <Button to={routes.communities} variant="ghost-dark" size="lg">
              Find peer support
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
