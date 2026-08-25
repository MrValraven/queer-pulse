import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { HOW } from "./solidarity.data";
import { SolidarityDirectory } from "./SolidarityDirectory";
import styles from "./SolidarityPage.module.css";

export function SolidarityPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <header className={styles.hero} data-plum>
        <div className="wrap">
          <div className={styles.eye}>
            {t("economy:solidarity.hero.eyebrow")}
          </div>
          <h1 className={styles.title}>
            {t("economy:solidarity.hero.titleLine1")}
            <br />
            <em>{t("economy:solidarity.hero.titleEm")}</em>
          </h1>
          <p className={styles.sub}>{t("economy:solidarity.hero.sub")}</p>
          <div className={styles.note}>{t("economy:solidarity.hero.note")}</div>
        </div>
      </header>

      <section className={styles.howStrip}>
        <div className="wrap">
          <div className={styles.howGrid}>
            {HOW.map((h, i) => (
              <Reveal
                className={styles.howItem}
                key={h.n}
                delay={Math.min(i, 8) * 80}
              >
                <div className={styles.howN}>{h.n}</div>
                <div className={styles.howTitle}>{t(h.titleKey)}</div>
                <div className={styles.howBody}>{t(h.bodyKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SolidarityDirectory />

      <Outro
        title={
          <Translation
            i18nKey="economy:solidarity.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("economy:solidarity.outro.sub")}
      >
        <Button
          to={requestInvitePath("solidarity")}
          variant="primary"
          size="lg"
        >
          {t("economy:solidarity.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
