import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { FeatureHelp, Reveal, SubpageIndex } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { routes } from "../../app/routeMap";
import { NAV, GOVERNING_DOCS } from "./governance.data";
import {
  CouncilSection,
  DecisionsSection,
  FinancesSection,
  HealthSection,
  ModerationSection,
  PrinciplesSection,
  RaiseSection,
} from "./GovernanceSections";
import { ProposalsSection } from "./GovernanceProposals";
import styles from "./GovernancePage.module.css";

export function GovernancePage() {
  const { t } = useTranslation();
  const pageTitle = t("governance:page.meta.title");
  const pageDescription = t("governance:page.meta.description");
  const [active, setActive] = useState("health");
  const governingDocs = useMemo(
    () =>
      GOVERNING_DOCS.map((doc) => ({
        label: t(doc.labelKey),
        to: doc.to,
        blurb: t(doc.blurbKey),
      })),
    [t],
  );

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 140;
      for (const { id } of NAV) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y && el.offsetTop + el.offsetHeight > y) {
          setActive(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.governance },
        ])}
      />
      <section className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            {t("governance:page.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            <Translation
              i18nKey="governance:page.hero.title"
              components={{ em: <em /> }}
            />{" "}
            <FeatureHelp id="governance.hub" />
          </Reveal>
          <Reveal as="p" delay={120}>
            {t("governance:page.hero.lead")}
          </Reveal>
        </div>
      </section>

      <section className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <Reveal as="nav" className={styles.nav}>
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={[
                    styles.navItem,
                    active === item.id && styles.navItemActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {t(item.labelKey)}
                </a>
              ))}
            </Reveal>

            <div className={styles.content}>
              <HealthSection />
              <ModerationSection />
              <CouncilSection />
              <PrinciplesSection />
              <FinancesSection />
              <ProposalsSection />
              <DecisionsSection />
              <RaiseSection />
            </div>
          </div>
        </div>
      </section>

      <SubpageIndex
        eyebrow={t("governance:subpageIndex.eyebrow")}
        title={t("governance:subpageIndex.title")}
        items={governingDocs}
      />
    </PageShell>
  );
}
