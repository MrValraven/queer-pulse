import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import {
  StatusHero,
  ServicesGrid,
  UptimeSection,
  IncidentsSection,
  SubscribeStrip,
} from "./StatusComponents";

export function StatusPage() {
  return (
    <PageShell>
      <StatusHero />
      <ServicesGrid />
      <UptimeSection />
      <IncidentsSection />
      <SubscribeStrip />

      <Outro
        title={
          <>
            A queer network.
            <br />
            <em>Rooted in Lisbon.</em>
          </>
        }
        sub="Invite-only. Community-owned. Built to last."
      >
        <Button size="lg" to={routes.requestInvite}>
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  );
}
