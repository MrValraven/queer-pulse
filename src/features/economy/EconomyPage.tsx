import { useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { JOBS, MENTORSHIP, type Tab } from './economy.data'
import { FreelanceTab, IncubatorTab, SalaryTab } from './EconomyTabs'
import styles from './EconomyPage.module.css'

const TAB_LABELS: Record<Tab, string> = {
  incubator: 'Business incubator',
  freelance: 'Freelance tools',
  salary: 'Salary board',
}

export function EconomyPage() {
  const [tab, setTab] = useState<Tab>('incubator')

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Queer economy</div>
          <h1>
            Build something that <em>lasts.</em>
          </h1>
          <p className={styles.lead}>
            Tools, mentorship, and solidarity for queer founders, freelancers, and professionals —
            because economic independence is part of queer liberation.
          </p>
          <div className={styles.tabs}>
            {(['incubator', 'freelance', 'salary'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                className={[styles.tab, tab === t && styles.tabActive].filter(Boolean).join(' ')}
                onClick={() => setTab(t)}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          {tab === 'incubator' && <IncubatorTab />}
          {tab === 'freelance' && <FreelanceTab />}
          {tab === 'salary' && <SalaryTab />}
        </div>
      </div>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Build it <em>with us.</em>
          </h2>
          <p className={styles.outroSub}>
            A stronger queer economy benefits all of us. Start with the tools, stay for the community.
          </p>
          <div className={styles.outroBtns}>
            <Button to={JOBS} variant="primary" size="lg">
              Browse jobs
            </Button>
            <Button to={MENTORSHIP} variant="ghost-dark" size="lg">
              Find a mentor
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
