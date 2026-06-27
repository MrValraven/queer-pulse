import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import styles from './resources.module.css'

interface Step {
  n: string
  title: string
  body: ReactNode
}

const HEALTHCARE: Step[] = [
  { n: '01', title: 'Start with your GP (Médico de Família)', body: <>Request a referral to an endocrinologist or the nearest gender clinic. Your GP may not be familiar with the process — bring our GP referral guide to help. SNS referrals typically take 6–18 months.</> },
  { n: '02', title: 'Gender clinics in Lisbon', body: <>Hospital de Santa Maria and Hospital Curry Cabral both have gender medicine units. Private options include the Clínica de Identidade de Género for faster access. We have member reviews of all three.</> },
  { n: '03', title: 'HRT access', body: <>Hormone therapy is available via the SNS once you have an endocrinology referral. Many members use the informed consent model at private clinics as a faster first step, then transition to SNS for ongoing care.</> },
  { n: '04', title: 'Surgical procedures', body: <>Gender-affirming surgeries covered by the SNS include vaginoplasty, phalloplasty, mastectomy, and others. Waiting lists are long (1–3+ years). <Link to={routes.changemakers}>Jonas Ferreira</Link> has helped many members navigate this.</> },
  { n: '05', title: "If you're facing barriers", body: <>If a provider refuses treatment or makes the process hostile, document everything. Contact <Link to={routes.legal}>our legal resources</Link> or ILGA Portugal. You have rights — and this community can help you enforce them.</> },
]

const LEGAL: Step[] = [
  { n: '01', title: 'Legal name & gender change', body: <>Since 2018, you can change your legal name and gender marker at any civil registry office without medical documentation. You need only a declaration — no psychiatric evaluation required. The fee is approximately €200.</> },
  { n: '02', title: 'Updating your documents', body: <>Once your Cartão de Cidadão is updated, other documents follow. Your employer, bank, and health records can all be updated with the new ID. We have a checklist of everything that needs updating and in which order.</> },
  { n: '03', title: 'Non-binary legal recognition', body: <>Portugal does not currently have a third gender option on official documents. This is an area of ongoing advocacy — ILGA Portugal and Rede ex aequo are working on it. We have resources if this affects you.</> },
]

const RESOURCES = [
  { cat: 'Guide', catColor: 'var(--accent-ink)', catBg: 'rgba(232,119,90,.1)', title: 'The SNS trans healthcare guide', desc: 'A members-maintained walkthrough of the public system — referrals, clinics, what to bring, and how long each step really takes.' },
  { cat: 'Checklist', catColor: 'var(--jade)', catBg: 'rgba(74,140,111,.12)', title: 'Document-change checklist', desc: 'Every document to update after a legal name change, in the right order — CC, NIF, bank, employer, health records.' },
  { cat: 'Directory', catColor: 'var(--plum)', catBg: 'rgba(45,27,61,.08)', title: 'Affirming clinicians', desc: 'Endocrinologists, surgeons, and GPs reviewed by trans members. No listing fees, no algorithm — just lived experience.' },
  { cat: 'Peer support', catColor: 'var(--violet)', catBg: 'rgba(155,111,212,.1)', title: 'Trans & NB peer circle', desc: 'A moderated space to share what worked, vent what didn\'t, and find someone a few steps ahead of you on the same path.' },
]

export function TransHubPage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Trans & Non-Binary Hub"
        eyebrowDotColor="var(--violet)"
        title={<>A dedicated space, <em>not an afterthought.</em></>}
        lead="Healthcare navigation, legal guides, peer support, and community — built specifically for trans and non-binary members. You don't have to figure this out alone."
        anchors={[
          { label: 'Healthcare', href: '#healthcare' },
          { label: 'Legal & admin', href: '#legal' },
          { label: 'Resources', href: '#resources' },
          { label: 'Community', href: '#community' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="healthcare">
        <div className="wrap">
          <Reveal as="h2">
            Healthcare <em>navigation</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            Trans healthcare in Portugal has improved significantly since 2018. The SNS now covers
            hormone therapy and gender-affirming surgeries. Navigating it is still complex — here's
            how it works.
          </Reveal>
          <div className={styles.stepList}>
            {HEALTHCARE.map((step) => (
              <Reveal key={step.n} className={styles.step}>
                <div className={styles.stepN}>{step.n}</div>
                <div>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepBody}>{step.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="legal">
        <div className="wrap">
          <Reveal as="h2">
            Legal &amp; <em>administrative</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            Navigating legal name and gender marker changes in Portugal. The 2018 Gender Identity
            Law (Law 38/2018) significantly simplified the process.
          </Reveal>
          <div className={styles.stepList}>
            {LEGAL.map((step) => (
              <Reveal key={step.n} className={styles.step}>
                <div className={styles.stepN}>{step.n}</div>
                <div>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepBody}>{step.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`} id="resources">
        <div className="wrap">
          <Reveal as="h2">
            Resources &amp; <em>guides</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            Maintained by trans and non-binary members. Practical, current, and free.
          </Reveal>
          <div className={styles.grid}>
            {RESOURCES.map((res, index) => (
              <Reveal key={res.title} className={styles.card} delay={index * 55}>
                <span className={styles.resCat} style={{ color: res.catColor, background: res.catBg }}>
                  {res.cat}
                </span>
                <div className={styles.resTitle}>{res.title}</div>
                <div className={styles.resDesc}>{res.desc}</div>
                <Link to={routes.library} className={styles.rightLink}>
                  Open →
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="community" style={{ borderBottom: 'none' }}>
        <div className="wrap">
          <Reveal className={styles.plumStrip}>
            <div>
              <h3>
                A community that <em>has your back.</em>
              </h3>
              <p>
                The Trans &amp; Non-Binary Hub is more than resources — it's people. Members share
                clinic reviews, celebrate milestones, and turn up for each other when the system
                doesn't.
              </p>
              <div className={styles.plumActions}>
                <Button variant="ghost-dark" to={routes.communities}>
                  Join the hub
                </Button>
              </div>
            </div>
            <div className={`${styles.stats} ${styles.statsRow}`}>
              <div className={styles.stat}>
                <div className={styles.statN}>147</div>
                <div className={styles.statL}>members in the hub</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statN}>40+</div>
                <div className={styles.statL}>clinician reviews</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statN}>2018</div>
                <div className={styles.statL}>self-ID law in effect</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Outro
        title={<>You're seen <em>here.</em></>}
        sub="QueerPulse is a vouched-for, invite-only network. If someone you trust is already here, ask them to vouch for you."
      >
        <Button to={routes.invite} variant="primary" size="lg">
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  )
}
