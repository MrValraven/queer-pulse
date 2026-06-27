import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { useToast } from '../../shared/components/feedback/useToast'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { AgendaSection, VoteSection, AttendCard, PastAssembliesSection } from './AnnualAssemblySections'
import styles from './AnnualAssemblyPage.module.css'

export function AnnualAssemblyPage() {
  const { showToast } = useToast()
  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Annual Assembly · 14 November 2026 · Lisbon</div>
          <h1 className={styles.h1}>
            Two days, eleven <em>resolutions.</em>
          </h1>
          <p className={styles.dek}>
            QueerPulse's binding annual gathering. Where the manifesto gets revised, the budget gets approved,
            and any decision that can't be made by a circle goes to a member vote.{' '}
            <em>You can attend in person, online, or just read the minutes after</em> — but your vote counts the same.
          </p>
          <div className={styles.meta}>
            <span><b>14 — 15 Nov</b>Two days · Sat &amp; Sun</span>
            <span><b><em>Atelier Pulso</em></b>+ video link</span>
            <span><b>1,847</b>Members eligible to vote</span>
            <span><b><em>184</em></b>Quorum · met</span>
          </div>
          <div className={styles.ctaRow}>
            <Button href="#vote" variant="primary">Vote now · 11 resolutions</Button>
            <Button type="button" variant="ghost-dark" onClick={() => showToast('RSVP saved', 'success')}>RSVP in-person · 87 / 120 spots</Button>
            <Button type="button" variant="ghost-dark" onClick={() => showToast('Opening Zoom link…', 'info')}>Join online · Zoom link</Button>
          </div>
        </div>
      </section>

      <div className={styles.page}>
        <AgendaSection />
        <VoteSection />
        <AttendCard />
        <PastAssembliesSection />
        <div className={styles.footer}>
          Questions about your eligibility? <Link to={routes.help}>Help →</Link> · Want to submit a member proposal for next year? <Link to={routes.contact}>Write to us</Link>.
        </div>
      </div>
    </PageShell>
  )
}
