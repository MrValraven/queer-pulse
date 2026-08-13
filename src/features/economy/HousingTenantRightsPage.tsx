import { FiShield } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { Button, Eyebrow, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SafetyIcon } from "./SafetyIcon";
import { TenantRightsHelper } from "./TenantRightsHelper";
import { SCAM_SAFETY_TIPS } from "./housingSafety.data";
import styles from "./HousingSafety.module.css";

/**
 * The Housing safety reference — anti-scam tips, Portuguese tenant rights, and
 * Lisbon price-sanity ranges in one place. Linked from the safety banner shown
 * when a member contacts a lister or lists a space. Everything here is general
 * guidance for renting in Portugal, framed plainly as not legal advice.
 */
export function HousingTenantRightsPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Reveal as="div">
            <Eyebrow>{t("economy:housingSafety.page.eyebrow")}</Eyebrow>
          </Reveal>
          <Reveal as="h1" className={styles.heroTitle} delay={60}>
            <Translation
              i18nKey="economy:housingSafety.page.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.heroLead} delay={120}>
            {t("economy:housingSafety.page.lead")}
          </Reveal>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.column}>
          <Reveal as="section" className={styles.scamSection} aria-labelledby="anti-scam-heading">
            <h2 id="anti-scam-heading" className={styles.sectionTitle}>
              <Translation
                i18nKey="economy:housingSafety.page.antiScamTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <ul className={styles.scamGrid}>
              {SCAM_SAFETY_TIPS.map((tip) => (
                <li key={tip.id} className={styles.scamItem}>
                  <span className={styles.scamIcon}>
                    <SafetyIcon name={tip.icon} size={18} />
                  </span>
                  <span className={styles.scamText}>{t(tip.labelKey)}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <TenantRightsHelper />

          <Reveal as="aside" className={styles.disclaimer}>
            <span className={styles.disclaimerIcon} aria-hidden>
              <FiShield />
            </span>
            <h2 className={styles.disclaimerTitle}>
              <Translation
                i18nKey="economy:housingSafety.disclaimer.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.disclaimerText}>
              {t("economy:housingSafety.disclaimer.body")}
            </p>
            <div className={styles.disclaimerActions}>
              <Button to={routes.housing} variant="ghost-dark">
                {t("economy:housingSafety.backToHousing")}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </PageShell>
  );
}
