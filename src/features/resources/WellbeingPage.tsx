import { useMemo } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, FeatureHelp, Outro, SubpageIndex } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import {
  PageMeta,
  JsonLd,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
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
  const pageTitle = t("resources:wellbeing.meta.title");
  const pageDescription = t("resources:wellbeing.meta.description");
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
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildMedicalWebPageSchema({
          name: pageTitle,
          description: pageDescription,
          path: "/resources/wellbeing",
        })}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/wellbeing" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:wellbeing.hero.eyebrow")}
        eyebrowDotColor="var(--jade)"
        title={
          <>
            <Translation
              i18nKey="resources:wellbeing.hero.title"
              components={{ em: <em /> }}
            />{" "}
            <FeatureHelp id="resources.hub" />
          </>
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
        <Button to={requestInvitePath("wellbeing")} variant="primary" size="lg">
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
