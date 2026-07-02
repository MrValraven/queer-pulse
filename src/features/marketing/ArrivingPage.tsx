import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import {
  NeighbourhoodsSection,
  HealthSection,
  HousingSection,
  OrgsSection,
  FirstStepSection,
  CommQuickSection,
} from "./ArrivingSections";
import styles from "./ArrivingPage.module.css";

export function ArrivingPage() {
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            New to Lisbon
          </Reveal>
          <Reveal as="h1" delay={60}>
            Queer and new to Lisbon? <em>Welcome.</em>
          </Reveal>
          <Reveal as="p" delay={120}>
            This city has a lot for us — a real, rooted queer community,
            welcoming neighbourhoods, organisations doing serious work, and
            people who will genuinely help you settle in. Here's what to know
            first.
          </Reveal>
        </div>
      </div>

      <NeighbourhoodsSection />
      <HealthSection />
      <HousingSection />
      <OrgsSection />
      <FirstStepSection />
      <CommQuickSection />

      <Outro
        title={
          <>
            Ready to meet <em>the community?</em>
          </>
        }
        sub="Request an invite to QueerPulse and get access to the full network — members, gatherings, board, and everything else on this page."
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          Request an invite →
        </Button>
      </Outro>
    </PageShell>
  );
}
