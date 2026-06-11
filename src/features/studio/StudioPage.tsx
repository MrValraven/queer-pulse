import { StudioShell } from "./StudioShell";
import {
  StudioHero,
  StudioSetSection,
  StudioTracksSection,
} from "./StudioPageSections";

export function StudioPage() {
  return (
    <StudioShell>
      <StudioHero />
      <StudioSetSection />
      <StudioTracksSection />
    </StudioShell>
  );
}
