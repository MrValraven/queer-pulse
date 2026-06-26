import { PageShell } from '../../shared/components/layout'
import { routes } from '../../app/routeMap'
import { Button, Outro } from '../../shared/components/ui'
import { COMPANIES, HOW, RULES } from './employerReviews.data'
import { EmployerReviewCard } from './EmployerReviewCard'
import styles from './EmployerReviewsPage.module.css'

const INVITE = routes.invite

export function EmployerReviewsPage() {
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eyebrow}>
            <span className={styles.live} />
            Employer Reviews
          </div>
          <h1>
            Is your workplace <em>actually safe?</em>
          </h1>
          <p className={styles.lead}>
            Anonymous reviews of Lisbon companies by LGBTQ+ employees. Beyond the Pride
            logo — what it's actually like to be out there, behind closed office doors.
          </p>
        </div>
      </header>

      <section className={styles.howSection}>
        <div className="wrap">
          <div className={styles.secHead}>
            <div>
              <h2>
                How it <em>works</em>
              </h2>
              <div className={styles.sub}>
                Anonymous, verified by membership, not editable by employers.
              </div>
            </div>
          </div>
          <div className={styles.howGrid}>
            {HOW.map((h) => (
              <div className={styles.howItem} key={h.n}>
                <div className={styles.howN}>{h.n}</div>
                <div className={styles.howTitle}>{h.title}</div>
                <div className={styles.howDesc}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.reviewsSection}>
        <div className="wrap">
          <div className={styles.secHead}>
            <div>
              <h2>
                Recent <em>reviews</em>
              </h2>
              <div className={styles.sub}>
                Member-written · anonymous · updated continuously
              </div>
            </div>
            <div className={styles.secActions}>
              <Button to={routes.jobs} variant="ghost">
                Browse queer-inclusive jobs →
              </Button>
              <Button href="#write" variant="ghost">
                Write a review →
              </Button>
            </div>
          </div>
          <div className={styles.companyGrid}>
            {COMPANIES.map((c) => (
              <EmployerReviewCard company={c} key={c.name} />
            ))}
          </div>

          <div className={styles.writeBox} id="write">
            <div>
              <h2>
                Write a <em>review.</em>
              </h2>
              <p>
                You've been there. You know what it was actually like. Your review helps
                the next queer person decide whether to take that interview. It takes 5
                minutes and is completely anonymous.
              </p>
              <Button to={INVITE} variant="primary" className={styles.writeBtn}>
                Write a review →
              </Button>
              <div className={styles.writeNote}>
                Members only · anonymous · your identity is never stored with your review
              </div>
            </div>
            <div className={styles.writeRules}>
              <div className={styles.rulesTitle}>Our review principles</div>
              {RULES.map((r) => (
                <div className={styles.rule} key={r}>
                  <div className={styles.ruleDot} />
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Outro
        title={<>Your work <em>matters.</em></>}
        sub="You deserve to know what you're walking into. So does everyone else."
      >
        <Button to={INVITE} variant="primary" size="lg">
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  )
}
