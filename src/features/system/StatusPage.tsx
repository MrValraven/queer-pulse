import { PageShell } from '../../shared/components/layout'
import { Button, Reveal } from '../../shared/components/ui'
import { linkToPath } from '../../app/routeMap'
import {
  StatusHero,
  ServicesGrid,
  UptimeSection,
  IncidentsSection,
  SubscribeStrip,
} from './StatusComponents'
import styles from './StatusComponents.module.css'

export function StatusPage() {
  return (
    <PageShell>
      <StatusHero />
      <ServicesGrid />
      <UptimeSection />
      <IncidentsSection />
      <SubscribeStrip />

      <section className={styles.outro}>
        <div className="wrap">
          <Reveal as="h2">
            A queer network.
            <br />
            <em>Rooted in Lisbon.</em>
          </Reveal>
          <Reveal as="p" delay={80} className={styles.outroSub}>
            Invite-only. Community-owned. Built to last.
          </Reveal>
          <Reveal delay={140}>
            <Button size="lg" to={linkToPath('QueerPulse Invite.html')}>
              Request an invite
            </Button>
          </Reveal>
        </div>
      </section>
    </PageShell>
  )
}
