import { useRef } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, FeatureHelp, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { routes } from "../../app/routeMap";
import { useSafeSpaces } from "./api/useSafeSpaces";
import {
  BadgeExplainer,
  HowSection,
  NominateSection,
  RemovedSection,
} from "./SafeSpacesSections";
import styles from "./SafeSpacesPage.module.css";

export function SafeSpacesPage() {
  const { t } = useTranslation();
  const { removed, stats } = useSafeSpaces();
  const nomRef = useRef<HTMLDivElement>(null);

  const scrollToNominate = () =>
    nomRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  const pageTitle = t("safety:spaces.meta.title");
  const pageDescription = t("safety:spaces.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: routes.resources },
          { name: pageTitle, path: routes.safeSpaces },
        ])}
      />
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>{t("safety:spaces.hero.category")}</div>
          <h1>
            <Translation
              i18nKey="safety:spaces.hero.title"
              components={{ em: <em /> }}
            />{" "}
            <FeatureHelp id="safety.hub" />
          </h1>
          <p className={styles.lead}>{t("safety:spaces.hero.lead")}</p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.n}>{stats.verified}</div>
              <div className={styles.l}>
                {t("safety:spaces.hero.stat.verified")}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.n}>{stats.reviews}</div>
              <div className={styles.l}>
                {t("safety:spaces.hero.stat.reviews")}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.n}>{stats.removed}</div>
              <div className={styles.l}>
                {t("safety:spaces.hero.stat.removed")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BadgeExplainer />

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.dirHead}>
            <div>
              <h2>
                <Translation
                  i18nKey="safety:spaces.dir.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <div className={styles.dirUpdated}>
                {t("safety:spaces.dir.updated")}
              </div>
            </div>
          </div>

          <div className={styles.browseCta}>
            <p className={styles.browseCtaLead}>
              {t("safety:spaces.dir.browseLead")}
            </p>
            <div className={styles.browseCtaActions}>
              <Button
                to={`${routes.directory}?safe=verified`}
                variant="primary"
                size="lg"
              >
                {t("safety:spaces.dir.browseCta")}
              </Button>
              <Button variant="ghost" size="lg" onClick={scrollToNominate}>
                {t("safety:spaces.dir.nominateCta")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <HowSection />
      <RemovedSection removed={removed} />
      <NominateSection sectionRef={nomRef} />

      <Outro
        title={
          <Translation
            i18nKey="safety:spaces.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("safety:spaces.outro.sub")}
      >
        <Button to={routes.safety} variant="primary" size="lg">
          {t("safety:spaces.outro.safetyCta")}
        </Button>
        <Button to={routes.sober} variant="ghost-dark" size="lg">
          {t("safety:spaces.outro.soberCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
