import { useRef, useState } from "react";
import { FiStar } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import {
  ARRIVING,
  FORUM,
  GROUND,
  LAWYERS,
  ROUTES,
  TABS,
  type TabId,
} from "./visas.data";
import { VisasTabContent } from "./VisasTabContent";
import styles from "./VisasPage.module.css";

export function VisasPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState<TabId>("eu");
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const tabNavRef = useRef<HTMLDivElement>(null);

  const selectRoute = (index: number, tabId: TabId) => {
    setSelectedRoute(index);
    setActive(tabId);
    const el = tabNavRef.current;
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: "smooth",
      });
    }
  };

  const activeTab =
    TABS.find((candidate) => candidate.id === active) ?? TABS[0]!;

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            {t("marketing:visas.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            <Translation
              i18nKey="marketing:visas.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.heroSub} delay={120}>
            {t("marketing:visas.hero.sub")}
          </Reveal>
          <Reveal className={styles.heroNote} delay={160}>
            <span className={styles.heroNoteDot} />
            {t("marketing:visas.hero.note")}
          </Reveal>
        </div>
      </div>

      <section className={styles.routeSection}>
        <div className="wrap">
          <Reveal as="div" className={styles.routeLabel}>
            <Translation
              i18nKey="marketing:visas.routePicker.label"
              components={{ em: <em /> }}
            />
          </Reveal>
          <div className={styles.routeGrid}>
            {ROUTES.map((route, index) => (
              <Reveal
                key={route.nameKey}
                as="button"
                type="button"
                className={[
                  styles.routeCard,
                  selectedRoute === index && styles.routeSel,
                ]
                  .filter(Boolean)
                  .join(" ")}
                delay={index * 60}
                onClick={() => selectRoute(index, route.tab)}
              >
                <div className={styles.rcName}>{t(route.nameKey)}</div>
                <div className={styles.rcDesc}>{t(route.descKey)}</div>
                <div className={styles.rcTo}>{t(route.ctaKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.tabNav} ref={tabNavRef}>
        <div className={styles.tabNavInner}>
          {TABS.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className={[
                styles.tabBtn,
                active === candidate.id && styles.tabBtnActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActive(candidate.id)}
            >
              {t(candidate.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <VisasTabContent
        tab={activeTab}
        onPartnerLink={() => setActive("partner")}
      />

      <section className={styles.groundSec}>
        <div className="wrap">
          <Reveal className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="marketing:visas.ground.title"
                components={{ em: <em /> }}
              />
            </h2>
            <div className={styles.secHeadSub}>
              {t("marketing:visas.ground.sub")}
            </div>
          </Reveal>
          <div className={styles.groundGrid}>
            {GROUND.map((ground, index) => (
              <Reveal
                className={styles.groundCard}
                key={ground.titleKey}
                delay={index * 55}
              >
                <div className={styles.gcLabel}>{t(ground.labelKey)}</div>
                <div className={styles.gcTitle}>{t(ground.titleKey)}</div>
                <div className={styles.gcBody}>{t(ground.bodyKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.lawyerSec}>
        <div className="wrap">
          <Reveal className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="marketing:visas.lawyers.title"
                components={{ em: <em /> }}
              />
            </h2>
          </Reveal>
          <div className={styles.reviewGrid}>
            {LAWYERS.map((lawyer, index) => (
              <Reveal
                className={styles.reviewCard}
                key={lawyer.name}
                delay={index * 60}
              >
                <div className={styles.rvTop}>
                  <div
                    className={styles.rvAv}
                    style={{ background: lawyer.bg, color: lawyer.color }}
                  >
                    {lawyer.initials}
                  </div>
                  <div>
                    <div className={styles.rvName}>{lawyer.name}</div>
                    <div className={styles.rvContext}>{lawyer.context}</div>
                  </div>
                </div>
                <div className={styles.rvStars}>
                  {[1, 2, 3, 4, 5].map((starPosition) => (
                    <FiStar
                      key={starPosition}
                      className={
                        starPosition <= lawyer.stars
                          ? styles.rvStarOn
                          : undefined
                      }
                    />
                  ))}
                </div>
                <div className={styles.rvQuote}>{lawyer.quote}</div>
              </Reveal>
            ))}
          </div>
          <Reveal className={styles.lawyerCta} delay={60}>
            <Button to={FORUM} variant="ghost">
              {t("marketing:visas.lawyers.forumCta")}
            </Button>
          </Reveal>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="marketing:visas.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:visas.outro.sub")}
      >
        <Button to={ARRIVING} variant="primary" size="lg">
          {t("marketing:visas.outro.settlingCta")}
        </Button>
        <Button to={FORUM} variant="ghost-dark" size="lg">
          {t("marketing:visas.outro.askCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
