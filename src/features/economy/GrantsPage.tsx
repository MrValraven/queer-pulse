import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { useScrollReveal } from '../../shared/hooks/useScrollReveal'
import { useCountUp } from '../../shared/hooks/useCountUp'
import styles from './GrantsPage.module.css'
import { GRANTS, FILTERS, SECTIONS, STATUS_LABEL, STEPS, type Status } from './grants.data'

const STATUS_CLASS: Record<Status, string> = { open: styles.gsOpen, rolling: styles.gsRolling, closed: styles.gsClosed }

function HeroStat({ target, label }: { target: number; label: string }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const value = useCountUp(target, { active: isVisible })
  return (
    <div className={styles.stat} ref={ref}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}

export function GrantsPage() {
  const [filter, setFilter] = useState('all')
  const filtered = useMemo(
    () => (filter === 'all' ? GRANTS : GRANTS.filter((g) => g.cats.includes(filter))),
    [filter],
  )

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.eye}>
            Grants &amp; Funding
          </Reveal>
          <Reveal as="h1" delay={60}>
            Money for <em>queer work.</em>
          </Reveal>
          <Reveal as="p" className={styles.heroSub} delay={120}>
            Community-curated guide to grants, fellowships, and funding for LGBTQ+ individuals and
            organisations — in Portugal and across Europe. Maintained by members who've successfully
            applied.
          </Reveal>
          <div className={styles.stats}>
            <HeroStat target={38} label="opportunities tracked" />
            <HeroStat target={9} label="currently open" />
            <div className={styles.stat}>
              <b>Community</b>
              <span>maintained</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bar}>
        <div className="wrap">
          <div className={styles.barInner}>
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={[styles.chip, filter === f.value && styles.chipActive].filter(Boolean).join(' ')}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              {SECTIONS.map((section) => {
                const items = filtered.filter((g) => g.sec === section.id)
                if (items.length === 0) return null
                return (
                  <div key={section.id} className={styles.section}>
                    <div className={styles.secHead}>{section.label}</div>
                    <div className={styles.grid}>
                      {items.map((grant) => (
                        <div key={grant.name} className={styles.gc}>
                          <div className={styles.gcTop}>
                            <div>
                              <div className={styles.gcOrg}>{grant.org}</div>
                              <div className={styles.gcName}>{grant.name}</div>
                            </div>
                            <div className={styles.gcAmount}>{grant.amount}</div>
                          </div>
                          <div className={styles.gcDesc}>{grant.desc}</div>
                          <div className={styles.gcFoot}>
                            <div className={styles.gcTags}>
                              {grant.tags.map((tag) => (
                                <span key={tag} className={styles.gtag}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className={styles.gcRight}>
                              <span className={`${styles.gcStatus} ${STATUS_CLASS[grant.status]}`}>
                                {STATUS_LABEL[grant.status]}
                              </span>
                              <Link to={grant.to} className={styles.gcLink}>
                                Learn more
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sideCard}>
                <h4>
                  Our <em>Micro Grants</em>
                </h4>
                <p>QueerPulse runs its own micro grant programme (€200–€2,000) for community projects in Lisbon. Faster and simpler than most external grants.</p>
                <Link to="/grants">Apply now →</Link>
              </div>
              <div className={styles.sideCard}>
                <h4>Skills Exchange</h4>
                <p>If you need support but grants feel too formal, the barter board connects members who can swap skills — no money involved.</p>
                <Link to="/barter">Explore the exchange →</Link>
              </div>
              <div className={styles.sideCard} style={{ background: 'rgba(74,140,111,.05)', borderColor: 'rgba(74,140,111,.2)' }}>
                <h4>
                  Get <em>application help</em>
                </h4>
                <p>Members with grant-writing experience offer workshops and one-to-one support via the skills exchange.</p>
                <Link to="/skills">Find a mentor →</Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <section className={styles.guide}>
        <div className="wrap">
          <Reveal as="h2">
            Writing a <em>strong application</em>
          </Reveal>
          <Reveal as="p" className={styles.guideSub} delay={60}>
            Advice from community members who've successfully secured grants — from micro to major.
          </Reveal>
          <div className={styles.stepsGrid}>
            {STEPS.map((step) => (
              <div key={step.n} className={styles.stepItem}>
                <div className={styles.stepN}>{step.n}</div>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepBody}>{step.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={<>Your project <em>deserves support.</em></>}
        sub="Found something that fits? Apply with confidence — and if you land it, pay it forward by adding the opportunity for the next member."
      >
        <Button to="/grants" size="lg">
          See open grants
        </Button>
      </Outro>
    </PageShell>
  )
}
