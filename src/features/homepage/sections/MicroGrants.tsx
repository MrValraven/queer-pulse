import { Button, Reveal, SectionHead } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useScrollReveal } from "../../../shared/hooks/useScrollReveal";
import { useCountUp } from "../../../shared/hooks/useCountUp";
import { routes } from "../../../app/routeMap";
import { grantItems, grantStats } from "../data/grants";
import type { GrantStat } from "../data/types";
import styles from "./MicroGrants.module.css";

function StatTile({ stat }: { stat: GrantStat }) {
  const { t } = useTranslation();
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const count = useCountUp(stat.countTo ?? 0, { active: isVisible });
  const display = stat.countTo
    ? `${stat.prefix ?? ""}${count.toLocaleString("en-US")}${stat.suffix ?? ""}`
    : stat.value;

  return (
    <div className={styles.stat} ref={ref}>
      <div className={styles.statValue}>{display}</div>
      <div className={styles.statLabel}>{t(stat.labelKey)}</div>
    </div>
  );
}

export function MicroGrants() {
  const { t } = useTranslation();

  return (
    <section className={styles.grants} id="grants">
      <div className="wrap">
        <Reveal>
          <SectionHead
            title={
              <Translation
                i18nKey="homepage:microGrants.title"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("homepage:microGrants.subtitle")}
            action={
              <Button variant="ghost" to={routes.grants}>
                {t("homepage:microGrants.seeFundCta")}
              </Button>
            }
          />
        </Reveal>

        <Reveal className={styles.stats}>
          {grantStats.map((stat) => (
            <StatTile key={stat.labelKey} stat={stat} />
          ))}
        </Reveal>

        <div className={styles.list}>
          {grantItems.map((grant, index) => (
            <Reveal key={grant.title} className={styles.row} delay={index * 50}>
              <div className={styles.amount}>{grant.amount}</div>
              <div className={styles.info}>
                <h4>{grant.title}</h4>
                <p>{grant.description}</p>
              </div>
              <div className={styles.who}>{grant.who}</div>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.cta}>
          <Button to={`${routes.grants}#apply`}>
            {t("homepage:microGrants.applyCta")}
          </Button>
          <Button variant="ghost" to={`${routes.grants}#contribute`}>
            {t("homepage:microGrants.contributeCta")}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
