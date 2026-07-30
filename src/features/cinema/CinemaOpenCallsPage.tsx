import { Button, Outro } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { CinemaComingSoon } from "./CinemaComingSoon";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { CinemaShell } from "./CinemaShell";
import { CinemaOpenCallsHero } from "./CinemaOpenCallsHero";
import { CinemaOpenCallsBody } from "./CinemaOpenCallsBody";
import { CinemaOpenCallsHowItWorks } from "./CinemaOpenCallsHowItWorks";

export function CinemaOpenCallsPage() {
  const { demoMode } = useDemoMode();
  if (!demoMode) return <CinemaComingSoon />;
  return <DemoCinemaOpenCallsPage />;
}

function DemoCinemaOpenCallsPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <CinemaShell>
      <CinemaOpenCallsHero />
      <CinemaOpenCallsBody />
      <CinemaOpenCallsHowItWorks />

      <Outro
        title={
          <Translation
            i18nKey="cinema:openCalls.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("cinema:openCalls.outro.sub")}
      >
        <Button size="lg" to={routes.cinemaMembership}>
          {t("cinema:openCalls.outro.cta", { price: fmt.currency(7) })}
        </Button>
      </Outro>
    </CinemaShell>
  );
}
