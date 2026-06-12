import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { ResourceHero } from './ResourceHero'
import styles from './resources.module.css'

const THERAPISTS = [
  { name: 'Dra. Marta Seabra', spec: 'Clinical psychologist · LGBTQ+ identity, trauma, and workplace stress.', tags: ['Trans-affirming', 'Sliding scale', 'EN · PT'], loc: 'Príncipe Real · Online' },
  { name: 'Paulo Esteves', spec: 'Psychotherapist · relationships, coming out, family estrangement, depression.', tags: ['Non-binary aware', 'PT · ES'], loc: 'Arroios' },
  { name: 'Dra. Filipa Ramos', spec: 'Psychiatrist · gender dysphoria, anxiety, mood disorders, medication management.', tags: ['Trans healthcare', 'SNS referrals', 'PT'], loc: 'Amoreiras' },
  { name: 'Ana Costa, MSc', spec: 'Counsellor · identity exploration, neurodivergent-affirming, relationship counselling.', tags: ['ADHD-affirming', 'Sliding scale', 'EN · PT'], loc: 'Mouraria · Online' },
  { name: 'João Saraiva', spec: "Psychologist · gay men's mental health, HIV-positive affirming, substance use support.", tags: ['Harm reduction', 'PT · EN'], loc: 'Cais do Sodré' },
]

const CRISIS = [
  { name: 'SOS Voz Amiga', desc: 'Anonymous emotional support and crisis counselling. No judgement. Available in Portuguese and English.', num: '213 544 545', hours: 'Daily 16h–24h' },
  { name: 'ILGA Portugal', desc: 'LGBTQ+ specific support, legal guidance, and referrals to affirming services across Portugal.', num: '218 873 918', hours: 'Weekdays 10h–18h' },
  { name: 'Rede ex aequo', desc: 'Support for LGBTQ+ people under 30. Online chat and phone — safe, confidential, peer-led.', num: 'redeexaequo.pt', hours: 'Online · Weekdays 18h–22h' },
]

const HARM = [
  { title: 'Nightlife safety basics', desc: 'What to know before you go out, what to do if something feels wrong, and how to look out for your friends and your own body.' },
  { title: 'Drugs & alcohol', desc: 'Honest information about substances common in the queer nightlife scene — interactions, risks, and how to ask for help without shame.' },
  { title: 'Sexual health in Lisbon', desc: "PrEP access, STI testing, and affirming sexual health services that don't make you feel judged for being yourself." },
  { title: 'Chemsex support', desc: "Confidential, non-judgmental resources for members navigating chemsex — connected to real services and real people who've been there." },
]

export function WellbeingPage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Wellbeing"
        eyebrowDotColor="var(--jade)"
        title={<>A room that <em>looks after you.</em></>}
        lead="Resources built by and for the community — therapists, peer support, crisis help, and harm reduction. This is what a professional network looks like when it takes care seriously."
        anchors={[
          { label: 'Therapist directory', href: '#therapists' },
          { label: 'Peer support', href: '#peer-support' },
          { label: 'Crisis resources', href: '#crisis' },
          { label: 'Harm reduction', href: '#harm-reduction' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="therapists">
        <div className="wrap">
          <Reveal as="h2">
            Queer-affirming <em>therapists in Lisbon</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            Vetted by community members. Each therapist listed has been recommended by at least two
            QueerPulse members. We do not charge listing fees. Want to add someone?{' '}
            <Link to="/contact">Get in touch.</Link>
          </Reveal>
          <div className={styles.grid}>
            {THERAPISTS.map((therapist, index) => (
              <Reveal key={therapist.name} className={styles.card} delay={index * 55}>
                <div className={styles.cardName}>{therapist.name}</div>
                <div className={styles.cardSpec}>{therapist.spec}</div>
                <div className={styles.tags}>
                  {therapist.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className={styles.cardFoot}>
                  <span className={styles.cardLoc}>{therapist.loc}</span>
                  <Link to="/connect" className={styles.cardCta}>
                    Request intro →
                  </Link>
                </div>
              </Reveal>
            ))}
            <Reveal className={`${styles.card} ${styles.cardDashed}`} delay={THERAPISTS.length * 55}>
              <div>
                Are you a queer-affirming therapist?
                <br />
                <Link to="/contact" style={{ color: 'var(--plum)', fontWeight: 600 }}>
                  Apply to be listed →
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="peer-support">
        <div className="wrap">
          <Reveal className={styles.plumStrip}>
            <div>
              <h3>
                You don't have to <em>hold it alone.</em>
              </h3>
              <p>
                A moderated peer support space inside the Forum — for members going through difficult
                times. No advice unless asked. No fixing. Just people who understand, listening.
              </p>
              <div className={styles.plumActions}>
                <Button variant="ghost-dark" to="/forum">
                  Join the group
                </Button>
                <Button variant="ghost-dark" href="#crisis">
                  In crisis right now?
                </Button>
              </div>
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statN}>340</div>
                <div className={styles.statL}>members in the support space</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statN}>24h</div>
                <div className={styles.statL}>guaranteed moderation response</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statN}>100%</div>
                <div className={styles.statL}>confidential within the group</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`} id="crisis">
        <div className="wrap">
          <Reveal as="h2">
            Crisis &amp; <em>emergency resources</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            If you are in immediate danger, call <strong>112</strong>. These resources are specific
            to LGBTQ+ situations in Portugal.
          </Reveal>
          <div className={styles.gridNarrow} style={{ display: 'grid' }}>
            {CRISIS.map((item, index) => (
              <Reveal key={item.name} className={styles.card} delay={index * 55}>
                <div className={styles.cardName} style={{ fontSize: 18 }}>
                  {item.name}
                </div>
                <div className={styles.cardSpec}>{item.desc}</div>
                <div className={styles.crisisNum}>{item.num}</div>
                <div className={styles.crisisHours}>{item.hours}</div>
              </Reveal>
            ))}
            <Reveal className={styles.card} delay={CRISIS.length * 55}>
              <div className={styles.cardName} style={{ fontSize: 18 }}>
                QueerPulse Emergency
              </div>
              <div className={styles.cardSpec}>
                Safe housing contacts, community members who can help, and emergency escalation
                paths — available always.
              </div>
              <Link to="/emergency" className={styles.crisisNum} style={{ fontSize: 16 }}>
                Open emergency page →
              </Link>
              <div className={styles.crisisHours}>Always available</div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="harm-reduction">
        <div className="wrap">
          <Reveal as="h2">
            Harm <em>reduction</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            Non-judgmental information for a community that lives in the real world. This is not
            moral instruction — it's practical care. No one here will tell you how to live.
          </Reveal>
          <div className={styles.gridNarrow} style={{ display: 'grid' }}>
            {HARM.map((item, index) => (
              <Reveal key={item.title} className={styles.card} delay={index * 55}>
                <div className={styles.cardName} style={{ fontSize: 18 }}>
                  {item.title}
                </div>
                <div className={styles.cardSpec}>{item.desc}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={<>You belong <em>here.</em></>}
        sub="If you're not yet a member, request an invite. If you are, everything above is in the member area — no separate login needed."
      >
        <Button to="/invite" variant="primary" size="lg">
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  )
}
