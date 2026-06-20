import { useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import {
  ClubSection,
  CommissionsSection,
  ShowcaseSection,
  RadioIntro,
} from './CultureSections'
import { CultureRadioPanel } from './CultureRadioPanel'
import { TABS, type TabKey } from './culture.data'
import styles from './CulturePage.module.css'

export function CulturePage() {
  const { showToast } = useToast()
  const [tab, setTab] = useState<TabKey>('club')

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Cultural life</div>
          <h1 className={styles.heroH}>
            The queer <em>cultural life</em> of Lisbon.
          </h1>
          <p className={styles.lead}>
            What we read, watch, make, and listen to — between gatherings and beyond them.
            Community-curated, ever-changing.
          </p>
          <div className={styles.tabs} role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <div className="wrap">
          {tab === 'club' && <ClubSection />}
          {tab === 'commission' && <CommissionsSection />}
          {tab === 'showcase' && <ShowcaseSection />}
          {tab === 'radio' && <RadioIntro />}
        </div>
      </div>

      {tab === 'radio' && <CultureRadioPanel />}

      <Outro
        title={<>Make something <em>with us.</em></>}
        sub="Culture isn't what happens at events. It's what we build between them — quietly, consistently, together."
      >
        <Button size="lg" onClick={() => showToast('Submission form opened', 'info')}>
          Submit your work
        </Button>
        <Button size="lg" variant="ghost-dark" to={routes.communities}>
          Explore communities
        </Button>
      </Outro>
    </PageShell>
  )
}
