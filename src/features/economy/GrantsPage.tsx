import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Reveal } from '../../shared/components/ui'
import { useScrollReveal } from '../../shared/hooks/useScrollReveal'
import { useCountUp } from '../../shared/hooks/useCountUp'
import styles from './GrantsPage.module.css'

type Section = 'qp' | 'pt' | 'eu'
type Status = 'open' | 'rolling' | 'closed'

interface Grant {
  sec: Section
  name: string
  org: string
  amount: string
  status: Status
  cats: string[]
  desc: string
  tags: string[]
  to: string
}

const GRANTS: Grant[] = [
  { sec: 'qp', name: 'QueerPulse Micro Grant', org: 'QueerPulse Community Fund', amount: '€200–€2,000', status: 'open', cats: ['individual', 'org', 'community'], desc: 'Community-funded micro grants for queer projects in Lisbon. Open to members and non-members. Decisions made by a rotating community panel, not a board.', tags: ['Lisbon', 'community', 'rolling'], to: '/grants' },
  { sec: 'pt', name: 'ILGA Portugal Project Fund', org: 'ILGA Portugal', amount: '€500–€5,000', status: 'open', cats: ['org', 'community'], desc: 'Annual grants for LGBTQ+ advocacy, community building, and awareness projects in Portugal. Priority to regional projects outside Lisbon.', tags: ['advocacy', 'community', 'Portugal'], to: '/grants' },
  { sec: 'pt', name: 'Gulbenkian — Social Programme', org: 'Fundação Gulbenkian', amount: '€5,000–€50,000', status: 'rolling', cats: ['org', 'community', 'arts'], desc: "Gulbenkian's social cohesion programme funds community organisations working with marginalised groups. An inclusion-framed application is needed.", tags: ['Gulbenkian', 'large grant', 'social'], to: '/grants' },
  { sec: 'pt', name: 'Active Citizens Fund Portugal', org: 'EEA Grants', amount: '€5,000–€200,000', status: 'rolling', cats: ['org', 'community'], desc: 'Civil society strengthening grants via the EEA mechanism. LGBTQ+ groups have been funded under previous rounds.', tags: ['EEA', 'civil society'], to: '/grants' },
  { sec: 'pt', name: 'DGES — Arts & Culture Residency', org: 'DGES', amount: '€2,000–€15,000', status: 'closed', cats: ['individual', 'arts'], desc: 'Annual residency and creation support for individual artists. Frame your work in terms of cultural value, not identity.', tags: ['arts', 'residency'], to: '/grants' },
  { sec: 'eu', name: 'Citizens, Equality, Rights and Values (CERV)', org: 'European Commission', amount: '€50,000–€1,000,000+', status: 'rolling', cats: ['org', 'eu'], desc: "The EU's main civil society and equality programme. The LGBTIQ Equality strand funds work across Europe. Requires EU-wide partnerships.", tags: ['EU', 'large grant', 'transnational'], to: '/grants' },
  { sec: 'eu', name: 'ILGA-Europe Emergency Fund', org: 'ILGA-Europe', amount: 'up to €5,000', status: 'rolling', cats: ['org', 'individual', 'eu'], desc: 'Rapid-response emergency grants for LGBTIQ organisations or individuals facing urgent threats — legal, financial, safety-related.', tags: ['emergency', 'EU', 'rapid response'], to: '/grants' },
  { sec: 'eu', name: 'Arcus Foundation — LGBTQ Programme', org: 'Arcus Foundation', amount: '$50,000–$300,000', status: 'rolling', cats: ['org', 'eu'], desc: 'US-based foundation with a major LGBTQ programme in Europe. Focuses on movement-building, legal advocacy, and trans rights.', tags: ['movement building', 'international'], to: '/grants' },
  { sec: 'eu', name: 'Rainbow Railroad Emergency Fund', org: 'Rainbow Railroad', amount: 'up to $2,000', status: 'rolling', cats: ['individual', 'eu'], desc: 'Direct financial assistance for LGBTQI+ people in dangerous situations, including help leaving unsafe situations. For individuals only.', tags: ['emergency', 'individual', 'safety'], to: '/grants' },
]

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'individual', label: 'For individuals' },
  { value: 'org', label: 'For organisations' },
  { value: 'arts', label: 'Arts & culture' },
  { value: 'community', label: 'Community projects' },
  { value: 'eu', label: 'EU / International' },
]

const SECTIONS: { id: Section; label: ReactNode }[] = [
  { id: 'qp', label: <>From <em>QueerPulse</em></> },
  { id: 'pt', label: <><em>Portugal</em> — national programmes</> },
  { id: 'eu', label: <><em>EU &amp; International</em></> },
]

const STATUS_LABEL: Record<Status, string> = { open: 'Open now', rolling: 'Rolling', closed: 'Closed' }
const STATUS_CLASS: Record<Status, string> = { open: styles.gsOpen, rolling: styles.gsRolling, closed: styles.gsClosed }

const STEPS = [
  { n: '01', title: 'Read the criteria twice', body: "Most rejections are from applications that technically fit but don't mirror the funder's language. Map your project onto their specific wording." },
  { n: '02', title: 'Tell a specific story', body: 'Funders read hundreds of applications. A single specific, human story of impact will land better than broad claims.' },
  { n: '03', title: 'Show your community', body: 'Queer-focused funders want to see the community embedded — not as beneficiaries but as participants and decision-makers.' },
  { n: '04', title: 'Ask for a review', body: 'Before submitting, ask someone not involved to read your application. Fresh eyes catch the assumptions you\'ve stopped seeing.' },
]

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
    </PageShell>
  )
}
