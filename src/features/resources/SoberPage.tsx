import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import styles from "./SoberPage.module.css";
import { Button, Outro } from "../../shared/components/ui";
import { ResourceHero } from "./ResourceHero";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  PageMeta,
  JsonLd,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { REASON_KEYS } from "./soberPage.data";
import {
  SoberHonestSection,
  SoberVenuesSection,
  SoberVoicesSection,
  SoberRecoverySection,
} from "./SoberSections";
import { SoberGatheringsSection } from "./SoberGatheringsSection";
import { SoberHostModal } from "./SoberHostModal";

const SAFE_SPACES = routes.safeSpaces;
const COMMUNITIES = routes.communities;
const WELLBEING = routes.wellbeing;
const MENTORSHIP = routes.mentorship;
const RESOURCES = routes.resources;

const LINK_MAP: Record<string, string> = {
  COMMUNITIES,
  WELLBEING,
  MENTORSHIP,
  RESOURCES,
};

export function SoberPage() {
  const { t } = useTranslation();
  const [hostOpen, setHostOpen] = useState(false);
  const { demoMode } = useDemoMode();
  const pageTitle = t(
    demoMode ? "resources:sober.meta.title" : "resources:sober.meta.titleLive",
  );
  const pageDescription = t(
    demoMode
      ? "resources:sober.meta.description"
      : "resources:sober.meta.descriptionLive",
  );

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildMedicalWebPageSchema({
          name: pageTitle,
          description: pageDescription,
          path: "/resources/sober",
        })}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/sober" },
        ])}
      />
      <ResourceHero
        tone="light"
        backLink={{
          to: routes.wellbeing,
          label: t("resources:sober.hero.backLink"),
          tone: "light",
        }}
        eyebrowVariant="label"
        eyebrowColor="var(--jade)"
        eyebrow={t("resources:sober.hero.eyebrow")}
        titleWeight="light"
        titleEmColor="var(--jade)"
        title={
          <Translation
            i18nKey="resources:sober.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:sober.hero.lead")}
        extras={
          <div className={styles.reasons}>
            {REASON_KEYS.map((reasonKey) => (
              <span key={reasonKey} className={styles.reason}>
                {t(reasonKey)}
              </span>
            ))}
          </div>
        }
      />

      <SoberHonestSection />

      <SoberGatheringsSection onHost={() => setHostOpen(true)} />

      {demoMode && <SoberVenuesSection safeSpacesPath={SAFE_SPACES} />}
      {demoMode && <SoberVoicesSection />}
      <SoberRecoverySection linkMap={LINK_MAP} />

      <Outro
        title={
          <Translation
            i18nKey="resources:sober.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:sober.outro.sub")}
      >
        <Button to={SAFE_SPACES} variant="primary" size="lg">
          {t("resources:sober.outro.findSpacesCta")}
        </Button>
        <Button to={COMMUNITIES} variant="ghost-dark" size="lg">
          {t("resources:sober.outro.browseCommunitiesCta")}
        </Button>
      </Outro>

      {hostOpen && <SoberHostModal onClose={() => setHostOpen(false)} />}
    </PageShell>
  );
}
