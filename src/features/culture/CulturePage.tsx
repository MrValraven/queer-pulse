import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn, FeatureHelp, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  ClubSection,
  CommissionsSection,
  ShowcaseSection,
  RadioIntro,
} from "./CultureSections";
import { CultureRadioPanel } from "./CultureRadioPanel";
import { SubmitWorkModal } from "./CultureFormModals";
import { TABS, type TabKey } from "./culture.data";
import styles from "./CulturePage.module.css";

export function CulturePage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [tab, setTab] = useState<TabKey>("club");
  const [submitOpen, setSubmitOpen] = useState(false);

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>{t("culture:hero.eyebrow")}</div>
          <h1 className={styles.heroH}>
            <Translation
              i18nKey="culture:hero.title"
              components={{ em: <em /> }}
            />{" "}
            <FeatureHelp id="culture.hub" />
          </h1>
          <p className={styles.lead}>{t("culture:hero.lead")}</p>
          <div className={styles.tabs} role="tablist">
            {TABS.map((tabItem) => (
              <button
                type="button"
                key={tabItem.key}
                role="tab"
                aria-selected={tab === tabItem.key}
                className={`${styles.tab} ${tab === tabItem.key ? styles.tabActive : ""}`}
                onClick={() => setTab(tabItem.key)}
              >
                {t(tabItem.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <div className="wrap">
          <FadeIn key={tab}>
            {tab === "club" && <ClubSection />}
            {tab === "commission" && <CommissionsSection />}
            {tab === "showcase" && <ShowcaseSection />}
            {tab === "radio" && <RadioIntro />}
          </FadeIn>
        </div>
      </div>

      {tab === "radio" && demoMode && <CultureRadioPanel />}

      <Outro
        title={
          <Translation
            i18nKey="culture:outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("culture:outro.sub")}
      >
        <Button size="lg" onClick={() => setSubmitOpen(true)}>
          {t("culture:outro.submitWorkCta")}
        </Button>
        <Button size="lg" variant="ghost-dark" to={routes.communities}>
          {t("culture:outro.exploreCommunitiesCta")}
        </Button>
      </Outro>

      {submitOpen && <SubmitWorkModal onClose={() => setSubmitOpen(false)} />}
    </PageShell>
  );
}
