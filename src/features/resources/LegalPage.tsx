import type { ReactNode } from 'react'
import { FiAlertOctagon } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { useConnect } from '../../app/providers/ConnectProvider'
import { ResourceHero } from './ResourceHero'
import styles from './resources.module.css'

interface Right {
  badge: 'protected' | 'know' | 'practical'
  badgeLabel: string
  title: string
  body: string
  linkLabel: string
  to: string
}

const WORKPLACE: Right[] = [
  { badge: 'protected', badgeLabel: 'Protected right', title: 'Protection from dismissal', body: 'You cannot be legally dismissed because of your sexual orientation or gender identity. Constructive dismissal — making conditions intolerable — is also prohibited. Keep records of everything.', linkLabel: 'Read the full guide →', to: '/library' },
  { badge: 'protected', badgeLabel: 'Protected right', title: 'Harassment at work', body: 'Harassment on grounds of sexual orientation or gender identity is unlawful. Your employer has a legal duty to investigate complaints. Failure to act makes them liable. Document every incident with dates.', linkLabel: 'Read the full guide →', to: '/library' },
  { badge: 'know', badgeLabel: 'Know this', title: 'Pronouns & name at work', body: 'Persistent misgendering after being corrected can constitute harassment. Trans employees have the right to use their preferred name before any legal name change.', linkLabel: 'Read the full guide →', to: '/library' },
  { badge: 'practical', badgeLabel: 'Practical', title: 'Making a complaint', body: 'The ACT (Autoridade para as Condições do Trabalho) handles workplace discrimination complaints. You can report anonymously. We have a step-by-step guide and template complaint letter.', linkLabel: 'Get the template →', to: '/library' },
]

const HOUSING: Right[] = [
  { badge: 'protected', badgeLabel: 'Protected right', title: 'Rental discrimination', body: 'A landlord refusing to rent to you due to sexual orientation or gender identity is acting illegally. Document any evidence — screenshots, recordings with consent, written refusals.', linkLabel: 'Read the full guide →', to: '/library' },
  { badge: 'practical', badgeLabel: 'Practical', title: 'Same-sex couples & rentals', body: 'Same-sex couples have equal rights in tenancy agreements. Both partners can be named on a lease. There are protections against removal if one partner leaves or dies.', linkLabel: 'Read the full guide →', to: '/library' },
  { badge: 'practical', badgeLabel: 'Practical', title: 'Eviction protections', body: 'Eviction on discriminatory grounds has additional protections. If you\'re facing displacement in a gentrifying area, community organisers can help — contact Catarina Vaz via QueerPulse.', linkLabel: 'Find support →', to: '/changemakers' },
]

const HEALTHCARE: Right[] = [
  { badge: 'protected', badgeLabel: 'Protected right', title: 'Trans healthcare via SNS', body: 'Since 2018, trans healthcare including hormone therapy and surgical procedures is available through the SNS. Waiting lists exist — we have a guide to navigating them.', linkLabel: 'Trans Hub guide →', to: '/trans-hub' },
  { badge: 'protected', badgeLabel: 'Protected right', title: 'Refusal of treatment', body: 'Healthcare providers cannot legally refuse treatment on grounds of sexual orientation or gender identity. If this happens, document it and contact ILGA Portugal immediately.', linkLabel: 'Report a refusal →', to: '/report' },
  { badge: 'practical', badgeLabel: 'Practical', title: 'PrEP access', body: 'PrEP is available via the SNS at no cost if you meet eligibility criteria. Our guide walks through the process, including which clinics are most welcoming in Lisbon.', linkLabel: 'PrEP access guide →', to: '/wellbeing' },
]

const LAWYERS = [
  { name: 'Sofia Mendonça', spec: 'Labour law specialist · discrimination, constructive dismissal, workplace harassment.', tags: ['Workplace', 'PT · EN', 'No-win no-fee available'], loc: 'Chiado' },
  { name: 'Ricardo Faria', spec: 'Civil & tenancy law · rental discrimination, same-sex property rights, housing disputes.', tags: ['Housing', 'PT'], loc: 'Baixa · Online' },
  { name: 'Ana Beatriz Leal', spec: 'Healthcare & administrative law · trans legal name change, SNS complaints, discrimination in healthcare.', tags: ['Trans rights', 'Healthcare', 'PT · FR'], loc: 'Avenidas Novas' },
]

const badgeClass = { protected: styles.badgeProtected, know: styles.badgeKnow, practical: styles.badgeKnow }

function RightsSection({ id, title, lead, cream, rights }: { id: string; title: ReactNode; lead: string; cream?: boolean; rights: Right[] }) {
  return (
    <section className={`${styles.section} ${cream ? styles.sectionCream : styles.sectionPaper}`} id={id}>
      <div className="wrap">
        <Reveal as="h2">{title}</Reveal>
        <Reveal as="p" className={styles.leadP}>
          {lead}
        </Reveal>
        <div className={styles.grid}>
          {rights.map((right, index) => (
            <Reveal key={right.title} className={styles.rightCard} delay={index * 55}>
              <span className={`${styles.badge} ${badgeClass[right.badge]}`}>{right.badgeLabel}</span>
              <div className={styles.rightTitle}>{right.title}</div>
              <div className={styles.rightBody}>{right.body}</div>
              <Link to={right.to} className={styles.rightLink}>
                {right.linkLabel}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LegalPage() {
  const { openConnect } = useConnect()
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Legal Aid"
        eyebrowDotColor="var(--accent)"
        title={<>Know your rights. <em>Have your receipts.</em></>}
        lead="Legal guides, queer-friendly lawyers, and discrimination resources for LGBTQ+ people in Portugal — because knowing your rights is the first step to defending them."
        anchors={[
          { label: 'Workplace rights', href: '#workplace' },
          { label: 'Housing rights', href: '#housing' },
          { label: 'Healthcare rights', href: '#healthcare' },
          { label: 'Lawyer directory', href: '#lawyers' },
        ]}
      />

      <RightsSection
        id="workplace"
        title={<>Workplace <em>rights</em></>}
        lead="Portugal's Labour Code prohibits discrimination on grounds of sexual orientation and gender identity. Here's what that means in practice."
        rights={WORKPLACE}
      />
      <RightsSection
        id="housing"
        cream
        title={<>Housing <em>rights</em></>}
        lead="Discrimination in housing rental is illegal in Portugal. In practice it still happens — here's how to respond when it does."
        rights={HOUSING}
      />
      <RightsSection
        id="healthcare"
        title={<>Healthcare <em>rights</em></>}
        lead="LGBTQ+ people in Portugal have full rights to access public healthcare. Trans-specific access has improved significantly since 2018."
        rights={HEALTHCARE}
      />

      <section className={`${styles.section} ${styles.sectionCream}`} id="lawyers" style={{ borderBottom: 'none' }}>
        <div className="wrap">
          <Reveal as="h2">
            Queer-friendly <em>lawyers</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            Vetted by community members, with specific experience in LGBTQ+ cases in Portugal.
            Initial consultations are free for QueerPulse members.
          </Reveal>
          <div className={styles.grid}>
            {LAWYERS.map((lawyer, index) => (
              <Reveal key={lawyer.name} className={styles.card} delay={index * 55}>
                <div className={styles.cardName} style={{ fontSize: 19 }}>
                  {lawyer.name}
                </div>
                <div className={styles.cardSpec}>{lawyer.spec}</div>
                <div className={styles.tags}>
                  {lawyer.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className={styles.cardFoot}>
                  <span className={styles.cardLoc}>{lawyer.loc}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    className={styles.cardCta}
                    onClick={() => openConnect()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openConnect()
                      }
                    }}
                  >
                    Request consultation →
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className={styles.emergencyStrip}>
            <div>
              <h3>
                Facing something <em>urgent?</em>
              </h3>
              <p>
                If you're dealing with an immediate legal situation — arrest, eviction notice, or
                workplace suspension — use the QueerPulse emergency network. Someone who can help is
                usually reachable within hours.
              </p>
            </div>
            <Button variant="ghost-dark" size="lg" to="/emergency">
              <FiAlertOctagon /> Emergency network →
            </Button>
          </Reveal>
        </div>
      </section>

      <Outro
        title={<>You have <em>rights.</em></>}
        sub="Knowledge is the first line of defence. Share these resources with anyone who needs them."
      >
        <Button to="/invite" variant="primary" size="lg">
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  )
}
