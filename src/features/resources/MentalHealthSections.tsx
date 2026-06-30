import { useState } from 'react'
import { Avatar, Button, FilterChips, Reveal } from '../../shared/components/ui'
import { THERAPISTS, EXPERIENCES, SNS, LANGS, type Therapist } from './mentalHealth.data'
import { TherapistProfileModal } from './TherapistProfileModal'
import styles from './MentalHealthPage.module.css'

export function TherapistSection() {
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState<Therapist | null>(null)

  const therapists =
    filter === 'all' ? THERAPISTS : THERAPISTS.filter((t) => t.langs.includes(filter))

  return (
    <section className={styles.sec}>
      <div className="wrap">
        <Reveal className={styles.secHead}>
          <h2>
            Queer-affirming <em>therapists in Lisbon</em>
          </h2>
          <p>
            Reviewed and recommended by community members. Every therapist here has been verified
            as genuinely queer-affirming — not just "welcoming" but experienced with queer lives,
            identities, and the specific pressures of being queer and an expat in Lisbon.
          </p>
        </Reveal>
        <div className={styles.thFilter}>
          <span className={styles.thFilterLabel}>Filter</span>
          <FilterChips
            tone="jade"
            value={filter}
            onChange={setFilter}
            options={LANGS.map((l) => ({ value: l, label: l === 'all' ? 'All languages' : l }))}
          />
        </div>
        <div className={styles.therapistGrid}>
          {therapists.map((t, i) => (
            <Reveal
              key={t.id}
              as="button"
              type="button"
              className={styles.therapistCard}
              delay={Math.min(i, 8) * 60}
              onClick={() => setActive(t)}
              aria-label={`View ${t.name}'s profile`}
            >
              <div className={styles.tcTop}>
                <Avatar
                  initials={t.initials}
                  size={56}
                  src={t.photo}
                  alt={t.name}
                  className={styles.tcAv}
                />
                <div className={styles.tcHeadText}>
                  <div className={styles.tcName}>{t.name}</div>
                  <div className={styles.tcCreds}>{t.creds}</div>
                </div>
                <span
                  className={[
                    styles.tcStatus,
                    t.acceptingNew ? styles.tcStatusOpen : styles.tcStatusFull,
                  ].join(' ')}
                >
                  <span className={styles.tcStatusDot} />
                  {t.acceptingNew ? 'Accepting' : 'Waitlist'}
                </span>
              </div>
              <div className={styles.tcTags}>
                {t.langs.map((l) => (
                  <span key={l} className={`${styles.tcTag} ${styles.tcTagLang}`}>
                    {l}
                  </span>
                ))}
                {t.specs.map((s) => (
                  <span key={s} className={styles.tcTag}>
                    {s}
                  </span>
                ))}
              </div>
              <p className={styles.tcNote}>{t.note}</p>
              <div className={styles.tcFoot}>
                <span className={styles.tcFormat}>{t.format}</span>
                <span className={styles.tcContact}>View profile →</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      {active && (
        <TherapistProfileModal therapist={active} onClose={() => setActive(null)} />
      )}
    </section>
  )
}

export function ExperiencesSection() {
  return (
    <section className={`${styles.sec} ${styles.alt}`}>
      <div className="wrap">
        <Reveal className={styles.secHead}>
          <h2>
            Things the community <em>has felt</em>
          </h2>
          <p>
            Being a queer expat in Lisbon comes with specific pressures. Naming them isn't
            complaining — it's the start of dealing with them.
          </p>
        </Reveal>
        <div className={styles.expGrid}>
          {EXPERIENCES.map((e, i) => (
            <Reveal className={styles.expCard} key={e.title} delay={Math.min(i, 8) * 60}>
              <div className={styles.expBar} />
              <div>
                <div className={styles.expTitle}>{e.title}</div>
                <div className={styles.expText}>{e.text}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SnsSection({ forum, mentorship }: { forum: string; mentorship: string }) {
  return (
    <section className={styles.sec}>
      <div className="wrap">
        <Reveal className={styles.secHead}>
          <h2>
            Accessing mental health <em>through the SNS</em>
          </h2>
          <p>
            Portugal's public health system covers mental health, including therapy and psychiatry
            — but access is uneven. Here's what to realistically expect.
          </p>
        </Reveal>
        <div className={styles.snsGrid}>
          {SNS.map((s, i) => (
            <Reveal className={styles.snsCard} key={s.num} delay={i * 60}>
              <div className={styles.snsNum}>{s.num}</div>
              <div className={styles.snsTitle}>{s.title}</div>
              <div className={styles.snsText}>{s.text}</div>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.peerStrip} delay={60}>
          <div>
            <h3>
              Peer support within <em>the community</em>
            </h3>
            <p>
              The mental health peer support group meets monthly. Members share experiences,
              recommend resources, and support each other — no professional facilitation, just
              honest conversation.
            </p>
          </div>
          <div className={styles.peerBtns}>
            <Button to={forum} variant="primary">
              Join the group
            </Button>
            <Button to={mentorship} variant="ghost-dark">
              Find a peer mentor →
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
