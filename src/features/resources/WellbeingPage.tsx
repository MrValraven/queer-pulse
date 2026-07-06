import { PageShell } from "../../shared/components/layout";
import { Button, Outro, SubpageIndex } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { CrisisStrip } from "./CrisisStrip";
import {
  TherapistsSection,
  PeerSupportSection,
  CrisisSection,
  HarmReductionSection,
} from "./WellbeingSections";
import { WELLBEING_SUBPAGES } from "./wellbeing.data";

export function WellbeingPage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Wellbeing"
        eyebrowDotColor="var(--jade)"
        title={
          <>
            A room that <em>looks after you.</em>
          </>
        }
        lead="Resources built by and for the community — therapists, peer support, crisis help, and harm reduction. This is what a professional network looks like when it takes care seriously."
        anchors={[
          { label: "Therapist directory", href: "#therapists" },
          { label: "Peer support", href: "#peer-support" },
          { label: "Crisis resources", href: "#crisis" },
          { label: "Harm reduction", href: "#harm-reduction" },
        ]}
      />

      <CrisisStrip />

      <TherapistsSection />
      <PeerSupportSection />
      <CrisisSection />
      <HarmReductionSection />

      <Outro
        title={
          <>
            You belong <em>here.</em>
          </>
        }
        sub="If you're not yet a member, request an invite. If you are, everything above is in the member area — no separate login needed."
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          Request an invite
        </Button>
      </Outro>

      <SubpageIndex title="More wellbeing support" items={WELLBEING_SUBPAGES} />
    </PageShell>
  );
}
