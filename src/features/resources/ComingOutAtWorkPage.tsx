import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { ResourceHero } from "./ResourceHero";
import {
  TIMING,
  SIGNALS,
  SCRIPTS,
  IF_BAD,
  VOICES,
} from "./comingOutAtWork.data";
import styles from "./resources.module.css";

export function ComingOutAtWorkPage() {
  const { t } = useTranslation();
  const pageTitle = t("resources:comingOutAtWork.meta.title");
  const pageDescription = t("resources:comingOutAtWork.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/coming-out-at-work" },
        ])}
      />
      <ResourceHero
        eyebrow={t("resources:comingOutAtWork.hero.eyebrow")}
        eyebrowDotColor="var(--violet)"
        title={
          <Translation
            i18nKey="resources:comingOutAtWork.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:comingOutAtWork.hero.lead")}
        anchors={[
          {
            label: t("resources:comingOutAtWork.hero.anchor.timing"),
            href: "#timing",
          },
          {
            label: t("resources:comingOutAtWork.hero.anchor.signals"),
            href: "#signals",
          },
          {
            label: t("resources:comingOutAtWork.hero.anchor.scripts"),
            href: "#scripts",
          },
          {
            label: t("resources:comingOutAtWork.hero.anchor.bad"),
            href: "#bad",
          },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="timing"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:comingOutAtWork.timing.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:comingOutAtWork.timing.lead")}
          </Reveal>
          <div className={styles.grid}>
            {TIMING.map((item, i) => (
              <Reveal
                key={item.titleKey}
                className={styles.card}
                delay={i * 55}
              >
                <div className={styles.cardName} style={{ fontSize: 19 }}>
                  {t(item.titleKey)}
                </div>
                <div className={styles.cardSpec}>{t(item.bodyKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionCream}`}
        id="signals"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:comingOutAtWork.signals.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:comingOutAtWork.signals.lead")}
          </Reveal>
          <div className={styles.grid}>
            {SIGNALS.map((s, i) => (
              <Reveal
                key={s.textKey}
                className={styles.rightCard}
                delay={i * 45}
              >
                <span
                  className={`${styles.badge} ${s.badge === "good" ? styles.badgeProtected : styles.badgeKnow}`}
                >
                  {s.badge === "good"
                    ? t("resources:comingOutAtWork.signals.goodBadge")
                    : t("resources:comingOutAtWork.signals.cautionBadge")}
                </span>
                <div className={styles.rightBody}>{t(s.textKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="scripts"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:comingOutAtWork.scripts.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:comingOutAtWork.scripts.lead")}
          </Reveal>
          <div>
            {SCRIPTS.map((s) => (
              <Reveal key={s.contextKey} className={styles.qaItem}>
                <div className={styles.qaQ}>{t(s.contextKey)}</div>
                <div className={styles.qaA} style={{ fontStyle: "italic" }}>
                  {t(s.lineKey)}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="bad">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:comingOutAtWork.bad.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <div className={styles.grid}>
            {IF_BAD.map((b, i) => (
              <Reveal key={b.titleKey} className={styles.card} delay={i * 55}>
                <div className={styles.cardName} style={{ fontSize: 19 }}>
                  {t(b.titleKey)}
                </div>
                <div className={styles.cardSpec}>{t(b.bodyKey)}</div>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            {VOICES.map((v) => (
              <Reveal key={v.who} className={styles.qaItem}>
                <div
                  className={styles.qaQ}
                  style={{ fontStyle: "italic", fontWeight: 400 }}
                >
                  "{v.text}"
                </div>
                <div className={styles.archiveMeta}>{v.who}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:comingOutAtWork.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:comingOutAtWork.outro.sub")}
      >
        <Button to={routes.legal} variant="primary" size="lg">
          {t("resources:comingOutAtWork.outro.rightsCta")}
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          {t("resources:comingOutAtWork.outro.talkCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
