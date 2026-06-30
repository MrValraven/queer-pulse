import { useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Tabs } from '../../shared/components/ui'
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
          <Tabs
            variant="underline"
            tint="dark"
            tabs={TABS}
            active={tab}
            onChange={(id) => setTab(id as TabId)}
          />
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

      <Outro
        title={<>Your health <em>matters.</em></>}
        sub="Questions, concerns, or just not sure where to start — the community is here."
      >
        <Button to={routes.wellbeing} variant="primary" size="lg">
          Wellbeing resources
        </Button>
        <Button to={routes.communities} variant="ghost-dark" size="lg">
          Find peer support
        </Button>
      </Outro>
    </PageShell>
  )
}
