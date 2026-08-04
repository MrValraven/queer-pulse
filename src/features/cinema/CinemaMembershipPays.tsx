import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PATRON_POOL_SHARE, TIERS, LEDGER } from "./cinemaMembership.data";
import styles from "./CinemaMembershipPage.module.css";

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function Cross() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      aria-hidden
    >
      <line x1={18} y1={6} x2={6} y2={18} />
      <line x1={6} y1={6} x2={18} y2={18} />
    </svg>
  );
}

export function CinemaMembershipTiers() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.tiers}>
      <div className="wrap">
        <div className={styles.tiersGrid}>
          {TIERS.map((tier) => {
            const values = {
              price:
                tier.priceValue != null ? fmt.currency(tier.priceValue) : "",
              poolShare: fmt.currency(PATRON_POOL_SHARE),
            };
            return (
              <div
                key={tier.nameKey}
                className={[styles.tier, tier.featured && styles.featured]
                  .filter(Boolean)
                  .join(" ")}
              >
                {tier.badgeKey && (
                  <div className={styles.tierBadge}>{t(tier.badgeKey)}</div>
                )}
                <div className={styles.tierTag}>{t(tier.tagKey)}</div>
                <div className={styles.tierName}>
                  <Translation
                    i18nKey={tier.nameKey}
                    components={{ em: <em /> }}
                  />
                </div>
                <div className={styles.tierPrice}>
                  <span className={styles.amount}>{tier.amount}</span>
                  <span className={styles.per}>{tier.per}</span>
                </div>
                <div className={styles.tierDesc}>{t(tier.descKey, values)}</div>
                <div className={styles.features}>
                  {tier.features.map((f) => (
                    <div
                      key={f.textKey}
                      className={[
                        styles.tf,
                        f.yes ? styles.yes : styles.no,
                      ].join(" ")}
                    >
                      {f.yes ? <Check /> : <Cross />}
                      <span>{t(f.textKey, values)}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.tierAction}>
                  <Button variant={tier.ctaVariant} to={tier.ctaTo}>
                    {t(tier.ctaKey, values)}
                  </Button>
                  {tier.noteKey && (
                    <div className={styles.tierNote}>{t(tier.noteKey)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CinemaMembershipPays() {
  const { t } = useTranslation();
  return (
    <section className={styles.pays}>
      <div className="wrap">
        <div className={styles.paysH}>
          <h2>
            <Translation
              i18nKey="cinema:membership.pays.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className="sub">{t("cinema:membership.pays.sub")}</p>
        </div>
        <div className={styles.paysGrid}>
          <div className={styles.payCard}>
            <div className={`${styles.pcIcon} coral`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
              >
                <rect x={2} y={3} width={20} height={14} rx={2} />
                <polyline points="8 21 12 17 16 21" />
              </svg>
            </div>
            <div className={styles.pcTitle}>
              <Translation
                i18nKey="cinema:membership.pays.filmmakers.title"
                components={{ em: <em /> }}
              />
            </div>
            <div className={styles.pcBody}>
              {t("cinema:membership.pays.filmmakers.body")}
            </div>
            <div className={styles.pcNum}>
              €<em>8,420</em>
            </div>
            <div className={styles.pcNumSub}>
              {t("cinema:membership.pays.filmmakers.numSub")}
            </div>
          </div>
          <div className={styles.payCard}>
            <div className={`${styles.pcIcon} jade`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className={styles.pcTitle}>
              <Translation
                i18nKey="cinema:membership.pays.commissioning.title"
                components={{ em: <em /> }}
              />
            </div>
            <div className={styles.pcBody}>
              {t("cinema:membership.pays.commissioning.body")}
            </div>
            <div className={styles.pcNum}>
              €<em>13.2k</em>
            </div>
            <div className={styles.pcNumSub}>
              {t("cinema:membership.pays.commissioning.numSub")}
            </div>
          </div>
          <div className={styles.payCard}>
            <div className={`${styles.pcIcon} plum`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx={9} cy={7} r={4} />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              </svg>
            </div>
            <div className={styles.pcTitle}>
              <Translation
                i18nKey="cinema:membership.pays.curators.title"
                components={{ em: <em /> }}
              />
            </div>
            <div className={styles.pcBody}>
              {t("cinema:membership.pays.curators.body")}
            </div>
            <div className={styles.pcNum}>
              <em>6</em>
            </div>
            <div className={styles.pcNumSub}>
              {t("cinema:membership.pays.curators.numSub")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CinemaMembershipLedger() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const ledgerMonth = fmt.date(new Date(2026, 5, 1), {
    month: "long",
    year: "numeric",
  });
  return (
    <section className={styles.ledger}>
      <div className="wrap">
        <div className={styles.ledgerLabel}>
          {t("cinema:membership.ledger.label", { month: ledgerMonth })}
        </div>
        <div className={styles.ledgerInner}>
          {LEDGER.map((l) => (
            <div key={l.labelKey} className={styles.ls}>
              <div className="k">{t(l.labelKey)}</div>
              <div className="v">
                {l.v.includes("€") ? (
                  <>
                    €<em>{l.v.replace("€", "")}</em>
                  </>
                ) : (
                  <em>{l.v}</em>
                )}
              </div>
              <div className="note">{t(l.noteKey)}</div>
            </div>
          ))}
        </div>
        <div className={styles.ledgerFoot}>
          <Link to={routes.governance}>
            {t("cinema:membership.ledger.fullAccountsCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
