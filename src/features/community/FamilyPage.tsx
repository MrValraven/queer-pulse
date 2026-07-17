import { useRef, useState } from "react";
import { FiCompass } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn, Outro } from "../../shared/components/ui";
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
  const [exploring, setExploring] = useState(false);
  const tabNavRef = useRef<HTMLDivElement>(null);

  const scrollToTabs = () => {
    const el = tabNavRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const selectSituation = (index: number, tab: TabId) => {
    setSelectedSit(index);
    setExploring(false);
    setActive(tab);
    scrollToTabs();
  };

  const browseFreely = () => {
    setExploring(true);
    setSelectedSit(null);
    scrollToTabs();
  };

  const tab = TABS.find((t) => t.id === active) ?? TABS[0]!;

  return (
    <PageShell>
      <div className={styles.hero}>
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
      </div>

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
                onClick={() => selectSituation(i, s.tab)}
              >
                <div className={styles.sitName}>
                  {t(`community:${s.nameKey}`)}
                </div>
                <div className={styles.sitDesc}>
                  {t(`community:${s.descKey}`)}
                </div>
                <div className={styles.sitTo}>{t(`community:${s.toKey}`)}</div>
              </button>
            ))}
          </div>
          <div className={styles.browseRow}>
            <button
              type="button"
              className={[styles.browseBtn, exploring && styles.browseBtnActive]
                .filter(Boolean)
                .join(" ")}
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
          {TABS.map((tabOption) => (
            <button
              key={tabOption.id}
              type="button"
              className={[
                styles.tabBtn,
                active === tabOption.id && styles.tabBtnActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActive(tabOption.id)}
            >
              {t(`community:${tabOption.labelKey}`)}
            </button>
          ))}
        </div>
      </div>

      <FadeIn key={active}>
        <FamilyTabContent tab={tab} />
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
