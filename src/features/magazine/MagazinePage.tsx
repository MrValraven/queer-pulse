import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Avatar, Button, ImageSlot, Reveal } from '../../shared/components/ui'
import type { AvatarTint } from '../../shared/components/ui/Avatar'
import styles from './MagazinePage.module.css'

interface Card {
  id: string
  kicker: string
  titleHtml: string
  excerpt: string
  author: string
  meta: string
  initials: string
  tint: AvatarTint
  verdict?: 'essential' | 'recommended'
  imgDesc: string
}

const FEATURES: Card[] = [
  { id: 'mouraria-family', kicker: 'Community', titleHtml: "Mouraria's chosen family, ten years later", excerpt: 'The original group is scattered. Some left Lisbon. Two died. The rest still meet on the same corner. A decade on, what holds a chosen family together?', author: 'Inês Tavares', meta: '2,400 words', initials: 'IT', tint: 'jade', imgDesc: 'Narrow street in Mouraria, afternoon light, laundry overhead' },
  { id: 'last-bar', kicker: 'Nightlife', titleHtml: "The last queer bar in Bairro Alto that isn't trying", excerpt: 'No Instagram. No theme nights. No cocktail menu. Just a room, a sound system, and forty years of the community walking through the same door.', author: 'Diogo Vasques', meta: '1,800 words', initials: 'DV', tint: 'plum', imgDesc: 'Low-lit bar interior at daytime, mismatched chairs, faded pride flag' },
  { id: 'housing-law', kicker: 'Politics', titleHtml: 'What the new housing law actually means for us', excerpt: 'The legislation passed in April. We spoke to three housing lawyers and four community members already living its consequences.', author: 'Mariana Costa', meta: '3,100 words', initials: 'MC', tint: 'coral', imgDesc: 'Person reading documents at kitchen table, morning light' },
]

const ESSAYS: Card[] = [
  { id: 'i-arrived', kicker: 'Essay of the month', titleHtml: "I didn't come out.<br/><em>I arrived.</em>", excerpt: 'On becoming queer as arrival rather than revelation — and why the community gave me the language for the identity, not the other way around.', author: 'Tomás Beto', meta: '8 min read', initials: 'TB', tint: 'plum', imgDesc: '' },
  { id: 'visibility-politics', kicker: 'Essay', titleHtml: 'On visibility, and <em>who it actually serves</em>', excerpt: 'Visibility saves lives. The data says so. But whose visibility are we building infrastructure for — and is the billboard kind ever enough?', author: 'Rui Fernandes', meta: '7 min read', initials: 'RF', tint: 'jade', imgDesc: '' },
  { id: 'politics-of-staying', kicker: 'Essay', titleHtml: 'The politics <em>of staying</em>', excerpt: 'Everyone who left had a reasonable reason. But rebuilding the informal infrastructure of a queer life is specific, slow work — and the staying was the building.', author: 'Catarina Melo', meta: '6 min read', initials: 'CM', tint: 'coral', imgDesc: '' },
]

const INTERVIEWS: Card[] = [
  { id: 'kiko-neves', kicker: 'Music', titleHtml: '"The audience at my worst gig taught me more than my best one"', excerpt: 'Kiko Neves on improvisation, Marvila, and what it means to make queer jazz in a city that hasn\'t quite decided what it is yet.', author: 'Sofia Andrade', meta: 'Interview', initials: 'SA', tint: 'plum', imgDesc: 'Kiko Neves at the piano in his Marvila studio' },
  { id: 'beatriz-pinto', kicker: 'Art & Craft', titleHtml: 'Beatriz Pinto: making things that will outlast the conversation', excerpt: 'The ceramicist on slowness, the politics of functional objects, and why she hasn\'t installed a social media account.', author: 'Inês Tavares', meta: 'Interview', initials: 'IT', tint: 'coral', imgDesc: "Beatriz Pinto's hands shaping clay in her studio" },
  { id: 'ilga-director', kicker: 'Activism', titleHtml: "ILGA Portugal's new director on what the next decade requires", excerpt: 'A conversation about what has changed, what hasn\'t, and why the movement\'s most important work is happening in places that aren\'t visible yet.', author: 'Mariana Costa', meta: '2,200 words', initials: 'MC', tint: 'jade', imgDesc: 'Portrait in the ILGA Portugal offices' },
]

const REVIEWS: Card[] = [
  { id: 'review-argonauts', kicker: 'Book', titleHtml: '<em>The Argonauts</em> — Maggie Nelson', excerpt: 'Rereading Nelson in Lisbon in 2026: how the most cited book in queer theory still reads like a report from the inside.', author: 'Ana Lima', meta: '', initials: 'AL', tint: 'plum', verdict: 'essential', imgDesc: 'Copy of The Argonauts on a table with coffee' },
  { id: 'review-levante', kicker: 'Film', titleHtml: '<em>Levante</em> dir. Lillah Halla', excerpt: 'A Brazilian debut about a swimmer, an institution, and the particular heroism of friendship. The best film shown in Lisbon this year.', author: 'Diogo Vasques', meta: '', initials: 'DV', tint: 'plum', verdict: 'essential', imgDesc: 'Cinema Ideal marquee at night, wet cobblestones' },
  { id: 'review-sereia', kicker: 'Venue', titleHtml: 'Sereia, Intendente — a bar that wants to be boring', excerpt: 'Six weeks old, no theme nights, no Instagram. Sereia is attempting something rare in a new queer bar: to simply be somewhere you can drink slowly and talk.', author: 'Sofia Andrade', meta: '', initials: 'SA', tint: 'jade', verdict: 'recommended', imgDesc: 'Bar interior with old tiles, warm low lighting' },
]

const COMMUNITY: Card[] = [
  { id: 'sunday-table', kicker: 'Gathering', titleHtml: 'The Sunday table at Esplanada do Intendente', excerpt: 'Three years of eight to twenty-three people gathering every Sunday for an event that has no organiser, no invitation, and no agenda. A portrait.', author: 'Inês Tavares', meta: '6 min read', initials: 'IT', tint: 'jade', imgDesc: 'Outdoor café tables in Intendente, Sunday afternoon' },
  { id: 'barter-board', kicker: 'Economy', titleHtml: 'How the barter board actually works', excerpt: 'Legal advice for language lessons. Ceramics for photography. Therapy for dog-sitting. Eighteen months in, the barter board has become something nobody predicted.', author: 'Mariana Costa', meta: '7 min read', initials: 'MC', tint: 'coral', imgDesc: 'Handwritten note on a corkboard' },
  { id: 'archive-night', kicker: 'Memory', titleHtml: 'The Archive Night: memory as infrastructure', excerpt: 'On the last Friday of each month, a room in Mouraria fills with people talking about queer Lisbon history — the kind held in boxes under beds, not institutions.', author: 'Rui Fernandes', meta: '8 min read', initials: 'RF', tint: 'jade', imgDesc: 'Someone holding old photographs, warm lamp light' },
]

const LETTERS = [
  { body: 'The trans healthcare piece from last month was the first time I\'ve seen the SNS process explained without someone trying to protect me from the bad parts. Knowing the waiting times in advance helped.', from: '— Member, 28, Intendente' },
  { body: 'I started a reading group after seeing the listing on the platform. We\'ve met four times. Two people in it have become actual friends. Not acquaintances. Friends.', from: '— Member, 34, Mouraria' },
  { body: 'Thank you for publishing Rui\'s essay on burnout without making it a productivity piece. Someone finally understood what I was trying to say to people who love me and couldn\'t hear it.', from: '— Member, 41, Cais do Sodré' },
  { body: 'The housing law piece should be required reading for every queer person renting in Lisbon. I\'ve already forwarded it to four people.', from: '— Member, 31, Arroios' },
]

const ARCHIVE = [
  { title: 'The Night We Stopped Pretending', month: 'May 2026', count: 'Issue 17 · 8 articles', bg: '#3D2255' },
  { title: 'What Solidarity Actually Costs', month: 'April 2026', count: 'Issue 16 · 7 articles', bg: '#2A5C42' },
  { title: 'Bodies in Translation', month: 'March 2026', count: 'Issue 15 · 9 articles', bg: '#7A3820' },
  { title: 'The Queer City Guide', month: 'February 2026', count: 'Issue 14 · 6 articles', bg: '#1E3A5F' },
]

const NAV = ['Features', 'Essays', 'Interviews', 'Reviews', 'Community Life', 'Letters', 'Archive']

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
  )
}

function SectionHead({ title, id }: { title: string; id: string }) {
  return (
    <div className={styles.asHead} id={id}>
      <div className={styles.asTitle} dangerouslySetInnerHTML={{ __html: title }} />
      <span className={styles.asSeeAll}>All {title.replace(/<[^>]+>/g, '').toLowerCase()} →</span>
    </div>
  )
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

      {/* Cover story */}
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
              {FEATURES.map((card) => (
                <ArticleCard key={card.id} card={card} />
              ))}
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
              “The community did not follow my identity. My identity followed the community.”
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
              {INTERVIEWS.map((card) => (
                <ArticleCard key={card.id} card={card} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <SectionHead title="<em>Reviews</em>" id="reviews" />
            <div className={styles.grid}>
              {REVIEWS.map((card) => (
                <ArticleCard key={card.id} card={card} />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <SectionHead title="Community <em>life</em>" id="community-life" />
            <div className={styles.grid}>
              {COMMUNITY.map((card) => (
                <ArticleCard key={card.id} card={card} />
              ))}
            </div>
          </section>

          <section className={styles.letters} id="letters">
            <div className={styles.lsHead}>
              Letters to the <em>editors</em>
            </div>
            {LETTERS.map((letter) => (
              <div key={letter.from} className={styles.letter}>
                <div className={styles.letterBody}>“{letter.body}”</div>
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
              <h3>
                Write for <em>the magazine.</em>
              </h3>
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
  )
}
