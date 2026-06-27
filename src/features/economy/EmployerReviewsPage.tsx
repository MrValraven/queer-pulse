import { useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { routes } from '../../app/routeMap'
import { Button, FadeIn, Outro } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { FiShield } from 'react-icons/fi'
import { COMPANIES, HOW, RULES, VERIFY, type Company } from './employerReviews.data'
import { EmployerReviewCard } from './EmployerReviewCard'
import { EmployerReviewSkeleton } from './EmployerReviewSkeleton'
import { WriteReviewModal, type SubmittedReview } from './WriteReviewModal'
import styles from './EmployerReviewsPage.module.css'

const INVITE = routes.requestInvite

export function EmployerReviewsPage() {
  const loading = useSimulatedLoad()
  const [companies, setCompanies] = useState<Company[]>(COMPANIES)
  // null = closed; string = open, pre-selecting that company; '' = open, no preselect.
  const [writeFor, setWriteFor] = useState<string | null>(null)

  const addReview = ({ companyName, review }: SubmittedReview) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.name === companyName
          ? { ...c, reviews: [review, ...c.reviews], reviewCount: c.reviewCount + 1 }
          : c,
      ),
    )
  }

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
              <Button variant="ghost" onClick={() => setWriteFor('')}>
                Write a review →
              </Button>
            </div>
          </div>
          <div className={styles.companyGrid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <EmployerReviewSkeleton key={i} />)
              : companies.map((c, i) => (
                  <FadeIn key={c.name} delay={Math.min(i, 8) * 60}>
                    <EmployerReviewCard
                      company={c}
                      onWriteReview={() => setWriteFor(c.name)}
                    />
                  </FadeIn>
                ))}
          </div>

          <div className={styles.verifyBox}>
            <div className={styles.verifyHead}>
              <span className={styles.verifyIcon} aria-hidden>
                <FiShield />
              </span>
              <h3>
                How <em>verification</em> works
              </h3>
            </div>
            <div className={styles.verifyGrid}>
              {VERIFY.map((v) => (
                <div className={styles.verifyItem} key={v.label}>
                  <div className={styles.verifyLabel}>{v.label}</div>
                  <div className={styles.verifyDesc}>{v.desc}</div>
                </div>
              ))}
            </div>
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
              <Button
                variant="primary"
                className={styles.writeBtn}
                onClick={() => setWriteFor('')}
              >
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

      {writeFor !== null && (
        <WriteReviewModal
          companies={companies}
          initialCompany={writeFor || undefined}
          onClose={() => setWriteFor(null)}
          onSubmit={addReview}
        />
      )}
    </PageShell>
  )
}
