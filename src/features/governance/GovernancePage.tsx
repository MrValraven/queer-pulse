import { useEffect, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { NAV } from './governance.data'
import {
  CouncilSection,
  DecisionsSection,
  FinancesSection,
  HealthSection,
  ModerationSection,
  PrinciplesSection,
  RaiseSection,
} from './GovernanceSections'
import styles from './GovernancePage.module.css'

export function GovernancePage() {
  const [active, setActive] = useState('health')

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 140
      for (const { id } of NAV) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y && el.offsetTop + el.offsetHeight > y) {
          setActive(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Governance &amp; Transparency</div>
          <h1>
            How we run this, and who <em>decides.</em>
          </h1>
          <p>
            QueerPulse is a community platform. That means being transparent about how it's governed,
            how decisions are made, and what happens when things go wrong. This page is that record.
          </p>
        </div>
      </section>

      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <nav className={styles.nav}>
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={[styles.navItem, active === item.id && styles.navItemActive].filter(Boolean).join(' ')}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className={styles.content}>
              <HealthSection />
              <ModerationSection />
              <CouncilSection />
              <PrinciplesSection />
              <FinancesSection />
              <DecisionsSection />
              <RaiseSection />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
