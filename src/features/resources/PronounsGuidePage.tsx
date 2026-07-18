import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { NameTable, WhereGrid, FaqList } from "./PronounsGuideSections";
import styles from "./PronounsGuidePage.module.css";

export function PronounsGuidePage() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEye}>
            {t("resources:pronounsGuide.hero.eyebrow")}
          </div>
          <h1 className={styles.heroH}>
            <Translation
              i18nKey="resources:pronounsGuide.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.heroSub}>
            {t("resources:pronounsGuide.hero.sub")}
          </p>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.layout}>
          <div>
            <Reveal as="section" className={styles.section}>
              <div className={styles.proseEye}>
                {t("resources:pronounsGuide.basics.eyebrow")}
              </div>
              <h2 className={styles.proseH}>
                <Translation
                  i18nKey="resources:pronounsGuide.basics.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <div className={styles.proseBody}>
                <p>
                  <Translation
                    i18nKey="resources:pronounsGuide.basics.body1"
                    components={{ strong: <strong /> }}
                  />
                </p>
                <p>{t("resources:pronounsGuide.basics.body2")}</p>
              </div>
              <NameTable />
            </Reveal>

            <Reveal as="section" className={styles.section}>
              <div className={styles.proseEye}>
                {t("resources:pronounsGuide.whenUpdate.eyebrow")}
              </div>
              <h2 className={styles.proseH}>
                <Translation
                  i18nKey="resources:pronounsGuide.whenUpdate.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <div className={styles.proseBody}>
                <p>{t("resources:pronounsGuide.whenUpdate.body")}</p>
              </div>
              <WhereGrid />
            </Reveal>

            <Reveal as="section" className={styles.section}>
              <div className={styles.proseEye}>
                {t("resources:pronounsGuide.pronouns.eyebrow")}
              </div>
              <h2 className={styles.proseH}>
                <Translation
                  i18nKey="resources:pronounsGuide.pronouns.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <div className={styles.proseBody}>
                <p>{t("resources:pronounsGuide.pronouns.body1")}</p>
                <p>{t("resources:pronounsGuide.pronouns.body2")}</p>
                <p>{t("resources:pronounsGuide.pronouns.body3")}</p>
              </div>
            </Reveal>

            <Reveal as="section" className={styles.section}>
              <div className={styles.proseEye}>
                {t("resources:pronounsGuide.faq.eyebrow")}
              </div>
              <h2 className={styles.proseH}>
                <Translation
                  i18nKey="resources:pronounsGuide.faq.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <FaqList />
            </Reveal>
          </div>

          <aside className={styles.sidebar}>
            {loggedIn && (
              <div className={styles.sidebarCard}>
                <h3>
                  <Translation
                    i18nKey="resources:pronounsGuide.sidebar.updateName.title"
                    components={{ em: <em /> }}
                  />
                </h3>
                <p>{t("resources:pronounsGuide.sidebar.updateName.body")}</p>
                <Button variant="primary" to={routes.settings}>
                  {t("resources:pronounsGuide.sidebar.updateName.cta")}
                </Button>
              </div>
            )}
            <div className={styles.commitment}>
              <h4>{t("resources:pronounsGuide.sidebar.commitment.title")}</h4>
              <p>
                <Translation
                  i18nKey="resources:pronounsGuide.sidebar.commitment.body"
                  components={{ a: <Link to={routes.contact} /> }}
                />
              </p>
            </div>
            <div className={styles.sidebarCard}>
              <h3>
                <Translation
                  i18nKey="resources:pronounsGuide.sidebar.wrong.title"
                  components={{ em: <em /> }}
                />
              </h3>
              <p>{t("resources:pronounsGuide.sidebar.wrong.body")}</p>
              <Button variant="ghost" to={routes.contact}>
                {t("resources:pronounsGuide.sidebar.wrong.cta")}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="resources:pronounsGuide.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:pronounsGuide.outro.sub")}
      >
        <Button variant="ghost-dark" size="lg" to={routes.contact}>
          {t("resources:pronounsGuide.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
