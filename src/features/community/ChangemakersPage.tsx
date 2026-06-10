import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, ImageSlot, Reveal } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './ChangemakersPage.module.css'

const STATS = [
  { n: '34', l: 'Change makers profiled so far' },
  { n: '6', l: 'Cause areas active in Lisbon' },
  { n: '1.2k', l: 'People directly helped by their work' },
  { n: '12', l: 'Active campaigns running right now' },
]

const FEATURED_IMPACT = [
  'Helped 14 queer households navigate legal challenges to eviction notices',
  'Testified twice at Câmara Municipal on the impact of short-term rentals on queer residents',
  'Co-authoring a housing rights brief for LGBTQ+ people with ILGA Portugal',
]

interface Maker {
  cause: string
  name: string
  bio: string
  tags: string[]
  tint: 'coral' | 'jade' | 'plum'
}

const MAKERS: Maker[] = [
  { cause: 'Trans Healthcare', name: 'Jonas Ferreira', bio: 'Founded the "Saúde Trans" information project and has personally trained over 40 GPs in trans-affirming care. Pushing hard on public health system reform.', tags: ['Health', 'Advocacy', 'Policy'], tint: 'jade' },
  { cause: 'Arts & Culture', name: 'Luísa Gomes', bio: 'Programmed the first queer season at a major Lisbon museum and co-founded the Rainbow Arts Collective. Making queer art central, not marginal.', tags: ['Arts', 'Curating', 'Culture'], tint: 'coral' },
  { cause: 'Youth Education · Alcântara', name: 'Miguel Santos', bio: 'Runs LGBTQ+ inclusion workshops in six Lisbon schools and mentors 20+ young people through the city\'s first queer youth group in Alcântara.', tags: ['Education', 'Youth', 'Mentoring'], tint: 'plum' },
  { cause: 'Migrant & Queer Rights', name: 'Fátima Mendes', bio: 'Founded the Queer Immigrant Support Network, connecting newly arrived LGBTQ+ people with legal aid, housing, and community across Lisbon.', tags: ['Migration', 'Legal', 'Community'], tint: 'coral' },
  { cause: 'Legal Advocacy', name: 'Raquel Baptista', bio: 'Offers pro-bono legal consultations for LGBTQ+ people facing discrimination and family law challenges. Has handled over 60 cases in three years.', tags: ['Law', 'Discrimination', 'Family'], tint: 'plum' },
  { cause: 'Digital Safety', name: 'Diogo Abreu', bio: 'Digital security trainer for LGBTQ+ activists and organisations. Running workshops on protecting identity, communications, and data in high-risk contexts.', tags: ['Tech', 'Safety', 'Privacy'], tint: 'jade' },
]

export function ChangemakersPage() {
  const { showToast } = useToast()
  const [nominee, setNominee] = useState('')

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            Change Makers
          </Reveal>
          <Reveal as="h1" delay={60}>
            People making the future <em>liveable</em> for all of us.
          </Reveal>
          <Reveal as="p" delay={120}>
            They're not full-time activists. They're designers, lawyers, carers, and teachers who
            also happen to be changing things — neighbourhood by neighbourhood, policy by policy, one
            hard conversation at a time.
          </Reveal>
          <div className={styles.stats}>
            {STATS.map((s, i) => (
              <Reveal as="div" key={s.l} className={styles.stat} delay={160 + i * 60}>
                <div className="n" style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(34px,4vw,52px)', color: 'var(--cream)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {s.n}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(247,243,238,.55)', marginTop: 6, lineHeight: 1.4 }}>{s.l}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featured}>
        <div className="wrap">
          <Reveal as="div" className={styles.featLabel}>
            Featured change maker
          </Reveal>
          <Reveal as="div" className={styles.featCard}>
            <ImageSlot tint="coral" width="100%" height="100%" radius={0} placeholder="Catarina Vaz" initials="CV" />
            <div className={styles.featBody}>
              <div className={styles.featCause}>Housing Rights · Mouraria</div>
              <div className={styles.featName}>Catarina Vaz</div>
              <p className={styles.featBio}>
                When Catarina's neighbours started receiving eviction notices in 2022, she didn't
                wait for someone else to act. She knocked on every door, mapped every situation, and
                built a coalition that eventually made it to the Câmara Municipal. Today she runs
                Mouraria's most active queer residents' network.
              </p>
              <div className={styles.impact}>
                {FEATURED_IMPACT.map((row) => (
                  <div key={row} className={styles.impactRow}>
                    {row}
                  </div>
                ))}
              </div>
              <div className={styles.featFoot}>
                <Button to="/article">Read her story →</Button>
                <Button variant="ghost" to="/connect">
                  Connect
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.profiles}>
        <div className="wrap">
          <div className={styles.grid}>
            {MAKERS.map((m, i) => (
              <Reveal as={Link} to="/article" key={m.name} className={styles.card} delay={i * 60}>
                <ImageSlot tint={m.tint} width="100%" height={180} radius={0} placeholder={m.name} initials={m.name.split(' ').map((p) => p[0]).join('')} />
                <div className={styles.cardBody}>
                  <div className={styles.cardCause}>{m.cause}</div>
                  <div className={styles.cardName}>{m.name}</div>
                  <p className={styles.cardBio}>{m.bio}</p>
                  <div className={styles.cardTags}>
                    {m.tags.map((t) => (
                      <span key={t} className={styles.cardTag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.cardFoot}>
                  <span className={styles.read}>Read more →</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.nominate}>
        <div className="wrap">
          <Reveal as="div" className={styles.nomEye}>
            Community nominations
          </Reveal>
          <Reveal as="h2" delay={60}>
            Know someone who should <em>be here?</em>
          </Reveal>
          <Reveal as="p" delay={120}>
            We add change makers through community nominations. If you know someone doing meaningful
            work for queer people in Lisbon, a name and a sentence is enough to start.
          </Reveal>
          <form
            className={styles.nomForm}
            onSubmit={(e) => {
              e.preventDefault()
              if (!nominee.trim()) return
              showToast(`Thank you — we'll look into ${nominee.trim()}.`, 'success')
              setNominee('')
            }}
          >
            <input
              className={styles.nomInput}
              type="text"
              placeholder="Their name…"
              value={nominee}
              onChange={(e) => setNominee(e.target.value)}
            />
            <Button type="submit">Nominate them</Button>
          </form>
        </div>
      </section>
    </PageShell>
  )
}
