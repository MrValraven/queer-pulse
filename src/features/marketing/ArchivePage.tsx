import { PageShell } from '../../shared/components/layout'
import { Button, ImageSlot, Reveal, SectionHead } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { FEATURED, ARCHIVE_CARDS, ORAL_QUOTES } from './archive.data'
import styles from './ArchivePage.module.css'

export function ArchivePage() {
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            Community Archive
          </Reveal>
          <Reveal as="h1" delay={60}>
            Stories that shouldn't <em>be forgotten.</em>
          </Reveal>
          <Reveal as="p" className={styles.heroSub} delay={120}>
            An ongoing archive of oral histories, testimonials, and personal accounts from queer
            people in Lisbon — past and present. Stories that document who we are, what we've built,
            and what it cost.
          </Reveal>
        </div>
      </div>

      <section className={styles.featured}>
        <div className="wrap">
          <Reveal as="div" className={styles.featLabel}>
            This month's featured story
          </Reveal>
          <Reveal as="div" className={styles.featStory} delay={60}>
            <ImageSlot
              tint={FEATURED.imgTint}
              src={FEATURED.image}
              height={480}
              radius={0}
              placeholder="Portrait or scene for the featured story"
            />
            <div className={styles.featBody}>
              <div className={styles.featQuote}>{FEATURED.quote}</div>
              <div className={styles.featBy}>
                <div className={styles.featAv} style={{ background: FEATURED.avBg, color: FEATURED.avColor }}>
                  {FEATURED.initials}
                </div>
                <div>
                  <div className={styles.featName}>{FEATURED.name}</div>
                  <div className={styles.featRole}>{FEATURED.role}</div>
                </div>
              </div>
              <p className={styles.featExcerpt}>{FEATURED.excerpt}</p>
              <Button to={routes.story} variant="ghost" style={{ alignSelf: 'flex-start' }}>
                Read her story →
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.gridSec}>
        <div className="wrap">
          <Reveal>
            <SectionHead
              title={<>From the <em>archive</em></>}
              subtitle="Personal accounts from community members, past and present."
            />
          </Reveal>
          <div className={styles.grid}>
            {ARCHIVE_CARDS.map((c, i) => (
              <Reveal as="div" key={c.id} className={styles.card} delay={i * 70}>
                <ImageSlot tint={c.imgTint} src={c.image} height={220} radius={0} placeholder={`Archive · ${c.name}`} />
                <div className={styles.cardBody}>
                  <div className={styles.acYear}>{c.year}</div>
                  <div className={styles.acQuote}>{c.quote}</div>
                  <p className={styles.acDesc}>{c.desc}</p>
                  <div className={styles.acBy}>
                    <div className={styles.acAv} style={{ background: c.avBg, color: c.avColor }}>
                      {c.initials}
                    </div>
                    <div>
                      <div className={styles.acName}>{c.name}</div>
                      <span className={styles.acMeta}>{c.meta}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.oral}>
        <div className="wrap">
          <Reveal as="div" className={styles.oralHead}>
            <h2 className={styles.oralH}>
              In their own <em>words.</em>
            </h2>
            <div className={styles.oralSub}>Short excerpts from longer oral histories in the archive.</div>
          </Reveal>
          <div className={styles.oralGrid}>
            {ORAL_QUOTES.map((q, i) => (
              <Reveal as="div" key={q.name} className={styles.oralCard} delay={i * 70}>
                <div className={styles.ocName}>{q.name}</div>
                <div className={styles.ocRole}>{q.role}</div>
                <div className={styles.ocQuote}>{q.quote}</div>
                <div className={styles.ocYear}>{q.year}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.submit}>
        <div className="wrap">
          <Reveal as="div" className={styles.submitInner}>
            <h2>
              Your story <em>belongs here too.</em>
            </h2>
            <p>
              The archive grows through community contribution. If you have a story you want to tell —
              about Lisbon, about your community, about what brought you here or what kept you going —
              we want to hear it. All formats welcome: written, audio, video, photos.
            </p>
            <Button to={routes.contact} variant="primary" size="lg">
              Submit your story →
            </Button>
          </Reveal>
        </div>
      </section>
    </PageShell>
  )
}
