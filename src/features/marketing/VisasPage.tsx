import { useRef, useState } from 'react'
import { FiStar } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
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
          <Reveal as="div" className={styles.cat}>Visas &amp; Residency · Portugal</Reveal>
          <Reveal as="h1" delay={60}>
            Portugal, legally. <em>Your path to residency.</em>
          </Reveal>
          <Reveal as="p" className={styles.heroSub} delay={120}>
            Practical information about visas, residency, and citizenship in Portugal — and what queer
            couples and families need to know that the official guidance doesn't always say clearly.
          </Reveal>
          <Reveal className={styles.heroNote} delay={160}>
            <span className={styles.heroNoteDot} />
            Community information, not legal advice. Immigration law changes — always verify with a
            specialist.
          </Reveal>
        </div>
      </div>

      <section className={styles.routeSection}>
        <div className="wrap">
          <Reveal as="div" className={styles.routeLabel}>
            Where are you <em>starting from?</em>
          </Reveal>
          <div className={styles.routeGrid}>
            {ROUTES.map((r, i) => (
              <Reveal
                key={r.name}
                as="button"
                type="button"
                className={[styles.routeCard, selectedRoute === i && styles.routeSel].filter(Boolean).join(' ')}
                delay={i * 60}
                onClick={() => selectRoute(i, r.tab)}
              >
                <div className={styles.rcName}>{r.name}</div>
                <div className={styles.rcDesc}>{r.desc}</div>
                <div className={styles.rcTo}>{r.to}</div>
              </Reveal>
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
          <Reveal className={styles.secHead}>
            <h2>
              On the <em>ground</em>
            </h2>
            <div className={styles.secHeadSub}>Practical first steps regardless of your visa route.</div>
          </Reveal>
          <div className={styles.groundGrid}>
            {GROUND.map((g, i) => (
              <Reveal className={styles.groundCard} key={g.title} delay={i * 55}>
                <div className={styles.gcLabel}>{g.label}</div>
                <div className={styles.gcTitle}>{g.title}</div>
                <div className={styles.gcBody}>{g.body}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.lawyerSec}>
        <div className="wrap">
          <Reveal className={styles.secHead}>
            <h2>
              Community-reviewed <em>immigration lawyers</em>
            </h2>
          </Reveal>
          <div className={styles.reviewGrid}>
            {LAWYERS.map((l, i) => (
              <Reveal className={styles.reviewCard} key={l.name} delay={i * 60}>
                <div className={styles.rvTop}>
                  <div className={styles.rvAv} style={{ background: l.bg, color: l.color }}>
                    {l.initials}
                  </div>
                  <div>
                    <div className={styles.rvName}>{l.name}</div>
                    <div className={styles.rvContext}>{l.context}</div>
                  </div>
                </div>
                <div className={styles.rvStars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <FiStar key={n} className={n <= l.stars ? styles.rvStarOn : undefined} />
                  ))}
                </div>
                <div className={styles.rvQuote}>{l.quote}</div>
              </Reveal>
            ))}
          </div>
          <Reveal className={styles.lawyerCta} delay={60}>
            <Button to={FORUM} variant="ghost">
              Ask the visa forum thread →
            </Button>
          </Reveal>
        </div>
      </section>

      <Outro
        title={<>You're building a life <em>here.</em></>}
        sub="The paperwork is temporary. The community is permanent."
      >
        <Button to={ARRIVING} variant="primary" size="lg">
          Settling in guide →
        </Button>
        <Button to={FORUM} variant="ghost-dark" size="lg">
          Ask the community
        </Button>
      </Outro>
    </PageShell>
  )
}
