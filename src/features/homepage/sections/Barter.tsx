import { Link } from "react-router-dom";
import { Button, Reveal, SectionHead } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { linkToPath, routes } from "../../../app/routeMap";
import { swaps } from "../data/swaps";
import styles from "./Barter.module.css";

export function Barter() {
  const { t } = useTranslation();

  return (
    <section className={styles.barter} id="barter">
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <Translation
                i18nKey="homepage:barter.title"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("homepage:barter.subtitle")}
            action={
              <Button variant="ghost" to={routes.barter}>
                {t("homepage:barter.browseAllCta")}
              </Button>
            }
          />
        </Reveal>

        <div className={styles.grid}>
          {swaps.map((swap, index) => (
            <Reveal key={swap.href} delay={index * 55}>
              <Link to={linkToPath(swap.href)} className={styles.card}>
                <div>
                  <span className={[styles.label, styles.offering].join(" ")}>
                    {t("homepage:barter.offeringLabel")}
                  </span>
                  <div className={styles.skill}>{swap.offering}</div>
                </div>
                <div className={styles.divider}>
                  {t("homepage:barter.inExchangeFor")}
                </div>
                <div>
                  <span className={[styles.label, styles.wanting].join(" ")}>
                    {t("homepage:barter.wantingLabel")}
                  </span>
                  <div className={styles.skill}>{swap.wanting}</div>
                </div>
                <div className={styles.poster}>
                  <span className={styles.avMini}>{swap.posterInitials}</span>
                  {swap.poster}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
