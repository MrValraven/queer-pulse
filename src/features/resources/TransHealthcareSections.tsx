import { Link } from "react-router-dom";
import { FiArrowRight, FiClock, FiTag } from "react-icons/fi";
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
      {path.sections.map((section) => (
        <div className={styles.jSection} key={section.titleKey}>
          <div className={styles.jSectionTitle}>{t(section.titleKey)}</div>
          {section.steps.map((step) => (
            <div className={styles.step} key={step.n}>
              <div className={styles.stepNum}>{step.n}</div>
              <div className={styles.stepBody}>
                <div className={styles.stepTitle}>{t(step.titleKey)}</div>
                <div className={styles.stepDesc}>{t(step.descriptionKey)}</div>
                <div className={styles.stepMeta}>
                  {step.timeKey && (
                    <span className={`${styles.metaPill} ${styles.pillTime}`}>
                      <FiClock aria-hidden />
                      {t(step.timeKey)}
                    </span>
                  )}
                  {step.costKey && (
                    <span className={`${styles.metaPill} ${styles.pillCost}`}>
                      <FiTag aria-hidden />
                      {t(step.costKey)}
                    </span>
                  )}
                </div>
                {step.tipKey && (
                  <div className={styles.stepTip}>{t(step.tipKey)}</div>
                )}
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
        {CONTACTS.map((contact) => (
          <div className={styles.sbcItem} key={contact.org}>
            <div className={styles.sbcOrg}>{contact.org}</div>
            <div className={styles.sbcRole}>{t(contact.roleKey)}</div>
            <div className={styles.sbcContact}>{t(contact.contactKey)}</div>
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
