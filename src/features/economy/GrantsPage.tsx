import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '../../app/routeMap'
import { PageShell } from '../../shared/components/layout'
import { FiDollarSign } from 'react-icons/fi'
import { Button, EmptyState, FadeIn, Outro, Reveal, SkeletonLine } from '../../shared/components/ui'
import { useScrollReveal } from '../../shared/hooks/useScrollReveal'
import { useCountUp } from '../../shared/hooks/useCountUp'
import { useSimulatedLoad } from '../../shared/hooks'
import styles from './GrantsPage.module.css'
import { GRANTS, FILTERS, SECTIONS, STATUS_LABEL, STEPS, type Status } from './grants.data'

const STATUS_CLASS: Record<Status, string> = { open: styles.gsOpen, rolling: styles.gsRolling, closed: styles.gsClosed }

function GrantSkeleton() {
  return (
    <div className={styles.gc} aria-hidden>
      <div className={styles.gcTop}>
        <div style={{ flex: 1 }}>
          <SkeletonLine width={90} height={12} />
          <SkeletonLine width="70%" height={19} style={{ marginTop: 6 }} />
        </div>
        <SkeletonLine width={64} height={14} />
      </div>
      <SkeletonLine width="100%" height={13} />
      <SkeletonLine width="85%" height={13} style={{ marginTop: 6, marginBottom: 14 }} />
      <div className={styles.gcFoot}>
        <div className={styles.gcTags}>
          <SkeletonLine width={58} height={20} style={{ borderRadius: 6 }} />
          <SkeletonLine width={72} height={20} style={{ borderRadius: 6 }} />
        </div>
        <div className={styles.gcRight}>
          <SkeletonLine width={58} height={18} style={{ borderRadius: 5 }} />
          <SkeletonLine width={76} height={13} />
        </div>
      </div>
    </div>
  )
}

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
  const loading = useSimulatedLoad()
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
              {loading ? (
                <div className={styles.section}>
                  <div className={styles.grid}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <GrantSkeleton key={i} />
                    ))}
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={<FiDollarSign />}
                  title="Nothing matches your filter"
                  description="No opportunities fit that category right now. Clear the filter to browse every grant and fellowship members are tracking."
                  action={{ label: 'Clear filters', onClick: () => setFilter('all') }}
                />
              ) : (
                SECTIONS.map((section) => {
                const items = filtered.filter((g) => g.sec === section.id)
                if (items.length === 0) return null
                return (
                  <div key={section.id} className={styles.section}>
                    <div className={styles.secHead}>{section.label}</div>
                    <div className={styles.grid}>
                      {items.map((grant, i) => (
                        <FadeIn as="div" key={grant.name} delay={Math.min(i, 8) * 60} className={styles.gc}>
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
                        </FadeIn>
                      ))}
                    </div>
                  </div>
                )
              })
              )}
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sideCard}>
                <h4>
                  Our <em>Micro Grants</em>
                </h4>
                <p>QueerPulse runs its own micro grant programme (€200–€2,000) for community projects in Lisbon. Faster and simpler than most external grants.</p>
                <Link to={routes.grants}>Apply now →</Link>
              </div>
              <div className={styles.sideCard}>
                <h4>Skills Exchange</h4>
                <p>If you need support but grants feel too formal, the barter board connects members who can swap skills — no money involved.</p>
                <Link to={routes.barter}>Explore the exchange →</Link>
              </div>
              <div className={styles.sideCard} style={{ background: 'rgba(var(--jade-rgb),.05)', borderColor: 'rgba(var(--jade-rgb),.2)' }}>
                <h4>
                  Get <em>application help</em>
                </h4>
                <p>Members with grant-writing experience offer workshops and one-to-one support via the skills exchange.</p>
                <Link to={routes.skills}>Find a mentor →</Link>
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
        <Button to={routes.grants} size="lg">
          See open grants
        </Button>
      </Outro>
    </PageShell>
  )
}
