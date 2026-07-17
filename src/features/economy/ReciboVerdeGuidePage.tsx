import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { Button, Eyebrow, Reveal } from "../../shared/components/ui";
import { FiCheckCircle } from "react-icons/fi";
import { TAX_DISCLAIMER } from "./tax.constants";
import { GUIDE_SECTIONS, type GuideSection } from "./reciboVerdeGuide.data";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ReciboVerdeGuidePage.module.css";

/** A single reading block in the guide column. */
function GuideSectionBlock({ section }: { section: GuideSection }) {
  return (
    <Reveal as="section" className={styles.block}>
      <h2 id={section.id} className={styles.blockTitle}>
        {section.title}
      </h2>
      <div className={styles.blockBody}>{section.body}</div>
    </Reveal>
  );
}

export function ReciboVerdeGuidePage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Reveal as="div">
            <Eyebrow>{t("economy:toolPage.eyebrowFreelance")}</Eyebrow>
          </Reveal>
          <Reveal as="h1" className={styles.heroTitle} delay={60}>
            <Translation
              i18nKey="economy:reciboGuide.heroTitle"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.heroLead} delay={120}>
            {t("economy:reciboGuide.heroLead")}
          </Reveal>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.column}>
          {GUIDE_SECTIONS.map((section) => (
            <GuideSectionBlock key={section.id} section={section} />
          ))}

          <Reveal as="section" className={styles.ctaRow}>
            <h2 className={styles.ctaTitle}>
              <Translation
                i18nKey="economy:reciboGuide.ctaTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.ctaText}>{t("economy:reciboGuide.ctaText")}</p>
            <div className={styles.ctaButtons}>
              <Button to={routes.invoiceTool} variant="primary">
                {t("economy:reciboGuide.makeInvoiceCta")}
              </Button>
              <Button to={routes.economy} variant="ghost">
                {t("economy:reciboGuide.backToEconomy")}
              </Button>
            </div>
          </Reveal>

          <Reveal as="aside" className={styles.disclaimer}>
            <span className={styles.disclaimerIcon} aria-hidden>
              <FiCheckCircle />
            </span>
            <h2 className={styles.disclaimerTitle}>
              <Translation
                i18nKey="economy:reciboGuide.disclaimerTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.disclaimerText}>{TAX_DISCLAIMER}</p>
          </Reveal>
        </div>
      </div>
    </PageShell>
  );
}
