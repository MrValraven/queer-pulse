import { PageShell } from '../../shared/components/layout'
import { Button, Outro } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { CRISIS } from './mentalHealth.data'
import { TherapistSection, ExperiencesSection, SnsSection } from './MentalHealthSections'
import styles from './MentalHealthPage.module.css'

const FORUM = routes.forum
const MENTORSHIP = routes.mentorship

export function MentalHealthPage() {
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Mental Health</div>
          <h1>
            You don't have to be <em>okay.</em>
          </h1>
          <p className={styles.heroSub}>
            Queer-affirming therapists, honest information about accessing mental health support in
            Lisbon, crisis resources, and a community that understands what you're carrying —
            because we're carrying it too.
          </p>
        </div>
      </div>

      <div className={styles.crisisBar}>
        <div className="wrap">
          <div className={styles.crisisInner}>
            <div>
              <div className={styles.crisisLabel}>If you need support now</div>
              <div className={styles.crisisHeading}>Crisis &amp; immediate support lines</div>
              <p className={styles.crisisSub}>
                These lines are available now. You don't have to be in immediate danger to call —
                if you're struggling, reaching out is enough.
              </p>
            </div>
            <div className={styles.crisisLines}>
              {CRISIS.map((c) => (
                <div className={styles.crisisLine} key={c.name}>
                  <div className={styles.clName}>{c.name}</div>
                  <div className={styles.clNum}>{c.num}</div>
                  <div className={styles.clNote}>{c.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TherapistSection />
      <ExperiencesSection />
      <SnsSection forum={FORUM} mentorship={MENTORSHIP} />

      <Outro
        title={<>Asking for help is <em>not small.</em></>}
        sub="It's one of the harder things. The community is here."
      >
        <Button to={FORUM} variant="primary" size="lg">
          Talk to someone
        </Button>
      </Outro>
    </PageShell>
  )
}
