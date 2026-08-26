import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import {
  StatusHero,
  ServicesGrid,
  UptimeSection,
  IncidentsSection,
  SubscribeStrip,
} from "./StatusComponents";
import { StatusLive } from "./StatusLive";

/**
 * `/system/status` — the one page that has to answer while the platform does
 * not.
 *
 * QueerPulse delivers no email, so a member who cannot sign in has no channel
 * that can reach them: without this page, "the platform is down", "I have been
 * suspended" and "my account is broken" are one indistinguishable silence.
 * The route is deliberately absent from `GATED_PATTERNS` in `authGate.ts`, so
 * it renders for a signed-out visitor and for a suspended or locked-out member
 * alike, and the endpoint behind it (`GET /status`) is unauthenticated too.
 *
 * DEMO vs LIVE. The demo build has no backend to probe, and its fabricated
 * 90-day uptime chart and postmortem history exist to show the shape of the
 * page, so that path is unchanged. LIVE mode used to collapse all four sections
 * into a "coming soon" empty state; it now renders `StatusLive`, fed by the
 * real endpoint.
 *
 * `SubscribeStrip` stays demo-only, and permanently. It offers "one email when
 * something breaks, one when it's fixed", and this platform delivers no email
 * and never will — there is nothing to wire it to. The live answer to "tell me
 * when it's back" is this page plus the poll and refresh control inside
 * `StatusLive`.
 */
export function StatusPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  return (
    <PageShell>
      <StatusHero />
      {demoMode ? (
        <>
          <ServicesGrid />
          <UptimeSection />
          <IncidentsSection />
          <SubscribeStrip />
        </>
      ) : (
        <StatusLive />
      )}

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
        <Button size="lg" to={requestInvitePath("status")}>
          {t("system:status.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
