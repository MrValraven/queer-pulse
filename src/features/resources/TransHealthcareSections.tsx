import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { CONTACTS, type Path } from "./transHealthcare.data";
import { ResourceHero } from "./ResourceHero";
import styles from "./TransHealthcarePage.module.css";

export function TransHealthcareHero() {
  const { t } = useTranslation();
  return (
    <ResourceHero
      eyebrowVariant="label"
      eyebrowColor="var(--jade)"
      eyebrow={t("resources:transHealthcare.hero.eyebrow")}
      titleWeight="light"
      title={
        <>
          {t("resources:transHealthcare.hero.titleLine1")}
          <br />
          <Translation
            i18nKey="resources:transHealthcare.hero.titleLine2"
            components={{ em: <em /> }}
          />
        </>
      }
      lead={t("resources:transHealthcare.hero.sub")}
      extras={
        <p className={styles.disclaimer}>
          {t("resources:transHealthcare.hero.disclaimer")}
        </p>
      }
    />
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
                <div className={styles.stepDesc}>{s.description}</div>
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
            {t("resources:transHealthcare.sidebar.solidarityCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
          <div className={styles.sbcRole}>
            {t("resources:transHealthcare.sidebar.solidarityRole")}
          </div>
        </div>
        <div className={styles.sbcItem}>
          <Link to={routes.legal} className={styles.sbcLink}>
            {t("resources:transHealthcare.sidebar.legalCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
          <div className={styles.sbcRole}>
            {t("resources:transHealthcare.sidebar.legalRole")}
          </div>
        </div>
        <div className={styles.sbcItem}>
          <Link to={routes.mentalHealth} className={styles.sbcLink}>
            {t("resources:transHealthcare.sidebar.mentalHealthCta")}{" "}
            <FiArrowRight aria-hidden />
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
