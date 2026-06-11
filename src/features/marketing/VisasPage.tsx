import { useRef, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { ARRIVING, FORUM, GROUND, LAWYERS, ROUTES, TABS, type TabId } from './visas.data'
import { VisasTabContent } from './VisasTabContent'
import styles from './VisasPage.module.css'

export function VisasPage() {
  const [active, setActive] = useState<TabId>('eu')
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null)
  const tabNavRef = useRef<HTMLDivElement>(null)

  const selectRoute = (index: number, tab: TabId) => {
    setSelectedRoute(index)
    setActive(tab)
    const el = tabNavRef.current
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
    }
  }

  const tab = TABS.find((t) => t.id === active) ?? TABS[0]

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Visas &amp; Residency · Portugal</div>
          <h1>
            Portugal, legally. <em>Your path to residency.</em>
          </h1>
          <p className={styles.heroSub}>
            Practical information about visas, residency, and citizenship in Portugal — and what queer
            couples and families need to know that the official guidance doesn't always say clearly.
          </p>
          <div className={styles.heroNote}>
            <span className={styles.heroNoteDot} />
            Community information, not legal advice. Immigration law changes — always verify with a
            specialist.
          </div>
        </div>
      </div>

      <section className={styles.routeSection}>
        <div className="wrap">
          <div className={styles.routeLabel}>
            Where are you <em>starting from?</em>
          </div>
          <div className={styles.routeGrid}>
            {ROUTES.map((r, i) => (
              <button
                key={r.name}
                type="button"
                className={[styles.routeCard, selectedRoute === i && styles.routeSel].filter(Boolean).join(' ')}
                onClick={() => selectRoute(i, r.tab)}
              >
                <div className={styles.rcName}>{r.name}</div>
                <div className={styles.rcDesc}>{r.desc}</div>
                <div className={styles.rcTo}>{r.to}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.tabNav} ref={tabNavRef}>
        <div className={styles.tabNavInner}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={[styles.tabBtn, active === t.id && styles.tabBtnActive].filter(Boolean).join(' ')}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <VisasTabContent tab={tab} onPartnerLink={() => setActive('partner')} />

      <section className={styles.groundSec}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              On the <em>ground</em>
            </h2>
            <div className={styles.secHeadSub}>Practical first steps regardless of your visa route.</div>
          </div>
          <div className={styles.groundGrid}>
            {GROUND.map((g) => (
              <div className={styles.groundCard} key={g.title}>
                <div className={styles.gcLabel}>{g.label}</div>
                <div className={styles.gcTitle}>{g.title}</div>
                <div className={styles.gcBody}>{g.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.lawyerSec}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Community-reviewed <em>immigration lawyers</em>
            </h2>
          </div>
          <div className={styles.reviewGrid}>
            {LAWYERS.map((l) => (
              <div className={styles.reviewCard} key={l.name}>
                <div className={styles.rvTop}>
                  <div className={styles.rvAv} style={{ background: l.bg, color: l.color }}>
                    {l.initials}
                  </div>
                  <div>
                    <div className={styles.rvName}>{l.name}</div>
                    <div className={styles.rvContext}>{l.context}</div>
                  </div>
                </div>
                <div className={styles.rvStars}>{l.stars}</div>
                <div className={styles.rvQuote}>{l.quote}</div>
              </div>
            ))}
          </div>
          <div className={styles.lawyerCta}>
            <Button to={FORUM} variant="ghost">
              Ask the visa forum thread →
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            You're building a life <em>here.</em>
          </h2>
          <p className={styles.outroSub}>The paperwork is temporary. The community is permanent.</p>
          <div className={styles.outroBtns}>
            <Button to={ARRIVING} variant="primary" size="lg">
              Settling in guide →
            </Button>
            <Button to={FORUM} variant="ghost-dark" size="lg">
              Ask the community
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
