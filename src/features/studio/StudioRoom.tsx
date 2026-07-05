import { StudioShell } from "./StudioShell";
import {
  StudioHero,
  StudioSetSection,
  StudioTracksSection,
} from "./StudioPageSections";

/** The logged-in Studio "This week" room (shown at /studio to members). */
export function StudioRoom() {
  return (
    <StudioShell>
      <StudioHero />
      <StudioSetSection />
      <StudioTracksSection />
    </StudioShell>
  );
}
