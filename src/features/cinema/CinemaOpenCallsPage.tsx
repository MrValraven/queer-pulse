import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { CinemaShell } from "./CinemaShell";
import { CinemaOpenCallsHero } from "./CinemaOpenCallsHero";
import { CinemaOpenCallsBody } from "./CinemaOpenCallsBody";
import { CinemaOpenCallsHowItWorks } from "./CinemaOpenCallsHowItWorks";

export function CinemaOpenCallsPage() {
  return (
    <CinemaShell>
      <CinemaOpenCallsHero />
      <CinemaOpenCallsBody />
      <CinemaOpenCallsHowItWorks />

      <Outro
        title={
          <>
            Fund the <em>next</em> call.
          </>
        }
        sub="Sustainers fund the commissions. Every new sustainer grows the next season's pool."
      >
        <Button size="lg" to={routes.cinemaMembership}>
          Become a sustainer → €7/mo
        </Button>
      </Outro>
    </CinemaShell>
  );
}
