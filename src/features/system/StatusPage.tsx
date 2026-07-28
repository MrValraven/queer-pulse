import { FiActivity } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  StatusHero,
  ServicesGrid,
  UptimeSection,
  IncidentsSection,
  SubscribeStrip,
} from "./StatusComponents";

export function StatusPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  // The service-health grid, 90-day uptime chart and incident history are all
  // fabricated demo fixtures — there is no live status/health backend yet. In
  // live mode we show an honest "coming soon" state in their place.
  return (
    <PageShell>
      <StatusHero />
      {demoMode ? (
        <>
          <ServicesGrid />
          <UptimeSection />
          <IncidentsSection />
        </>
      ) : (
        <section className="wrap" style={{ padding: "60px 0" }}>
          <EmptyState
            icon={<FiActivity />}
            title={t("system:status.live.title")}
            description={t("system:status.live.description")}
          />
        </section>
      )}
      <SubscribeStrip />

      <Outro
        title={
          <>
            {t("system:status.outro.line1")}
            <br />
            <Translation
              i18nKey="system:status.outro.line2"
              components={{ em: <em /> }}
            />
          </>
        }
        sub={t("system:status.outro.sub")}
      >
        <Button size="lg" to={routes.requestInvite}>
          {t("system:status.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
