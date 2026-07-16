import { Button, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { manifestoAssurances } from "./Manifesto.data";
import styles from "./Manifesto.module.css";

export function Manifesto() {
  const { t } = useTranslation();

  return (
    <section className={styles.manifesto} id="about">
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.intro}>
            <Reveal className={styles.label}>
              {t("homepage:manifesto.label")}
            </Reveal>
            <Reveal as="h2" className={styles.lead} delay={60}>
              <Translation
                i18nKey="homepage:manifesto.lead"
                components={{ em: <em /> }}
              />
            </Reveal>
            <Reveal as="p" className={styles.body} delay={120}>
              {t("homepage:manifesto.body1")}
            </Reveal>
            <Reveal as="p" className={styles.body} delay={160}>
              {t("homepage:manifesto.body2")}
            </Reveal>
            <Reveal className={styles.actions} delay={220}>
              <Button variant="ghost-dark" to={routes.safety}>
                {t("homepage:manifesto.safetyCta")}
              </Button>
            </Reveal>
          </div>

          <ul className={styles.assurances}>
            {manifestoAssurances.map((item, index) => (
              <Reveal
                as="li"
                key={item.titleKey}
                className={styles.assurance}
                delay={index * 70}
              >
                <span className={styles.icon} aria-hidden>
                  {item.icon}
                </span>
                <div className={styles.copy}>
                  <div className={styles.name}>{t(item.titleKey)}</div>
                  <p className={styles.desc}>{t(item.descriptionKey)}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
