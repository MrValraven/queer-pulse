import {
  Reveal,
  SkeletonLine,
  StatGrid,
  StatTile,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  useGovernanceFinances,
  type GovernanceFinancesResult,
} from "./api/useGovernanceFinances";
import { FinanceLines } from "./GovernanceFinance";
import { SectionError } from "./GovernanceSections";
import { parseQuarter } from "./governanceQuarter";
import styles from "./GovernancePage.module.css";

/**
 * PRD-447. The quarterly finance report on the public Governance page.
 *
 * The period in the eyebrow comes from the report itself. While the backend
 * has no report whose figures the governance team entered, it answers with an
 * empty report, and this section keeps its heading (the side nav links here)
 * with one line saying the first quarter is still to come.
 */
export function FinancesSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const finances = useGovernanceFinances();
  const { loading, error, retry, isPublished, provenance } = finances;
  const period = parseQuarter(finances.quarter);
  const isEmpty = !loading && !error && !isPublished;

  return (
    <Reveal as="section" className={styles.section} id="finances">
      <div className={styles.eye}>
        {period
          ? t("governance:sections.finances.eyebrowPeriod", {
              period: t("governance:sections.finances.quarterLabel", period),
            })
          : t("governance:sections.finances.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.finances.title"
          components={{ em: <em /> }}
        />
      </h2>
      {isEmpty ? (
        <p className={styles.acEmpty}>
          {t("governance:sections.finances.notPublished")}
        </p>
      ) : (
        <>
          <div className={styles.prose}>
            <p>{t("governance:sections.finances.intro")}</p>
            {provenance && (
              <p className={styles.finHint}>
                {t("governance:sections.finances.provenance", {
                  date: fmt.date(new Date(provenance.enteredAt)),
                })}
              </p>
            )}
          </div>
          {error ? (
            <SectionError onRetry={retry} />
          ) : (
            <FinanceReport finances={finances} />
          )}
        </>
      )}
    </Reveal>
  );
}

/** The figures themselves: tiles, both ledgers, event notes, reserve and
 *  disclosed partners. */
function FinanceReport({ finances }: { finances: GovernanceFinancesResult }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { stats, income, expense, eventNotes, loading } = finances;
  // "Click any row" only where a row has a breakdown to open.
  const hasBreakdown = [...income, ...expense].some(
    (line) => line.items.length > 0,
  );
  // Column totals come from the structured `incomeTotal`/`expenseTotal` DTO
  // fields, formatted for the active locale. A stable DTO field survives
  // localisation and a reworded live report.
  const formatTotal = (total: number | null) =>
    total == null
      ? ""
      : fmt.currency(total, "EUR", { maximumFractionDigits: 0 });

  return (
    <>
      <div style={{ marginTop: 24 }}>
        <StatGrid columns={2}>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <StatTile
                  key={index}
                  value={<SkeletonLine width="60%" height={26} />}
                  label={<SkeletonLine width="80%" height={13} />}
                />
              ))
            : stats.map((stat, index) => (
                <StatTile
                  key={`${index}-${stat.l}`}
                  value={stat.n}
                  label={stat.l}
                  hint={
                    <span className={stat.up ? styles.trendUp : styles.trendOk}>
                      {stat.trend}
                    </span>
                  }
                />
              ))}
        </StatGrid>
      </div>
      <div className={styles.finCols}>
        <div>
          <div className={styles.finColHead}>
            {t("governance:sections.finances.incomeHeading")}
          </div>
          {hasBreakdown && (
            <p className={styles.finHint}>
              {t("governance:sections.finances.clickHint")}
            </p>
          )}
          {!loading && (
            <FinanceLines
              lines={income}
              color="var(--jade)"
              total={t("governance:sections.finances.totalIncome", {
                amount: formatTotal(finances.incomeTotal),
              })}
            />
          )}
        </div>
        <div>
          <div className={styles.finColHead}>
            {t("governance:sections.finances.expenseHeading")}
          </div>
          {hasBreakdown && (
            <p className={styles.finHint}>
              {t("governance:sections.finances.clickHint")}
            </p>
          )}
          {!loading && (
            <FinanceLines
              lines={expense}
              color="var(--accent)"
              total={t("governance:sections.finances.totalExpense", {
                amount: formatTotal(finances.expenseTotal),
              })}
            />
          )}
        </div>
      </div>

      {eventNotes.length > 0 && (
        <div className={styles.eventsCard}>
          <div className={styles.fecTitle}>
            {t("governance:sections.finances.eventsHeading")}
          </div>
          {eventNotes.map((note, index) => (
            <div key={`${index}-${note.title}`} className={styles.fecRow}>
              <span className={styles.fecDot} />
              <span>
                <strong>{note.title}</strong> {note.body}
              </span>
            </div>
          ))}
        </div>
      )}

      <FinanceReserveAndPartners finances={finances} />
    </>
  );
}

/** The surplus policy, the reserve bar and the disclosed partners. */
function FinanceReserveAndPartners({
  finances,
}: {
  finances: GovernanceFinancesResult;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reserve, partners } = finances;
  // How full the operational reserve actually is, clamped to 0–100 so a
  // target of 0 or an over-funded reserve can't produce a broken bar.
  const reservePercent =
    reserve && reserve.target > 0
      ? Math.min(100, Math.max(0, (reserve.current / reserve.target) * 100))
      : 0;

  return (
    <>
      <div className={styles.prose} style={{ marginTop: 28 }}>
        <p>
          <strong>{t("governance:sections.finances.surplusHeading")}</strong>{" "}
          {reserve &&
            t("governance:sections.finances.surplusBody", {
              target: fmt.currency(reserve.target),
            })}
        </p>
        {reserve && (
          <>
            <div
              className={styles.reserveBar}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={reserve.target}
              aria-valuenow={Math.min(reserve.current, reserve.target)}
              aria-label={t("governance:sections.finances.reserveBarAria")}
            >
              <div
                className={styles.reserveFill}
                style={{ width: `${reservePercent}%` }}
              />
            </div>
            <p className={styles.reserveCap}>
              {t("governance:sections.finances.reserveProgress", {
                current: fmt.currency(reserve.current),
                target: fmt.currency(reserve.target),
              })}
            </p>
          </>
        )}
        <p>{t("governance:sections.finances.surplusRedirect")}</p>
      </div>
      {partners.map((partner, index) => (
        <div key={`${index}-${partner.name}`} className={styles.partnerRow}>
          <div className={styles.partnerName}>{partner.name}</div>
          <div className={styles.partnerBody}>
            {t("governance:sections.finances.partnerRestriction", {
              amount: fmt.currency(partner.amount),
              // An authored partner carries the governance team's own words;
              // an older seeded one carries an i18n key.
              scope:
                partner.scope ?? (partner.scopeKey ? t(partner.scopeKey) : ""),
            })}
          </div>
        </div>
      ))}
      <div className={styles.prose}>
        <p>{t("governance:sections.finances.noCorporateFunding")}</p>
      </div>
    </>
  );
}
