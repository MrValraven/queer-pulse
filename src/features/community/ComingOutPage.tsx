import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PRIVACY, STAGES } from "./comingOut.data";
import styles from "./ComingOutPage.module.css";

export function ComingOutPage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Reveal className={styles.eyebrow}>
            {t("community:comingOut.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            <Translation
              i18nKey="community:comingOut.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.lead} delay={120}>
            <Translation
              i18nKey="community:comingOut.hero.lead"
              components={{ em: <em /> }}
            />
          </Reveal>
        </div>
      </header>

      <section className={styles.section}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            <Translation
              i18nKey="community:comingOut.privacy.heading"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            {t("community:comingOut.privacy.lead")}
          </Reveal>
          <div className={styles.grid}>
            {PRIVACY.map((item, index) => (
              <Reveal
                key={item.titleKey}
                className={styles.card}
                delay={index * 55}
              >
                <div className={styles.cardIcon}>
                  <item.icon />
                </div>
                <div className={styles.cardTitle}>{t(item.titleKey)}</div>
                <div className={styles.cardBody}>{t(item.bodyKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            <Translation
              i18nKey="community:comingOut.stages.heading"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            {t("community:comingOut.stages.lead")}
          </Reveal>
          <div className={styles.steps}>
            {STAGES.map((stage, index) => (
              <Reveal key={stage.n} className={styles.step} delay={index * 60}>
                <span className={styles.stepN}>{stage.n}</span>
                <div>
                  <div className={styles.stepTitle}>{t(stage.titleKey)}</div>
                  <div className={styles.stepBody}>{t(stage.bodyKey)}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="community:comingOut.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("community:comingOut.outro.sub")}
      >
        <Button to={routes.comingOut} variant="primary" size="lg">
          {t("community:comingOut.outro.enterCta")}
        </Button>
        <Button to={routes.communities} variant="ghost-dark" size="lg">
          {t("community:comingOut.outro.communitiesCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
