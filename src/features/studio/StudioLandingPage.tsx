import { StudioLandingShell } from "./StudioLandingShell";
import { StudioLandingHero } from "./StudioLandingHero";
import {
  StudioLandingPromises,
  StudioLandingCounter,
  StudioLandingComparison,
  StudioLandingCta,
} from "./StudioLandingSections";

/** The logged-out marketing landing for QueerPulse Studio, shown at /studio. */
export function StudioLandingPage() {
  return (
    <StudioLandingShell>
      <StudioLandingHero />
      <StudioLandingPromises />
      <StudioLandingCounter />
      <StudioLandingComparison />
      <StudioLandingCta />
    </StudioLandingShell>
  );
}
