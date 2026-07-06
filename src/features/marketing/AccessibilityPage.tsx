import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, HubBackLink, Outro } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { VENUES } from "./accessibility.data";
import {
  AccessibleSpacesSection,
  CommitmentsSection,
  ResourcesSection,
} from "./AccessibilitySections";
import { AccommodationsModal, FlagVenueModal } from "./AccessibilityModals";
import styles from "./AccessibilityPage.module.css";

const INVITE = routes.requestInvite;

export function AccessibilityPage() {
  const { showToast } = useToast();
  const loading = useSimulatedLoad();
  const [filter, setFilter] = useState("all");
  const [flagVenue, setFlagVenue] = useState<string | null>(null);
  const [accomOpen, setAccomOpen] = useState(false);

  const venues = VENUES.filter(
    (v) => filter === "all" || v.featureTags.includes(filter),
  );

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <HubBackLink to={routes.help} label="Help & FAQ" />
          <div className={styles.cat}>Disability &amp; Accessibility</div>
          <h1>
            Accessible. <em>Genuinely.</em>
          </h1>
          <p className={styles.heroSub}>
            We don't want disability to be a footnote. This page is for disabled
            and chronically ill members — practical, honest information about
            accessible spaces, what QueerPulse commits to, and community
            support.
          </p>
          <div className={styles.heroActions}>
            <Button
              type="button"
              variant="primary"
              onClick={() => setAccomOpen(true)}
            >
              Request event accommodations
            </Button>
            <Button href="#spaces" variant="ghost">
              Accessible spaces directory ↓
            </Button>
          </div>
          <div className={styles.heroNote}>
            <span className={styles.dot} />
            Venue information reviewed by disabled community members · updated
            quarterly
          </div>
        </div>
      </div>

      <AccessibleSpacesSection
        loading={loading}
        filter={filter}
        setFilter={setFilter}
        venues={venues}
        onFlag={setFlagVenue}
      />

      <CommitmentsSection onRequestAccom={() => setAccomOpen(true)} />

      <ResourcesSection showToast={showToast} />

      <Outro
        title={
          <>
            You belong <em>here</em> — fully.
          </>
        }
        sub="Not as an afterthought. Not with a separate entrance. As a full member of this community."
      >
        <Button to={INVITE} variant="primary" size="lg">
          Join QueerPulse
        </Button>
      </Outro>

      {flagVenue !== null && (
        <FlagVenueModal venue={flagVenue} onClose={() => setFlagVenue(null)} />
      )}
      {accomOpen && <AccommodationsModal onClose={() => setAccomOpen(false)} />}
    </PageShell>
  );
}
