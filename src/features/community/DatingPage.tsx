import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { APPS, CULTURE, EVENTS, RECOGNITION, STRUCTURES } from "./dating.data";
import { DatingAppCard } from "./DatingAppCard";
import styles from "./DatingPage.module.css";

export function DatingPage() {
  const { t } = useTranslation();
  const calendar = routes.calendar;
  const forum = routes.forum;
  const legal = routes.legal;

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>{t("community:dating.hero.cat")}</div>
          <h1>
            <Translation
              i18nKey="community:dating.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.heroSub}>{t("community:dating.hero.sub")}</p>
        </div>
      </div>

      <section className={styles.sec}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="community:dating.apps.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("community:dating.apps.lead")}</p>
          </div>
          <div className={styles.appGrid}>
            {APPS.map((app) => (
              <DatingAppCard app={app} key={app.name} />
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.sec} ${styles.alt}`}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="community:dating.culture.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("community:dating.culture.lead")}</p>
          </div>
          <div className={styles.cultureGrid}>
            {CULTURE.map((c) => (
              <div className={styles.cultureCard} key={c.num}>
                <div className={styles.ccNum}>{c.num}</div>
                <div>
                  <div className={styles.ccTitle}>{t(c.titleKey)}</div>
                  <div className={styles.ccText}>{t(c.textKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sec}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="community:dating.structures.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("community:dating.structures.lead")}</p>
          </div>
          <div className={styles.structuresGrid}>
            {STRUCTURES.map((s) => (
              <div className={styles.structureCard} key={s.labelKey}>
                <div className={styles.scLabel}>{t(s.labelKey)}</div>
                <div className={styles.scTitle}>{t(s.titleKey)}</div>
                <div className={styles.scText}>{t(s.textKey)}</div>
              </div>
            ))}
          </div>

          <h3 className={styles.recHead}>
            <Translation
              i18nKey="community:dating.recognition.heading"
              components={{ em: <em /> }}
            />
          </h3>
          <div className={styles.recStrip}>
            {RECOGNITION.map((r) => (
              <div className={styles.recItem} key={r.titleKey}>
                <h4>{t(r.titleKey)}</h4>
                <p>{t(r.textKey)}</p>
                <div
                  className={[
                    styles.recStatus,
                    r.partial ? styles.recPartial : styles.recYes,
                  ].join(" ")}
                >
                  <span
                    className={styles.recDot}
                    style={{
                      background: r.partial ? "var(--accent)" : "var(--jade)",
                    }}
                  />
                  {t(r.statusKey)}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.recCta}>
            <Button to={legal} variant="ghost">
              {t("community:dating.recognition.legalCta")}
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.social}>
        <div className="wrap">
          <div className={styles.socialInner}>
            <div className={styles.socialLeft}>
              <h2>
                <Translation
                  i18nKey="community:dating.social.heading"
                  components={{ em: <em /> }}
                />
              </h2>
              <p>{t("community:dating.social.lead")}</p>
              <div className={styles.socialActions}>
                <Button to={calendar} variant="primary">
                  {t("community:dating.social.upcomingEventsCta")}
                </Button>
                <Button to={forum} variant="ghost-dark">
                  {t("community:dating.social.forumThreadCta")}
                </Button>
              </div>
            </div>
            <div className={styles.socialEvents}>
              {EVENTS.map((e) => (
                <div className={styles.socialEvent} key={e.nameKey}>
                  <div className={styles.seName}>{t(e.nameKey)}</div>
                  <div className={styles.seDetail}>{t(e.detailKey)}</div>
                  <div className={styles.seNote}>{t(e.noteKey)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="community:dating.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("community:dating.outro.sub")}
      >
        <Button to={calendar} variant="primary" size="lg">
          {t("community:dating.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
