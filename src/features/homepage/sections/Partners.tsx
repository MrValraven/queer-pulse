import { Link } from "react-router-dom";
import { Reveal, SectionHead } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { linkToPath, routes } from "../../../app/routeMap";
import { partners } from "../data/partners";
import styles from "./Partners.module.css";

export function Partners() {
  const { t } = useTranslation();

  return (
    <section className={styles.strip}>
      <div className="wrap">
        <Reveal>
          <SectionHead
            className={styles.head}
            title={
              <Translation
                i18nKey="homepage:partners.title"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("homepage:partners.subtitle")}
          />
        </Reveal>

        <Reveal className={styles.logos}>
          {partners.map((partner) => (
            <Link
              key={partner.name}
              to={linkToPath(partner.href)}
              className={styles.badge}
            >
              <span className={[styles.av, styles[partner.tone]].join(" ")}>
                {partner.initials}
              </span>
              <span>
                <span className={styles.name} style={{ display: "block" }}>
                  {partner.name}
                </span>
                <span className={styles.loc}>{partner.location}</span>
              </span>
            </Link>
          ))}
          <Link
            to={routes.partners}
            className={[styles.badge, styles.dashed].join(" ")}
          >
            <span className={[styles.av, styles.plus].join(" ")}>+</span>
            <span>
              <span
                className={[styles.name, styles.nameMuted].join(" ")}
                style={{ display: "block" }}
              >
                {t("homepage:partners.seeAllLabel")}
              </span>
              <span className={styles.loc}>
                {t("homepage:partners.moreCount", { count: 8 })}
              </span>
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
