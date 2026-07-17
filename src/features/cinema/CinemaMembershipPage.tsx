import { PageShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CinemaMembershipTiers,
  CinemaMembershipPays,
  CinemaMembershipLedger,
} from "./CinemaMembershipPays";
import styles from "./CinemaMembershipPage.module.css";

export function CinemaMembershipPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <section className={styles.hero}>
        <div className="wrap">
          <div className={styles.eb}>
            <span className="live" /> {t("cinema:membership.hero.eyebrow")}
          </div>
          <h1 className={styles.title}>
            <Translation
              i18nKey="cinema:membership.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("cinema:membership.hero.sub")}</p>
        </div>
      </section>

      <CinemaMembershipTiers />
      <CinemaMembershipPays />
      <CinemaMembershipLedger />
    </PageShell>
  );
}
