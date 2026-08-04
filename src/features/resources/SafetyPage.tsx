import { useMemo } from "react";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  Outro,
  Reveal,
  SubpageIndex,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { routes } from "../../app/routeMap";
import styles from "./SafetyPage.module.css";
import { SAFETY_SUBPAGES } from "./safety.data";
import { ResourceHero } from "./ResourceHero";

export function SafetyPage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:safety.meta.title");
  const pageDescription = t("resources:safety.meta.description");
  const subpages = useMemo(
    () =>
      SAFETY_SUBPAGES.map((item) => ({
        label: t(item.labelKey),
        to: item.to,
        blurb: t(item.blurbKey),
      })),
    [t],
  );

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: routes.resources },
          { name: pageTitle, path: routes.safety },
        ])}
      />
      <ResourceHero
        tone="light"
        eyebrowVariant="label"
        eyebrowColor="var(--accent)"
        eyebrow={t("resources:safety.hero.cat")}
        title={
          <Translation
            i18nKey="resources:safety.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:safety.hero.intro")}
      />

      <div className={styles.content}>
        <Reveal as="section" className={styles.section}>
          <h2>
            <Translation
              i18nKey="resources:safety.visibility.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("resources:safety.visibility.body")}</p>
          <div className={styles.visCards}>
            <div className={`${styles.visCard} ${styles.viOpen}`}>
              <div className={styles.visIcon}>
                <div className={styles.dot} />
              </div>
              <div>
                <h3>{t("resources:safety.visibility.open.title")}</h3>
                <p>{t("resources:safety.visibility.open.body")}</p>
              </div>
            </div>
            <div className={`${styles.visCard} ${styles.viNetwork}`}>
              <div className={styles.visIcon}>
                <div className={styles.dot} />
              </div>
              <div>
                <h3>{t("resources:safety.visibility.network.title")}</h3>
                <p>{t("resources:safety.visibility.network.body")}</p>
              </div>
            </div>
            <div className={`${styles.visCard} ${styles.viPrivate}`}>
              <div className={styles.visIcon}>
                <div className={styles.dot} />
              </div>
              <div>
                <h3>{t("resources:safety.visibility.private.title")}</h3>
                <p>{t("resources:safety.visibility.private.body")}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <hr className={styles.divider} />

        <Reveal as="section" className={styles.section}>
          <h2>
            <Translation
              i18nKey="resources:safety.vouching.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>
            <Translation
              i18nKey="resources:safety.vouching.body1"
              components={{ b: <b /> }}
            />
          </p>
          <p>{t("resources:safety.vouching.body2")}</p>
          <div className={styles.callout}>
            <div className={styles.calloutHead}>
              {t("resources:safety.vouching.calloutHead")}
            </div>
            <p>{t("resources:safety.vouching.calloutBody")}</p>
          </div>
        </Reveal>

        <hr className={styles.divider} />

        <Reveal as="section" className={styles.section}>
          <h2>
            <Translation
              i18nKey="resources:safety.dataUse.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("resources:safety.dataUse.body1")}</p>
          <p>{t("resources:safety.dataUse.body2")}</p>
          <p>
            <Translation
              i18nKey="resources:safety.dataUse.body3"
              components={{ b: <b /> }}
            />
          </p>
        </Reveal>

        <hr className={styles.divider} />

        <Reveal as="section" className={styles.section}>
          <h2>
            <Translation
              i18nKey="resources:safety.report.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("resources:safety.report.body1")}</p>
          <p>{t("resources:safety.report.body2")}</p>
          <div className={styles.reportBox}>
            <h3>{t("resources:safety.report.boxTitle")}</h3>
            <p>{t("resources:safety.report.boxBody")}</p>
            <Button href="mailto:safe@queerpulse.pt">
              {t("resources:safety.report.emailCta")}
            </Button>
          </div>
        </Reveal>

        <hr className={styles.divider} />

        <Reveal as="section" className={styles.section}>
          <h2>
            <Translation
              i18nKey="resources:safety.leaving.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("resources:safety.leaving.body1")}</p>
          <p>{t("resources:safety.leaving.body2")}</p>
        </Reveal>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="resources:safety.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:safety.outro.sub")}
      >
        <Button href="mailto:hello@queerpulse.pt" variant="primary" size="lg">
          {t("resources:safety.outro.cta")}
        </Button>
      </Outro>

      <SubpageIndex
        eyebrow={t("resources:safety.subpageIndex.eyebrow")}
        title={t("resources:safety.subpageIndex.title")}
        items={subpages}
      />
    </PageShell>
  );
}
