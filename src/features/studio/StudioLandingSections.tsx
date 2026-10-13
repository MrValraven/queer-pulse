import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useScrollReveal } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { SUSTAIN_PRICE } from "./studioShell.data";
import {
  PROMISES,
  PAYOUT_TOTAL,
  COUNTER_STATS,
  COMPARE,
  type CounterStat,
} from "./studioLanding.data";
import { StudioEuroAmount } from "./StudioEuroAmount";
import styles from "./StudioLandingPage.module.css";

export function StudioLandingPromises() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.promises} id="how">
      <div className={styles.promisesH}>
        <div className={styles.ebPlain}>
          {t("studio:landing.promises.eyebrow")}
        </div>
        <h2>
          <Translation
            i18nKey="studio:landing.promises.title"
            components={{ em: <em /> }}
          />
        </h2>
      </div>
      <div className={styles.grid4}>
        {PROMISES.map((p) => (
          <div key={p.num} className={styles.promise}>
            <div className={styles.num}>{p.num}</div>
            <h3>
              <Translation i18nKey={p.titleKey} components={{ em: <em /> }} />
            </h3>
            <p>{t(p.bodyKey, { price: fmt.currency(SUSTAIN_PRICE) })}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** A counter figure in the active locale: "€0.05" / "0,05 €", "80.3%" / "80,3 %". */
function formatCounterStat(stat: CounterStat, fmt: Formatters): string {
  const digits = {
    minimumFractionDigits: stat.fractionDigits ?? 0,
    maximumFractionDigits: stat.fractionDigits ?? 0,
  };
  if (stat.style === "currency") return fmt.currency(stat.value, "EUR", digits);
  if (stat.style === "percent")
    return fmt.number(stat.value / 100, { style: "percent", ...digits });
  return fmt.number(stat.value, digits);
}

const LEDGER_ARTIST_COUNT = 2138;
const LEDGER_CYCLE_COUNT = 5;

export function StudioLandingCounter() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const { t } = useTranslation();
  const fmt = useFormat();
  // The euro mark's side follows the locale: "€" before in EN, " €" after in PT.
  const [euroBefore, euroAfter] = fmt
    .currency(0, "EUR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .split("0");

  return (
    <section className={styles.counter} id="artists">
      <div className={styles.counterInner} ref={ref}>
        <div className={styles.counterEb}>
          <span className={styles.liveJade} />
          {t("studio:landing.counter.liveEyebrow")}
        </div>
        <h2>
          <Translation
            i18nKey="studio:landing.counter.title"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.bigN}>
          {euroBefore}
          <em>
            <RollingNumber
              value={fmt.number(PAYOUT_TOTAL)}
              numericValue={PAYOUT_TOTAL}
              revealFrom={{ value: fmt.number(0), numericValue: 0 }}
              isRevealed={isVisible}
            />
          </em>
          {euroAfter}
        </div>
        <p className={styles.counterSub}>
          {t("studio:landing.counter.sub", {
            count: LEDGER_ARTIST_COUNT,
            cycles: LEDGER_CYCLE_COUNT,
          })}
          <Link to={routes.governance}>
            {t("studio:landing.counter.seeLedgerCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </p>

        <div className={styles.counterStats}>
          {COUNTER_STATS.map((s) => (
            <div key={s.labelKey} className={styles.cs}>
              <div className={styles.v}>
                <em>
                  {formatCounterStat(s, fmt)}
                  {s.unitKey ? ` ${t(s.unitKey)}` : ""}
                </em>
              </div>
              <div className={styles.l}>{t(s.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StudioLandingComparison() {
  const { t } = useTranslation();
  return (
    <section className={styles.compareBand}>
      <div className={styles.compareInner}>
        <div className={styles.compareH}>
          <h2>
            <Translation
              i18nKey="studio:landing.compare.title"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        <div className={styles.compareGrid}>
          {COMPARE.map((c) => (
            <div
              key={c.labelKey}
              className={`${styles.cmp} ${c.us ? styles.cmpUs : ""}`}
            >
              <div className={styles.lbl}>{t(c.labelKey)}</div>
              <div className={styles.v}>
                <em>
                  <StudioEuroAmount value={c.value} />
                </em>
              </div>
              <div className={styles.ctx}>{t(c.ctxKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Studio-on-top add-on price for existing QueerPulse members. */
const STUDIO_ADD_ON_PRICE = 4;

export function StudioLandingCta() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.ctaBand}>
      <h2>
        <Translation
          i18nKey="studio:landing.cta.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p>
        <Translation
          i18nKey="studio:landing.cta.body"
          components={{ em: <em /> }}
          values={{ price: fmt.currency(SUSTAIN_PRICE) }}
        />
      </p>
      <div className={styles.ctaActions}>
        <Button variant="ghost-dark" size="lg" to={routes.studioAbout}>
          {t("studio:landing.cta.readPlanCta")}
        </Button>
      </div>
      <div className={styles.ctaSecondary}>
        <Translation
          i18nKey="studio:landing.cta.secondary"
          components={{ em: <em /> }}
          values={{ addOnPrice: fmt.currency(STUDIO_ADD_ON_PRICE) }}
        />{" "}
        <Link to={routes.signIn}>
          {t("studio:landing.cta.secondaryLink")} <FiArrowRight aria-hidden />
        </Link>
      </div>
    </section>
  );
}
