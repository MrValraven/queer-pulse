import { Link } from 'react-router-dom';
import { PageShell } from '../../shared/components/layout';
import { Avatar, Button, ImageSlot, Reveal } from '../../shared/components/ui';
import styles from './MagazinePage.module.css';
import type { Card } from './magazinePage.data';
import { FEATURES, ESSAYS, INTERVIEWS, REVIEWS, COMMUNITY, LETTERS, ARCHIVE, NAV } from './magazinePage.data';

function ArticleCard({ card }: { card: Card }) {
  return (
    <Reveal as={Link} {...{ to: `/article?id=${card.id}` }} className={styles.ac}>
      <div className={styles.acImg}>
        <ImageSlot tint={card.tint === 'auth' ? 'plum' : card.tint} height="100%" radius={14} placeholder={card.imgDesc} />
      </div>
      <div className={styles.acKicker}>{card.kicker}</div>
      <div className={styles.acTitle} dangerouslySetInnerHTML={{ __html: card.titleHtml }} />
      <div className={styles.acExcerpt}>{card.excerpt}</div>
      <div className={styles.acMeta}>
        <Avatar initials={card.initials} tint={card.tint} size={22} />
        {card.author}
        {card.verdict ? (
          <>
            {' · '}
            <span className={`${styles.rv} ${styles[card.verdict]}`}>
              {card.verdict === 'essential' ? 'Essential' : 'Recommended'}
            </span>
          </>
        ) : (
          card.meta && ` · ${card.meta}`
        )}
      </div>
    </Reveal>
  );
}

function SectionHead({ title, id }: { title: string; id: string }) {
  return (
    <div className={styles.asHead} id={id}>
      <div className={styles.asTitle} dangerouslySetInnerHTML={{ __html: title }} />
      <span className={styles.asSeeAll}>All {title.replace(/<[^>]+>/g, '').toLowerCase()} →</span>
    </div>
  );
}

export function MagazinePage() {
  return (
    <PageShell>
      <div className={styles.masthead}>
        <div className="wrap">
          <div className={styles.mmTop}>
            <div className={styles.mmBrand}>
              Queer<em>Pulse</em>
              <br />
              Magazine
            </div>
            <div className={styles.mmMeta}>
              <div className={styles.mmIssue}>Issue 18</div>
              <div className={styles.mmDate}>June 2026</div>
              <div className={styles.mmTagline}>Published the first of every month</div>
            </div>
          </div>
          <nav className={styles.magNav}>
            {NAV.map((label) => (
              <a key={label} className={styles.mnLink} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className={styles.cover}>
        <div className={styles.csImage}>
          <ImageSlot tint="plum" width="100%" height="100%" radius={0} placeholder="Cover portrait — full bleed, dramatic lighting" style={{ position: 'absolute', inset: 0 }} />
          <div className={styles.csImageLabel}>Cover · June 2026</div>
        </div>
        <div className={`${styles.csText} wrap`}>
          <div className={styles.csKicker}>Cover story · Feature</div>
          <h1 className={styles.csTitle}>
            The city changed.
            <br />
            <em>Did we?</em>
          </h1>
          <div className={styles.csByline}>By Sofia Andrade · Photography by André Quintela</div>
          <p className={styles.csExcerpt}>
            Lisbon's queer community has spent a decade finding itself. The rent has tripled. The
            bars have closed and reopened and closed again. What survived the decade, and what did
            we lose in the process?
          </p>
          <Link className={styles.csRead} to="/article?id=city-changed">
            Read the full feature <span>→</span>
          </Link>
        </div>
      </div>

      <main className={styles.body}>
        <div className="wrap">
          <section className={styles.section}>
            <SectionHead title="This month's <em>features</em>" id="features" />
            <div className={styles.grid}>
              {FEATURES.map((card) => <ArticleCard key={card.id} card={card} />)}
            </div>
          </section>

          <Reveal className={styles.featured}>
            <div>
              <div className={styles.feKicker}>Essay of the month</div>
              <h2 className={styles.feTitle}>
                I didn't come out.
                <br />
                <em>I arrived.</em>
              </h2>
              <div className={styles.feByline}>By Tomás Beto</div>
              <p className={styles.feExcerpt}>
                Coming out implies a before and an after. A door, a room, a revelation. What if it
                was never that clean? What if you just quietly became yourself and one day looked
                around and noticed everyone already knew?
              </p>
              <Link className={styles.feRead} to="/article?id=i-arrived">
                Read the essay <span>→</span>
              </Link>
            </div>
            <div className={styles.fePull}>
              "The community did not follow my identity. My identity followed the community."
            </div>
          </Reveal>

          <section className={styles.section}>
            <SectionHead title="<em>Essays</em>" id="essays" />
            <div className={styles.essaysGrid}>
              {ESSAYS.map((card) => (
                <Reveal as={Link} key={card.id} {...{ to: `/article?id=${card.id}` }} className={styles.ec}>
                  <div className={styles.ecKicker}>{card.kicker}</div>
                  <div className={styles.ecTitle} dangerouslySetInnerHTML={{ __html: card.titleHtml }} />
                  <p className={styles.acExcerpt}>{card.excerpt}</p>
                  <div className={styles.acMeta}>
                    <Avatar initials={card.initials} tint={card.tint} size={20} />
                    {card.author} · {card.meta}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <SectionHead title="<em>Interviews</em>" id="interviews" />
            <div className={styles.grid}>
              {INTERVIEWS.map((card) => <ArticleCard key={card.id} card={card} />)}
            </div>
          </section>

          <section className={styles.section}>
            <SectionHead title="<em>Reviews</em>" id="reviews" />
            <div className={styles.grid}>
              {REVIEWS.map((card) => <ArticleCard key={card.id} card={card} />)}
            </div>
          </section>

          <section className={styles.section}>
            <SectionHead title="Community <em>life</em>" id="community-life" />
            <div className={styles.grid}>
              {COMMUNITY.map((card) => <ArticleCard key={card.id} card={card} />)}
            </div>
          </section>

          <section className={styles.letters} id="letters">
            <div className={styles.lsHead}>Letters to the <em>editors</em></div>
            {LETTERS.map((letter) => (
              <div key={letter.from} className={styles.letter}>
                <div className={styles.letterBody}>"{letter.body}"</div>
                <div className={styles.letterFrom}>{letter.from}</div>
              </div>
            ))}
          </section>

          <section className={styles.section} id="archive">
            <SectionHead title="Past <em>issues</em>" id="archive-head" />
            <div className={styles.archiveRow}>
              {ARCHIVE.map((issue) => (
                <Link key={issue.title} to="/issue" className={styles.archiveIssue}>
                  <div className={styles.aiCover} style={{ background: issue.bg }}>
                    <div className={styles.aiCoverTitle}>{issue.title}</div>
                  </div>
                  <div className={styles.aiMonth}>{issue.month}</div>
                  <div className={styles.aiCount}>{issue.count}</div>
                </Link>
              ))}
            </div>
          </section>

          <div className={styles.submit}>
            <div className={styles.ssBody}>
              <h3>Write for <em>the magazine.</em></h3>
              <p>
                We publish essays, features, reviews, interviews, and criticism from community
                members. No formal credentials required — just something worth saying.
              </p>
            </div>
            <Button href="mailto:magazine@queerpulse.pt" variant="primary" size="lg" style={{ background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '15px 30px', fontWeight: 600, fontFamily: 'var(--sans)' }}>
              Pitch us
            </Button>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
