import { Link } from "react-router-dom";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { CONTACTS, type Path } from "./transHealthcare.data";
import styles from "./TransHealthcarePage.module.css";

export function TransHealthcareHero() {
  const { t } = useTranslation();
  return (
    <header className={styles.hero}>
      <div className="wrap">
        <div className={styles.eye}>
          {t("resources:transHealthcare.hero.eyebrow")}
        </div>
        <h1 className={styles.title}>
          {t("resources:transHealthcare.hero.titleLine1")}
          <br />
          <Translation
            i18nKey="resources:transHealthcare.hero.titleLine2"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.sub}>{t("resources:transHealthcare.hero.sub")}</p>
        <p className={styles.disclaimer}>
          {t("resources:transHealthcare.hero.disclaimer")}
        </p>
      </div>
    </header>
  );
}

export function TransHealthcareJourney({ path }: { path: Path }) {
  const { t } = useTranslation();
  return (
    <div className={styles.journey}>
      {path.sections.map((sec) => (
        <div className={styles.jSection} key={sec.titleKey}>
          <div className={styles.jSectionTitle}>{t(sec.titleKey)}</div>
          {sec.steps.map((s) => (
            <div className={styles.step} key={s.n}>
              <div className={styles.stepNum}>{s.n}</div>
              <div className={styles.stepBody}>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
                <div className={styles.stepMeta}>
                  {s.time && (
                    <span className={`${styles.metaPill} ${styles.pillTime}`}>
                      ⏱ {s.time}
                    </span>
                  )}
                  {s.cost && (
                    <span className={`${styles.metaPill} ${styles.pillCost}`}>
                      € {s.cost}
                    </span>
                  )}
                </div>
                {s.tip && <div className={styles.stepTip}>{s.tip}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TransHealthcareSidebar() {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbcTitle}>
          {t("resources:transHealthcare.sidebar.keyContacts")}
        </div>
        {CONTACTS.map((c) => (
          <div className={styles.sbcItem} key={c.org}>
            <div className={styles.sbcOrg}>{c.org}</div>
            <div className={styles.sbcRole}>{c.role}</div>
            <div className={styles.sbcContact}>{c.contact}</div>
          </div>
        ))}
      </div>
      <div className={styles.sbAlert}>
        <div className={styles.sbAlertTitle}>
          {t("resources:transHealthcare.sidebar.communityTip")}
        </div>
        <div className={styles.sbAlertBody}>
          {t("resources:transHealthcare.sidebar.communityTipBody")}
        </div>
      </div>
      <div className={styles.sbCard}>
        <div className={styles.sbcTitle}>
          {t("resources:transHealthcare.sidebar.relatedTitle")}
        </div>
        <div className={styles.sbcItem}>
          <Link to={routes.solidarity} className={styles.sbcLink}>
            {t("resources:transHealthcare.sidebar.solidarityCta")}
          </Link>
          <div className={styles.sbcRole}>
            {t("resources:transHealthcare.sidebar.solidarityRole")}
          </div>
        </div>
        <div className={styles.sbcItem}>
          <Link to={routes.legal} className={styles.sbcLink}>
            {t("resources:transHealthcare.sidebar.legalCta")}
          </Link>
          <div className={styles.sbcRole}>
            {t("resources:transHealthcare.sidebar.legalRole")}
          </div>
        </div>
        <div className={styles.sbcItem}>
          <Link to={routes.mentalHealth} className={styles.sbcLink}>
            {t("resources:transHealthcare.sidebar.mentalHealthCta")}
          </Link>
          <div className={styles.sbcRole}>
            {t("resources:transHealthcare.sidebar.mentalHealthRole")}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function TransHealthcareOutro() {
  const { t } = useTranslation();
  return (
    <Outro
      title={
        <Translation
          i18nKey="resources:transHealthcare.outro.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("resources:transHealthcare.outro.sub")}
    >
      <Button to={routes.solidarity} variant="primary" size="lg">
        {t("resources:transHealthcare.outro.cta")}
      </Button>
    </Outro>
  );
}
