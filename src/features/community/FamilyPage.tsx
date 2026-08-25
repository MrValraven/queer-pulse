import { useId, useRef, useState } from "react";
import { FiArrowRight, FiCompass } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  FadeIn,
  Outro,
  Tabs,
  tabPanelProps,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { INVITE, SITUATIONS, TABS, type TabId } from "./family.data";
import { FamilyTabContent } from "./FamilyTabContent";
import { FamilyTalkSection } from "./FamilyTalkSection";
import { ParentNetwork } from "./ParentNetwork";
import styles from "./FamilyPage.module.css";

export function FamilyPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState<TabId>("adoption");
  const [selectedSit, setSelectedSit] = useState<number | null>(null);
  // Low-pressure entry: this is a sensitive topic, so picking a situation is
  // always optional. "Just exploring" lets people read everything without
  // declaring anything about themselves.
  const [isExploring, setIsExploring] = useState(false);
  const tabNavRef = useRef<HTMLDivElement>(null);
  const tabsId = useId();

  const scrollToTabs = () => {
    const el = tabNavRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const selectSituation = (index: number, tab: TabId) => {
    setSelectedSit(index);
    setIsExploring(false);
    setActive(tab);
    scrollToTabs();
  };

  const browseFreely = () => {
    setIsExploring(true);
    setSelectedSit(null);
    scrollToTabs();
  };

  const tab = TABS.find((t) => t.id === active) ?? TABS[0]!;

  return (
    <PageShell>
      <header className={styles.hero} data-plum>
        <div className="wrap">
          <div className={styles.cat}>{t("community:family.hero.cat")}</div>
          <h1>
            <Translation
              i18nKey="community:family.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.heroSub}>{t("community:family.hero.sub")}</p>
          <div className={styles.legalNote}>
            <span className={styles.legalDot} />
            {t("community:family.hero.legalNote")}
          </div>
        </div>
      </header>

      <section className={styles.sitSection}>
        <div className="wrap">
          <div className={styles.sitLabelRow}>
            <h2>
              <Translation
                i18nKey="community:family.situations.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("community:family.situations.lead")}</p>
          </div>
          <div className={styles.sitGrid}>
            {SITUATIONS.map((s, i) => (
              <button
                key={s.nameKey}
                type="button"
                className={[styles.sitCard, selectedSit === i && styles.sitSel]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={selectedSit === i}
                onClick={() => selectSituation(i, s.tab)}
              >
                <div className={styles.sitName}>
                  {t(`community:${s.nameKey}`)}
                </div>
                <div className={styles.sitDesc}>
                  {t(`community:${s.descriptionKey}`)}
                </div>
                <div className={styles.sitTo}>
                  {t(`community:${s.toKey}`)} <FiArrowRight aria-hidden />
                </div>
              </button>
            ))}
          </div>
          <div className={styles.browseRow}>
            <button
              type="button"
              className={[
                styles.browseBtn,
                isExploring && styles.browseBtnActive,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isExploring}
              onClick={browseFreely}
            >
              <FiCompass aria-hidden />
              {t("community:family.browseFreely.cta")}
            </button>
          </div>
        </div>
      </section>

      <div className={styles.tabNav} ref={tabNavRef}>
        <div className={styles.tabNavInner}>
          <Tabs
            className={styles.familyTabs}
            idPrefix={tabsId}
            label={t("community:family.tabs.label")}
            variant="underline"
            tabs={TABS.map((tabOption) => ({
              id: tabOption.id,
              label: t(`community:${tabOption.labelKey}`),
            }))}
            active={active}
            onChange={(id) => setActive(id as TabId)}
          />
        </div>
      </div>

      <FadeIn key={active}>
        <div {...tabPanelProps(tabsId, active)}>
          <FamilyTabContent tab={tab} />
        </div>
      </FadeIn>

      <FamilyTalkSection />

      <ParentNetwork />

      <Outro
        title={
          <Translation
            i18nKey="community:family.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("community:family.outro.sub")}
      >
        <Button to={INVITE} variant="primary" size="lg">
          {t("community:family.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
