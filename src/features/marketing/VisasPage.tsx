import { useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import {
  ARRIVING,
  FORUM,
  GROUND,
  ROUTES,
  TABS,
  type TabId,
} from "./visas.data";
import { VisasTabContent } from "./VisasTabContent";
import styles from "./VisasPage.module.css";

export function VisasPage() {
  const { t } = useTranslation();
  const pageTitle = t("marketing:visas.meta.title");
  const pageDescription = t("marketing:visas.meta.description");
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
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          {
            name: t("shared:megaNav.lisbon.title"),
            path: routes.safeSpaces,
          },
          { name: pageTitle, path: routes.visas },
        ])}
      />
      <PageHero
        eyebrow={t("marketing:visas.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:visas.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:visas.hero.sub")}
      >
        <div className={styles.heroNote}>
          <span className={styles.heroNoteDot} />
          {t("marketing:visas.hero.note")}
        </div>
      </PageHero>

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
                <div className={styles.rcTo}>
                  {t(route.ctaKey)} <FiArrowRight aria-hidden />
                </div>
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
          <Reveal className={styles.lawyerEmpty} delay={60}>
            <p>{t("marketing:visas.lawyers.emptyBody")}</p>
            <Button to={FORUM} variant="ghost">
              {t("marketing:visas.lawyers.forumCta")}{" "}
              <FiArrowRight aria-hidden />
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
          {t("marketing:visas.outro.settlingCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
        <Button to={FORUM} variant="ghost-dark" size="lg">
          {t("marketing:visas.outro.askCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
