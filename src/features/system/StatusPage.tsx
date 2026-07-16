import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
