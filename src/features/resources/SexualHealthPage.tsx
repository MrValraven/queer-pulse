import { useMemo, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Tabs } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { TABS, type TabId } from "./sexualHealth.data";
import { GuidesTab, HivTab, PrepTab, TestingTab } from "./SexualHealthTabs";
import { ResourceHero } from "./ResourceHero";
import { CrisisStrip } from "./CrisisStrip";
import styles from "./SexualHealthPage.module.css";

export function SexualHealthPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabId>("testing");
  const tabs = useMemo(
    () =>
      TABS.map((tabItem) => ({ id: tabItem.id, label: t(tabItem.labelKey) })),
    [t],
  );
  const pageTitle = t("resources:sexualHealth.meta.title");
  const pageDescription = t("resources:sexualHealth.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildMedicalWebPageSchema({
          name: pageTitle,
          description: pageDescription,
          path: "/resources/sexual-health",
        })}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/sexual-health" },
        ])}
      />
      <ResourceHero
        flushBottom
        eyebrowVariant="label"
        eyebrowColor="var(--accent)"
        eyebrow={t("resources:sexualHealth.hero.cat")}
        titleWeight="light"
        title={
          <Translation
            i18nKey="resources:sexualHealth.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:sexualHealth.hero.lead")}
        extras={
          <Tabs
            variant="underline"
            tint="dark"
            tabs={tabs}
            active={tab}
            onChange={(id) => setTab(id as TabId)}
          />
        }
      />

      <CrisisStrip />

      <div className={styles.body}>
        <div className="wrap">
          {tab === "testing" && <TestingTab />}
          {tab === "prep" && <PrepTab />}
          {tab === "hiv" && <HivTab />}
          {tab === "guides" && <GuidesTab />}
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="resources:sexualHealth.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:sexualHealth.outro.sub")}
      >
        <Button to={routes.wellbeing} variant="primary" size="lg">
          {t("resources:sexualHealth.outro.wellbeingCta")}
        </Button>
        <Button to={routes.communities} variant="ghost-dark" size="lg">
          {t("resources:sexualHealth.outro.peerSupportCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
