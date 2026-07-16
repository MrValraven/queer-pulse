import { useMemo } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, SubpageIndex } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { CrisisStrip } from "./CrisisStrip";
import {
  TherapistsSection,
  PeerSupportSection,
  CrisisSection,
  HarmReductionSection,
} from "./WellbeingSections";
import { WELLBEING_SUBPAGES } from "./wellbeing.data";

export function WellbeingPage() {
  const { t } = useTranslation();
  const subpages = useMemo(
    () =>
      WELLBEING_SUBPAGES.map((subpage) => ({
        label: t(subpage.labelKey),
        to: subpage.to,
        blurb: t(subpage.blurbKey),
      })),
    [t],
  );
  const anchors = useMemo(
    () => [
      {
        label: t("resources:wellbeing.hero.anchor.therapists"),
        href: "#therapists",
      },
      {
        label: t("resources:wellbeing.hero.anchor.peerSupport"),
        href: "#peer-support",
      },
      {
        label: t("resources:wellbeing.hero.anchor.crisis"),
        href: "#crisis",
      },
      {
        label: t("resources:wellbeing.hero.anchor.harmReduction"),
        href: "#harm-reduction",
      },
    ],
    [t],
  );
  return (
    <PageShell>
      <ResourceHero
        eyebrow={t("resources:wellbeing.hero.eyebrow")}
        eyebrowDotColor="var(--jade)"
        title={
          <Translation
            i18nKey="resources:wellbeing.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:wellbeing.hero.lead")}
        anchors={anchors}
      />

      <CrisisStrip />

      <TherapistsSection />
      <PeerSupportSection />
      <CrisisSection />
      <HarmReductionSection />

      <Outro
        title={
          <Translation
            i18nKey="resources:wellbeing.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:wellbeing.outro.sub")}
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          {t("resources:wellbeing.outro.cta")}
        </Button>
      </Outro>

      <SubpageIndex
        title={t("resources:wellbeing.subpageIndex.title")}
        items={subpages}
      />
    </PageShell>
  );
}
