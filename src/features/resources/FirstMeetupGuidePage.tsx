import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ResourceHero } from "./ResourceHero";
import { EXPECT, VALUE_KEYS, FAQS } from "./firstMeetupGuide.data";
import styles from "./resources.module.css";

export function FirstMeetupGuidePage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <ResourceHero
        eyebrow={t("resources:firstMeetupGuide.hero.eyebrow")}
        eyebrowDotColor="var(--accent)"
        title={
          <Translation
            i18nKey="resources:firstMeetupGuide.hero.title"
            components={{ em: <em /> }}
          />
        }
        lead={t("resources:firstMeetupGuide.hero.lead")}
        anchors={[
          {
            label: t("resources:firstMeetupGuide.hero.anchor.expect"),
            href: "#expect",
          },
          {
            label: t("resources:firstMeetupGuide.hero.anchor.values"),
            href: "#values",
          },
          {
            label: t("resources:firstMeetupGuide.hero.anchor.faq"),
            href: "#faq",
          },
        ]}
      />

      <section
        className={`${styles.section} ${styles.sectionPaper}`}
        id="expect"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:firstMeetupGuide.expect.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:firstMeetupGuide.expect.lead")}
          </Reveal>
          <div className={styles.grid}>
            {EXPECT.map((e, i) => (
              <Reveal key={e.titleKey} className={styles.card} delay={i * 55}>
                <div className={styles.cardName} style={{ fontSize: 19 }}>
                  {t(e.titleKey)}
                </div>
                <div className={styles.cardSpec}>{t(e.bodyKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionCream}`}
        id="values"
      >
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:firstMeetupGuide.values.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP}>
            {t("resources:firstMeetupGuide.values.lead")}
          </Reveal>
          <div className={styles.stepList}>
            {VALUE_KEYS.map((valueKey, i) => (
              <Reveal key={valueKey} className={styles.step}>
                <div className={styles.stepN}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  className={styles.stepBody}
                  style={{ alignSelf: "center" }}
                >
                  {t(valueKey)}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`} id="faq">
        <div className="wrap">
          <Reveal as="h2">
            <Translation
              i18nKey="resources:firstMeetupGuide.faq.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <div>
            {FAQS.map((f) => (
              <Reveal key={f.qKey} className={styles.qaItem}>
                <div className={styles.qaQ}>{t(f.qKey)}</div>
                <div className={styles.qaA}>{t(f.aKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="resources:firstMeetupGuide.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:firstMeetupGuide.outro.sub")}
      >
        <Button to={routes.gatherings} variant="primary" size="lg">
          {t("resources:firstMeetupGuide.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
