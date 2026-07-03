import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { CinemaShell } from "./CinemaShell";
import {
  AboutHero,
  CuratorsCouncil,
  Governance,
  Principles,
  SplitVisual,
  TheDeed,
} from "./CinemaAboutSections";

export function CinemaAboutPage() {
  return (
    <CinemaShell>
      <AboutHero />
      <TheDeed />
      <Principles />
      <SplitVisual />
      <CuratorsCouncil />
      <Governance />

      <Outro
        title={
          <>
            Sustain <em>the room</em>.
          </>
        }
        sub="€7/mo. Cancel any time. Every sustainer keeps the door open."
      >
        <Button size="lg" to={routes.cinemaMembership}>
          Become a sustainer
        </Button>
      </Outro>
    </CinemaShell>
  );
}
