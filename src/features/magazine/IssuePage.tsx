import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Avatar, Button, ImageSlot } from '../../shared/components/ui'
import { MagazineMasthead } from './MagazineMasthead'
import styles from './IssuePage.module.css'
import { TOC, CONTRIBUTORS } from './issue.data'

export function IssuePage() {
  return (
    <PageShell>
      <MagazineMasthead active="issues" />
      <div className={styles.cover}>
        <div className={styles.coverInner}>
          <Link to="/magazine" className={styles.back}>
            ← All issues
          </Link>
          <div className={styles.spread}>
            <div>
              <div className={styles.metaRow}>
                <span className={styles.num}>
                  Issue <em>09</em>
                </span>
                <span className={styles.numL}>Spring · 2026</span>
                <span className={styles.pill}>Current</span>
              </div>
              <h1 className={styles.h1}>
                On <em>health.</em>
              </h1>
              <p className={styles.dek}>
                Twelve pieces about how we keep our bodies, our minds, and each other. Reported,
                debated, illustrated. <em>Sometimes funny.</em>
              </p>
              <div className={styles.stats}>
                <span>
                  <b>12</b> features
                </span>
                <span>
                  <b>84</b> pages
                </span>
                <span>
                  <b>8</b> contributors
                </span>
                <span>
                  Published <b>6 Jun 2026</b>
                </span>
              </div>
            </div>
            <ImageSlot tint="coral" radius={18} placeholder='Issue 09 cover · "On Health"' style={{ aspectRatio: '3/4', height: 'auto' }} />
          </div>
        </div>
      </div>

      <section className={styles.letter}>
        <div className={styles.letterInner}>
          <div className={styles.letterEyebrow}>Editor's letter</div>
          <h2>
            The body is <em>a political object.</em> So is the appointment.
          </h2>
          <p>
            We started reporting this issue because half of the people in our community say they're
            putting off a doctor's visit. Not because they don't have insurance. Because they're
            tired of explaining themselves at a desk.
          </p>
          <p>
            Twelve writers, three months, fourteen interviews, two clinics visited at 2am. The
            result is an issue we could only have made together — Sara Pinheiro's cover piece on the
            trans health protocol, an interview with the woman who fixed an entire clinic by being{' '}
            <em>kind on purpose</em>.
          </p>
          <p>Read it in any order. Lend it to your GP.</p>
          <div className={styles.sign}>
            <Avatar initials="MR" tint="coral" size={42} />
            <div>
              <div className={styles.signName}>Marta Reis</div>
              <div className={styles.signRole}>Editor in chief · QueerPulse Magazine</div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.page}>
        <div className={styles.tocHead}>
          <h2>
            Table of <em>contents</em>
          </h2>
          <div className="meta">84 pages · 12 features · 1 long-read</div>
        </div>

        <div>
          {TOC.map((section) => (
            <div key={section.heading} className={styles.section}>
              <div className={styles.sectionH}>{section.heading}</div>
              <div className={styles.entries}>
                {section.entries.map((entry) => (
                  <Link key={entry.page} to="/article?id=housing-law" className={styles.entry}>
                    <div>
                      <div className={styles.entryKicker}>{entry.kicker}</div>
                      <div className={styles.entryTitle}>{entry.title}</div>
                      <div className={styles.entryDek}>{entry.dek}</div>
                      <div className={styles.entryByline}>{entry.byline}</div>
                    </div>
                    <div className={styles.metaR}>
                      {entry.page}
                      <span className="pg">page</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className={styles.contrib}>
        <div className={styles.contribInner}>
          <h2>
            This issue's <em>contributors</em>
          </h2>
          <p className={styles.contribSub}>
            Eight community members made Issue 09. Writers, an illustrator, and the editors who held
            it together.
          </p>
          <div className={styles.contribGrid}>
            {CONTRIBUTORS.map((person) => (
              <Link key={person.name} to="/author" className={styles.contribCard}>
                <Avatar initials={person.initials} tint="coral" size={38} />
                <div>
                  <div className={styles.contribName}>{person.name}</div>
                  <div className={styles.contribRole}>{person.role}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.print}>
        <div className={styles.printInner}>
          <div>
            <div className={styles.poEyebrow}>Print edition</div>
            <h2 className={styles.poH}>
              Hold it <em>in your hands.</em>
            </h2>
            <p className={styles.poD}>
              Issue 09 is available as a <b>limited print run</b> — 84 pages, risograph cover,
              printed in Marvila. Members get it at cost; proceeds fund the next issue's
              contributors.
            </p>
            <div className={styles.poActions}>
              <Button to="/checkout">Order the print edition — €12</Button>
              <Button variant="ghost" to="/magazine">
                Read online free
              </Button>
            </div>
          </div>
          <ImageSlot tint="coral" radius={18} placeholder="Print edition mockup · Issue 09" style={{ aspectRatio: '4/3', height: 'auto' }} />
        </div>
      </section>
    </PageShell>
  )
}
