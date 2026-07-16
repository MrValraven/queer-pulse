import { Link } from "react-router-dom";
import { Button, Reveal, SectionHead } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { linkToPath, routes } from "../../../app/routeMap";
import { platforms } from "../data/platforms";
import styles from "./Platforms.module.css";

export function Platforms() {
  const { t } = useTranslation();

  return (
    <section className={styles.strip}>
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <Translation
                i18nKey="homepage:platforms.title"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("homepage:platforms.subtitle")}
            action={
              <Button variant="ghost" to={routes.platforms}>
                {t("homepage:platforms.seeAllCta")}
              </Button>
            }
          />
        </Reveal>

        <Reveal className={styles.row}>
          {platforms.map((platform) => (
            <Link
              key={platform.name}
              to={linkToPath(platform.href)}
              className={styles.badge}
            >
              <span className={[styles.ic, styles[platform.tone]].join(" ")}>
                {platform.badge}
              </span>
              <span>
                <span className={styles.name} style={{ display: "block" }}>
                  {platform.name}
                </span>
                <span className={styles.cat}>{platform.category}</span>
              </span>
            </Link>
          ))}
          <Link
            to={routes.platforms}
            className={[styles.badge, styles.dashed].join(" ")}
          >
            <span className={[styles.ic, styles.plus].join(" ")}>+</span>
            <span>
              <span
                className={[styles.name, styles.nameMuted].join(" ")}
                style={{ display: "block" }}
              >
                {t("homepage:platforms.moreCount", { count: 24 })}
              </span>
              <span className={styles.cat}>
                {t("homepage:platforms.browseAllCta")}
              </span>
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
