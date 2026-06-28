import { PageShell } from '../../shared/components/layout'
import {
  CLASS_INFO,
  CLASS_VOICE,
  COMMUNITY_INFO,
  FAITH_INFO,
  FAITH_VOICES,
  NAV,
  RACE_INFO,
  RACE_VOICES,
} from './intersectionality.data'
import { FadeIn, Reveal } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { InfoCards, VoiceCard, VoiceCardSkeleton } from './IntersectionalityCards'
import { IntersectionalityFooter } from './IntersectionalityFooter'
import styles from './IntersectionalityPage.module.css'

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' })
}

export function IntersectionalityPage() {
  const loading = useSimulatedLoad()

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Intersectionality</div>
          <h1>
            More than one thing <em>at once.</em>
          </h1>
          <p className={styles.heroSub}>
            Being queer and a person of colour, queer and religious, queer and working class, queer
            and disabled — these identities don't stack neatly. This page exists for members
            navigating multiple layers, and for a community committed to holding all of them.
          </p>
          <div className={styles.opening}>
            <div className={styles.openingBar} />
            <p className={styles.openingText}>
              <strong>This page is for everyone.</strong>
              Not as an education exercise for people who don't have these experiences. As a resource
              for members who do, and as a visible commitment from QueerPulse that queerness doesn't
              mean a single kind of person.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.ixNav}>
        <div className={styles.ixNavInner}>
          {NAV.map((n) => (
            <button key={n.id} type="button" className={styles.ixNavBtn} onClick={() => scrollToSection(n.id)}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <Reveal as="section" className={styles.sec} id="race">
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Race &amp; <em>ethnicity</em>
            </h2>
            <p>
              Being a queer person of colour in Lisbon means navigating two things at once that
              mainstream spaces rarely design for simultaneously. Portugal's colonial history shapes
              this city in ways that are visible if you're living them — and invisible if you're not.
            </p>
          </div>
          <div className={styles.voiceGrid}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <VoiceCardSkeleton key={i} />)
              : RACE_VOICES.map((v, i) => (
                  <FadeIn key={v.name} delay={Math.min(i, 8) * 60}>
                    <VoiceCard v={v} />
                  </FadeIn>
                ))}
          </div>
          <InfoCards cards={RACE_INFO} loading={loading} animate={!loading} />
        </div>
      </Reveal>

      <Reveal as="section" className={`${styles.sec} ${styles.alt}`} id="faith">
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Faith &amp; <em>religion</em>
            </h2>
            <p>
              Being queer and religious is not a contradiction — though plenty of people will try to
              make you feel like it is. Portugal is predominantly Catholic, and the relationship
              between the Church and LGBTQ+ people is complicated, evolving, and deeply personal.
            </p>
          </div>
          <div className={styles.voiceGrid}>
            {loading
              ? Array.from({ length: 2 }).map((_, i) => <VoiceCardSkeleton key={i} />)
              : FAITH_VOICES.map((v, i) => (
                  <FadeIn key={v.name} delay={Math.min(i, 8) * 60}>
                    <VoiceCard v={v} />
                  </FadeIn>
                ))}
          </div>
          <InfoCards cards={FAITH_INFO} loading={loading} animate={!loading} />
        </div>
      </Reveal>

      <Reveal as="section" className={styles.sec} id="class">
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Class &amp; <em>economics</em>
            </h2>
            <p>
              Queer community often has an unspoken class character — certain bars, events,
              aesthetics, and social codes signal belonging in ways that exclude people who can't or
              don't participate. Naming this is the first step to doing something about it.
            </p>
          </div>
          <div className={styles.note}>
            <div className={styles.noteBar} />
            <div className={styles.noteText}>
              <strong>QueerPulse's position:</strong> We try to make community participation
              accessible regardless of income. Events have sliding-scale options; the forum is free;
              this platform is free for members who can't afford a contribution. If cost is a barrier
              to anything here, contact us directly — it will be handled discreetly.
            </div>
          </div>
          <InfoCards cards={CLASS_INFO} loading={loading} animate={!loading} />
          <div className={`${styles.voiceGrid} ${styles.voiceGridTop}`}>
            {loading
              ? <VoiceCardSkeleton />
              : (
                  <FadeIn key={CLASS_VOICE.name}>
                    <VoiceCard v={CLASS_VOICE} />
                  </FadeIn>
                )}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className={`${styles.sec} ${styles.alt}`} id="community">
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Navigating <em>the community itself</em>
            </h2>
            <p>
              Queer spaces aren't automatically safe for all queer people. Racism, classism,
              transphobia, ableism, and other dynamics exist within LGBTQ+ communities. This isn't a
              reason to leave — it's a reason to name it.
            </p>
          </div>
          <InfoCards cards={COMMUNITY_INFO} loading={loading} animate={!loading} />
        </div>
      </Reveal>

      <IntersectionalityFooter />
    </PageShell>
  )
}
