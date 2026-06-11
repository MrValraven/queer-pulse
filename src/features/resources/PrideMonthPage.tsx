import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import {
  GATHERING, SAFETY, MANIFESTO, MARCH_META,
} from './prideMonth.data'
import {
  PrideMonthCalendar, PrideMonthSafety, PrideMonthReading,
} from './PrideMonthSections'
import styles from './PrideMonthPage.module.css'

export function PrideMonthPage() {
  return (
    <PageShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.eyebrow}>June 2026 · Pride Month · Lisbon</span>
            <h1 className={styles.h1}>
              Quietly, <em>loudly,</em> together.
            </h1>
            <p className={styles.dek}>
              Thirty days of gatherings, reading, organising, and showing up —
              curated by members, hosted at safe spaces, and free where it matters.{' '}
              <em>This is not a sale.</em> No rainbow logos, no sponsored content, no
              toolkits. Just the events, the writing, and the practical guides for
              staying safe and together this month.
            </p>
            <div className={styles.actions}>
              <Button href="#calendar" variant="primary">
                See all 38 events
              </Button>
              <Button href="#march" variant="ghost-dark">
                Lisboa Pride · 21 Jun
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.letter}>
          <div className={styles.letterInner}>
            <div className={styles.letterKicker}>Editor's note · from Marta Reis</div>
            <h2 className={styles.letterH}>
              June is a <em>working month,</em> not a corporate one.
            </h2>
            <p className={styles.letterP}>
              Once a year the city goes briefly stripey, the supermarkets get a paint
              job, and twelve airlines launch a "be authentic" campaign.{' '}
              <strong>None of this is for us.</strong> It is for whoever's paying for
              it.
            </p>
            <p className={styles.letterP}>
              What this month is actually for, on QueerPulse, is the same thing it was
              when this began: <em>people doing the work</em>, the rooms staying open,
              the lists getting longer, the lawyers showing up at 06:00 with binders.
              The march. The reading. The hand-off between the clinic and the bar. The
              mothers who finally come this year.
            </p>
            <p className={styles.letterP}>
              If you read one thing this month, read the{' '}
              <Link to={MANIFESTO}>manifesto</Link>. If you go to one thing, make it{' '}
              <a href="#march">the march</a>.{' '}
              <em>If you do one thing for someone else</em>,
              walk a friend home.
            </p>
            <p className={styles.letterSign}>— Marta · 1 June 2026</p>
          </div>
        </section>

        <section className={styles.march} id="march">
          <div className={styles.marchInner}>
            <div>
              <div className={styles.marchKicker}>The headliner · 21 June</div>
              <h2 className={styles.marchH}>
                Marcha do <em>Orgulho Lisboa 2026.</em>
              </h2>
              <p className={styles.marchD}>
                Twenty-eighth edition. Starts at <b>Marquês de Pombal</b>, ends at{' '}
                <b>Terreiro do Paço</b>. QueerPulse marches as one block — meeting
                point at <em>15:30</em>, sign-making at Café Beirão from <em>13:00</em>.
                Forty trained legal observers on the route, courtesy of our ILGA
                Portugal partnership.
              </p>
              <div className={styles.marchMeta}>
                {MARCH_META.map(([k, v]) => (
                  <div className={styles.mmRow} key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              <div className={styles.marchBtns}>
                <Button to={GATHERING} variant="primary">
                  RSVP to the QP block
                </Button>
                <Button to={SAFETY} variant="ghost">
                  Read the safety brief
                </Button>
              </div>
            </div>
            <div className={styles.marchImg}>Marcha do Orgulho · last year's route map</div>
          </div>
        </section>

        <PrideMonthCalendar />
        <PrideMonthSafety />
        <PrideMonthReading />
      </div>
    </PageShell>
  )
}
