import { FiArrowRight } from "react-icons/fi";
import { Button, HubBackLink, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  SECTIONS,
  AFTER,
  SOBER,
  SERVICES,
  NALOXONE_STEPS,
  type HrSection,
} from "./harmReduction.data";
import styles from "./HarmReductionPage.module.css";

function SectionCard({ section }: { section: HrSection }) {
  const { t } = useTranslation();
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <div className={styles.hrsLabel}>{t(section.labelKey)}</div>
        <div className={styles.hrsTitle}>{t(section.titleKey)}</div>
      </div>
      <div className={styles.sectionBody}>
        {section.alert && (
          <div className={styles.alert}>
            <div className={styles.alertHead}>{t(section.alert.headKey)}</div>
            <div className={styles.alertBody}>{t(section.alert.bodyKey)}</div>
          </div>
        )}
        {section.items.map((it) => (
          <div className={styles.item} key={it.titleKey}>
            <div className={styles.itemTitle}>{t(it.titleKey)}</div>
            <div className={styles.itemBody}>{t(it.bodyKey)}</div>
          </div>
        ))}
        {section.link && (
          <Button
            to={section.link.href}
            variant="ghost"
            className={styles.sectionBtn}
          >
            {t(section.link.labelKey)} <FiArrowRight aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}

export function HarmReductionEmergencyStrip() {
  const { t } = useTranslation();
  return (
    <div className={styles.emergencyStrip}>
      <div className={`wrap ${styles.esInner}`}>
        <div className={styles.esItem}>
          <span>{t("resources:harmReduction.emergency.emergencyLabel")}</span>
          <span className={styles.esNum}>112</span>
        </div>
        <div className={styles.esItem}>
          <span>{t("resources:harmReduction.emergency.snsLabel")}</span>
          <span className={styles.esNum}>808 24 24 24</span>
        </div>
        <div className={styles.esItem}>
          <span>
            {t("resources:harmReduction.emergency.mentalHealthLabel")}
          </span>
          <span className={styles.esNum}>800 202 296</span>
        </div>
      </div>
    </div>
  );
}

export function HarmReductionHero() {
  const { t } = useTranslation();
  return (
    <header className={styles.hero}>
      <div className="wrap">
        <HubBackLink
          to={routes.wellbeing}
          label={t("resources:harmReduction.hero.backLink")}
          tone="dark"
        />
        <div className={styles.eye}>
          {t("resources:harmReduction.hero.eyebrow")}
        </div>
        <h1 className={styles.title}>
          {t("resources:harmReduction.hero.titleLine1")}
          <br />
          <em>{t("resources:harmReduction.hero.titleLine2")}</em>
        </h1>
        <p className={styles.sub}>{t("resources:harmReduction.hero.sub")}</p>
        <div className={styles.sos}>
          <span>
            <Translation
              i18nKey="resources:harmReduction.hero.sos"
              components={{ strong: <strong /> }}
            />
          </span>
        </div>
      </div>
    </header>
  );
}

export function NaloxoneCard() {
  const { t } = useTranslation();
  return (
    <div className={styles.naloxoneCard}>
      <div>
        <div className={styles.ncTitle}>
          <Translation
            i18nKey="resources:harmReduction.naloxone.title"
            components={{ em: <em /> }}
          />
        </div>
        <p className={styles.ncBody}>
          {t("resources:harmReduction.naloxone.body1")}
        </p>
        <p className={styles.ncBody}>
          {t("resources:harmReduction.naloxone.body2")}
        </p>
      </div>
      <div className={styles.ncSteps}>
        <div className={styles.ncStepsLabel}>
          {t("resources:harmReduction.naloxone.stepsLabel")}
        </div>
        {NALOXONE_STEPS.map((s) => (
          <div className={styles.ncStep} key={s.n}>
            <div className={styles.ncN}>{s.n}</div>
            <div className={styles.ncStepBody}>
              <Translation
                i18nKey={s.bodyKey}
                components={{ strong: <strong /> }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HarmReductionGrid() {
  return (
    <div className={styles.body}>
      <div className="wrap">
        <div className={styles.grid}>
          <SectionCard section={SECTIONS[0]!} />
          <SectionCard section={SECTIONS[1]!} />
          <NaloxoneCard />
          <SectionCard section={AFTER} />
          <SectionCard section={SOBER} />
          <SectionCard section={SERVICES} />
        </div>
      </div>
    </div>
  );
}

export function HarmReductionOutro() {
  const { t } = useTranslation();
  return (
    <Outro
      title={
        <Translation
          i18nKey="resources:harmReduction.outro.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("resources:harmReduction.outro.sub")}
    >
      <Button to={routes.sexualHealth} variant="primary" size="lg">
        {t("resources:harmReduction.outro.cta")}
      </Button>
    </Outro>
  );
}
