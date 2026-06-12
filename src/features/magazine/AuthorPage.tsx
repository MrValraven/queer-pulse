import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, ImageSlot } from '../../shared/components/ui'
import { memberName } from '../members/data/members'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './AuthorPage.module.css'

const BEATS = ['Health & access', 'Migration & visas', 'Public services', 'Long reads', 'Interviews', 'Reported essays']

const ARTICLES = [
  { kicker: 'Long read · 14 min', titleHtml: 'What the SNS gets right (and where it <em>still leaves you waiting</em>).', dek: 'Six months reporting inside three regional health centres in Lisbon and the Algarve.', meta: 'Issue 07 · Apr 2026' },
  { kicker: 'Interview', titleHtml: "Dr. Inês Pereira on <em>fifteen minutes of someone else's time.</em>", dek: 'The Anjos GP who treats trans patients as adults — and changed the protocol for an entire clinic.', meta: 'Issue 06 · Feb 2026' },
  { kicker: 'Reported essay', titleHtml: 'The visa queue is <em>a kind of closet.</em>', dek: 'Three queer migrants on what it means to wait for a residency permit while not being out to your case officer.', meta: 'Issue 05 · Dec 2025' },
  { kicker: 'Opinion', titleHtml: 'Stop calling it "access." <em>Call it care.</em>', dek: 'A small change in language that changes how clinics get funded — and who gets seen.', meta: 'Issue 04 · Oct 2025' },
  { kicker: 'Reporting', titleHtml: 'Inside the back room of <em>Café Beirão.</em>', dek: "How a monthly open clinic became Lisbon's quietest piece of mutual-aid infrastructure.", meta: 'Issue 03 · Aug 2025' },
  { kicker: `Interview · with ${memberName('sofia')}`, titleHtml: 'Mariza Câmara, <em>district health director.</em>', dek: "An hour-long conversation about queer health policy in Lisbon's Câmara Municipal.", meta: 'Issue 02 · Jun 2025' },
]

const READING = [
  { titleHtml: 'The Right to Maim <em>· Jasbir K. Puar</em>', tag: 'book' },
  { titleHtml: 'How a queer GP rebuilt her practice', tag: 'FT Magazine, 2024' },
  { titleHtml: 'Lisboa pulse — visual notes <em>· Editora Anjos</em>', tag: 'zine' },
  { titleHtml: 'The SNS, in numbers', tag: '2025 annual report' },
  { titleHtml: 'On waiting <em>· Maria Tumarkin</em>', tag: 'essay' },
]

export function AuthorPage() {
  const { showToast } = useToast()

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <div className={styles.eyebrow}>Magazine · Writer</div>
            <h1 className={styles.name}>
              Sara <em>Pinheiro.</em>
            </h1>
            <div className={styles.role}>Contributing editor, health &amp; access</div>
            <p className={styles.bio}>
              Sara writes about queer life and the systems that surround it — clinics, classrooms,
              courtrooms, neighbourhoods. She joined QueerPulse Magazine in 2023 after a decade in
              public-health reporting at <em>Público</em> and <em>Mensagem de Lisboa</em>. Born in
              Setúbal, lives in Anjos.
            </p>
            <div className={styles.metaRow}>
              <Button onClick={() => showToast('Following Sara', 'success')}>Follow writer</Button>
              <Button variant="ghost" to="/newsletter">
                Subscribe to her column
              </Button>
              <span className={styles.pronouns}>she/her</span>
            </div>
          </div>
          <ImageSlot
            tint="coral"
            radius={24}
            className={styles.portrait}
            placeholder="Portrait of Sara Pinheiro"
            style={{ aspectRatio: '4/5', height: 'auto' }}
          />
        </header>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <b><em>14</em></b>Articles published
          </div>
          <div className={styles.stat}>
            <b>3</b>Years contributing
          </div>
          <div className={styles.stat}>
            <b>1.8k</b>Subscribers to her column
          </div>
          <div className={styles.stat}>
            <b><em>2</em></b>Issue covers · 2025
          </div>
        </div>

        <div className={styles.beats}>
          {BEATS.map((beat, index) => (
            <Link
              key={beat}
              to="/tag"
              className={[styles.beat, index === 0 && styles.beatPrimary].filter(Boolean).join(' ')}
            >
              {beat}
            </Link>
          ))}
        </div>

        <div className={styles.sec}>
          <h2>
            Most recent · <em>featured</em>
          </h2>
        </div>
        <div className={styles.featured}>
          <div>
            <div className={styles.featKicker}>Cover story · Issue 09 · Health</div>
            <h3 className={styles.featTitle}>
              <Link to="/article?id=city-changed">
                Five things I learned <em>navigating Lisbon's trans health system.</em>
              </Link>
            </h3>
            <p className={styles.featDek}>
              From the SNS to private clinics, what nobody tells you about waiting lists, referrals,
              and how to actually get a hormone prescription without losing a year of your life.
            </p>
            <p className={styles.featMeta}>Published 6 Jun 2026 · 8 min read · 284 reads this week</p>
          </div>
          <ImageSlot tint="jade" className={styles.featImg} radius={18} placeholder="Hero image: cover story 09" style={{ height: 'auto' }} />
        </div>

        <div className={styles.sec}>
          <h2>Selected work</h2>
          <Link to="/magazine">All 14 articles →</Link>
        </div>
        <div className={styles.articles}>
          {ARTICLES.map((article) => (
            <Link key={article.titleHtml} to="/article?id=housing-law" className={styles.art}>
              <div className={styles.artKicker}>{article.kicker}</div>
              <div className={styles.artTitle} dangerouslySetInnerHTML={{ __html: article.titleHtml }} />
              <div className={styles.artDek}>{article.dek}</div>
              <div className={styles.artMeta}>{article.meta}</div>
            </Link>
          ))}
        </div>

        <div className={styles.readlist}>
          <div>
            <h3>
              What Sara is <em>reading.</em>
            </h3>
            <p>Curated by the writer herself — books, longforms, and resources she returns to when reporting.</p>
            <Button to="/library" style={{ marginTop: 8 }}>
              See all 22 picks →
            </Button>
          </div>
          <ol>
            {READING.map((item) => (
              <li key={item.titleHtml}>
                <span dangerouslySetInnerHTML={{ __html: item.titleHtml }} /> <span>{item.tag}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.sec}>
          <h2>
            Find Sara <em>elsewhere</em>
          </h2>
        </div>
        <div className={styles.elsewhere}>
          <a href="mailto:sara@queerpulse.app">
            sara@queerpulse.app <span>· pitch direct</span>
          </a>
          <a href="#">
            Are.na <span>· /sara-pinheiro</span>
          </a>
          <a href="#">
            Bluesky <span>· @sarapinheiro</span>
          </a>
          <Link to="/profile">
            Member profile <span>· in Lisbon</span>
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
