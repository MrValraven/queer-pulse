import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { THERAPISTS, EXPERIENCES, SNS, LANGS } from './mentalHealth.data'
import styles from './MentalHealthPage.module.css'

function initials(name: string) {
  return name
    .replace(/Dr\.\s*/, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
}

export function TherapistSection() {
  const { showToast } = useToast()
  const [filter, setFilter] = useState('all')

  const therapists =
    filter === 'all' ? THERAPISTS : THERAPISTS.filter((t) => t.langs.includes(filter))

  return (
    <section className={styles.sec}>
      <div className="wrap">
        <div className={styles.secHead}>
          <h2>
            Queer-affirming <em>therapists in Lisbon</em>
          </h2>
          <p>
            Reviewed and recommended by community members. Every therapist here has been verified
            as genuinely queer-affirming — not just "welcoming" but experienced with queer lives,
            identities, and the specific pressures of being queer and an expat in Lisbon.
          </p>
        </div>
        <div className={styles.thFilter}>
          <span className={styles.thFilterLabel}>Filter</span>
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              className={[styles.thChip, filter === l && styles.thChipOn].filter(Boolean).join(' ')}
              onClick={() => setFilter(l)}
            >
              {l === 'all' ? 'All languages' : l}
            </button>
          ))}
        </div>
        <div className={styles.therapistGrid}>
          {therapists.map((t) => (
            <div className={styles.therapistCard} key={t.name}>
              <div className={styles.tcTop}>
                <div className={styles.tcAv} style={{ background: t.avBg, color: t.avCol }}>
                  {initials(t.name)}
                </div>
                <div>
                  <div className={styles.tcName}>{t.name}</div>
                  <div className={styles.tcCreds}>{t.creds}</div>
                </div>
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
                <button
                  type="button"
                  className={styles.tcContact}
                  onClick={() =>
                    showToast(`Message sent to ${t.name.split(' ').pop()}`, 'success')
                  }
                >
                  Say hello →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ExperiencesSection() {
  return (
    <section className={`${styles.sec} ${styles.alt}`}>
      <div className="wrap">
        <div className={styles.secHead}>
          <h2>
            Things the community <em>has felt</em>
          </h2>
          <p>
            Being a queer expat in Lisbon comes with specific pressures. Naming them isn't
            complaining — it's the start of dealing with them.
          </p>
        </div>
        <div className={styles.expGrid}>
          {EXPERIENCES.map((e) => (
            <div className={styles.expCard} key={e.title}>
              <div className={styles.expBar} />
              <div>
                <div className={styles.expTitle}>{e.title}</div>
                <div className={styles.expText}>{e.text}</div>
              </div>
            </div>
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
        <div className={styles.secHead}>
          <h2>
            Accessing mental health <em>through the SNS</em>
          </h2>
          <p>
            Portugal's public health system covers mental health, including therapy and psychiatry
            — but access is uneven. Here's what to realistically expect.
          </p>
        </div>
        <div className={styles.snsGrid}>
          {SNS.map((s) => (
            <div className={styles.snsCard} key={s.num}>
              <div className={styles.snsNum}>{s.num}</div>
              <div className={styles.snsTitle}>{s.title}</div>
              <div className={styles.snsText}>{s.text}</div>
            </div>
          ))}
        </div>

        <div className={styles.peerStrip}>
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
        </div>
      </div>
    </section>
  )
}
