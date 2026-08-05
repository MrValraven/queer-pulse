import { FiArrowRight } from "react-icons/fi";
import {
  Button,
  Reveal,
  SkeletonLine,
  StatGrid,
  StatTile,
} from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useGovernanceFinances } from "./api/useGovernanceFinances";
import { useGovernanceOverview } from "./api/useGovernanceOverview";
import { FinanceLines } from "./GovernanceFinance";
import styles from "./GovernancePage.module.css";

/**
 * Distinct error/retry state for a governance section. Rendered in place of a
 * section's figures/list when its live fetch fails, so an API error surfaces as
 * "we couldn't load this — try again" instead of a silently-empty grid.
 */
function SectionError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.sectionError} role="alert">
      <p>{t("governance:error.body")}</p>
      <Button variant="ghost" size="md" onClick={onRetry}>
        {t("governance:error.retry")}
      </Button>
    </div>
  );
}

export function HealthSection() {
  const { t } = useTranslation();
  const { health, loading, error, retry } = useGovernanceOverview();
  return (
    <Reveal as="section" className={styles.section} id="health">
      <div className={styles.eye}>
        {t("governance:sections.health.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.health.title"
          components={{ em: <em /> }}
        />
      </h2>
      {error ? (
        <SectionError onRetry={retry} />
      ) : (
      <div className={styles.statGrid}>
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.statCard} aria-hidden>
                <SkeletonLine width="50%" height={26} />
                <SkeletonLine
                  width="80%"
                  height={13}
                  style={{ marginTop: 8 }}
                />
              </div>
            ))
          : health.map((stat) => (
              <div key={stat.labelKey} className={styles.statCard}>
                <div className={styles.statN}>{stat.value}</div>
                <div className={styles.statL}>{t(stat.labelKey)}</div>
                <div
                  className={[
                    styles.statTrend,
                    stat.up ? styles.trendUp : styles.trendOk,
                  ].join(" ")}
                >
                  {t(stat.trendKey, stat.trendValues)}
                </div>
              </div>
            ))}
      </div>
      )}
      <div className={styles.prose}>
        <p>{t("governance:sections.health.prose1")}</p>
        <p>{t("governance:sections.health.prose2")}</p>
      </div>
    </Reveal>
  );
}

export function ModerationSection() {
  const { t } = useTranslation();
  const { moderationSteps, error, retry } = useGovernanceOverview();
  return (
    <Reveal as="section" className={styles.section} id="moderation">
      <div className={styles.eye}>
        {t("governance:sections.moderation.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.moderation.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        <p>{t("governance:sections.moderation.intro")}</p>
      </div>
      {error && <SectionError onRetry={retry} />}
      <div className={styles.steps}>
        {moderationSteps.map((step, index) => (
          <div key={step.titleKey} className={styles.step}>
            <div className={styles.stepNum}>{index + 1}</div>
            <div>
              <div className={styles.stepTitle}>{t(step.titleKey)}</div>
              <div className={styles.stepText}>{t(step.textKey)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.prose} style={{ marginTop: 16 }}>
        <p>
          <strong>
            {t("governance:sections.moderation.wontTolerate.label")}
          </strong>{" "}
          {t("governance:sections.moderation.wontTolerate.text")}
        </p>
      </div>
    </Reveal>
  );
}

export function CouncilSection() {
  const { t } = useTranslation();
  const { council, error, retry } = useGovernanceOverview();
  return (
    <Reveal as="section" className={styles.section} id="council">
      <div className={styles.eye}>
        {t("governance:sections.council.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.council.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        <p>{t("governance:sections.council.intro")}</p>
      </div>
      {error && <SectionError onRetry={retry} />}
      <div className={styles.acList}>
        {council.map((seat) => (
          <div key={seat.name} className={styles.acItem}>
            <div
              className={styles.acAv}
              style={{ background: seat.background, color: seat.color }}
            >
              {seat.initials}
            </div>
            <div>
              <div className={styles.acName}>{seat.name}</div>
              <div className={styles.acRole}>{t(seat.roleKey)}</div>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

export function PrinciplesSection() {
  const { t } = useTranslation();
  const { principles, error, retry } = useGovernanceOverview();
  return (
    <Reveal as="section" className={styles.section} id="principles">
      <div className={styles.eye}>
        {t("governance:sections.principles.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.principles.title"
          components={{ em: <em /> }}
        />
      </h2>
      {error && <SectionError onRetry={retry} />}
      <div className={styles.prinList}>
        {principles.map((principle) => (
          <div key={principle.titleKey} className={styles.prinItem}>
            <span className={styles.prinIcon}>
              <principle.icon />
            </span>
            <div>
              <div className={styles.prinTitle}>{t(principle.titleKey)}</div>
              <div className={styles.prinText}>{t(principle.textKey)}</div>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

export function FinancesSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const {
    stats,
    income,
    expense,
    eventNotes,
    reserve,
    partners,
    incomeTotal,
    expenseTotal,
    loading,
    error,
    retry,
  } = useGovernanceFinances();
  // Column totals come from the structured `incomeTotal`/`expenseTotal` DTO
  // fields, formatted for the active locale — NOT from matching a stat tile's
  // hardcoded English display label. That old `stat.l === "Total income this
  // quarter"` match blanked the totals under localisation or any reworded live
  // report; a stable DTO field can't.
  const totalIncome =
    incomeTotal == null
      ? ""
      : fmt.currency(incomeTotal, "EUR", { maximumFractionDigits: 0 });
  const totalExpense =
    expenseTotal == null
      ? ""
      : fmt.currency(expenseTotal, "EUR", { maximumFractionDigits: 0 });

  return (
    <Reveal as="section" className={styles.section} id="finances">
      <div className={styles.eye}>
        {t("governance:sections.finances.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.finances.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        <p>{t("governance:sections.finances.intro")}</p>
      </div>
      {error ? (
        <SectionError onRetry={retry} />
      ) : (
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
            : stats.map((stat) => (
                <StatTile
                  key={stat.l}
                  value={stat.n}
                  label={stat.l}
                  hint={
                    <span
                      className={stat.up ? styles.trendUp : styles.trendOk}
                    >
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
          <p className={styles.finHint}>
            {t("governance:sections.finances.clickHint")}
          </p>
          {!loading && (
            <FinanceLines
              lines={income}
              color="var(--jade)"
              total={t("governance:sections.finances.totalIncome", {
                amount: totalIncome,
              })}
            />
          )}
        </div>
        <div>
          <div className={styles.finColHead}>
            {t("governance:sections.finances.expenseHeading")}
          </div>
          <p className={styles.finHint}>
            {t("governance:sections.finances.clickHint")}
          </p>
          {!loading && (
            <FinanceLines
              lines={expense}
              color="var(--accent)"
              total={t("governance:sections.finances.totalExpense", {
                amount: totalExpense,
              })}
            />
          )}
        </div>
      </div>

      <div className={styles.eventsCard}>
        <div className={styles.fecTitle}>
          {t("governance:sections.finances.eventsHeading")}
        </div>
        {eventNotes.map((note) => (
          <div key={note.title} className={styles.fecRow}>
            <span className={styles.fecDot} />
            <span>
              <strong>{note.title}</strong> {note.body}
            </span>
          </div>
        ))}
      </div>

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
            <div className={styles.reserveBar}>
              <div className={styles.reserveFill} />
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
      {partners.map((partner) => (
        <div key={partner.name} className={styles.partnerRow}>
          <div className={styles.partnerName}>{partner.name}</div>
          <div className={styles.partnerBody}>
            {t("governance:sections.finances.partnerRestriction", {
              amount: fmt.currency(partner.amount),
              scope: t(partner.scopeKey),
            })}
          </div>
        </div>
      ))}
      <div className={styles.prose}>
        <p>{t("governance:sections.finances.noCorporateFunding")}</p>
      </div>
      </>
      )}
    </Reveal>
  );
}

export function DecisionsSection() {
  const { t } = useTranslation();
  const { decisions, error, retry } = useGovernanceOverview();
  return (
    <Reveal as="section" className={styles.section} id="decisions">
      <div className={styles.eye}>
        {t("governance:sections.decisions.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.decisions.title"
          components={{ em: <em /> }}
        />
      </h2>
      {error && <SectionError onRetry={retry} />}
      <div className={styles.prose}>
        {decisions.map((decision) => (
          <p key={decision.leadKey}>
            <strong>{t(decision.leadKey)}</strong> {t(decision.bodyKey)}
          </p>
        ))}
      </div>
    </Reveal>
  );
}

export function RaiseSection() {
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  return (
    <Reveal as="section" className={styles.section} id="raise">
      <div className={styles.eye}>{t("governance:sections.raise.eyebrow")}</div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.raise.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        <p>{t("governance:sections.raise.intro")}</p>
      </div>
      <div className={styles.raiseCard}>
        <div className={styles.rcTitle}>
          {t("governance:sections.raise.cardTitle")}
        </div>
        <p className={styles.rcText}>
          {t("governance:sections.raise.cardText")}
        </p>
        <form
          className={styles.rcForm}
          onSubmit={(e) => {
            e.preventDefault();
            // No backend concern-intake endpoint exists yet (the governance
            // controller only exposes GET overview/finances). Demo mode keeps
            // the prototype's simulated confirmation; live mode stays honest
            // rather than telling a member we received a concern we can't store.
            if (demoMode) {
              showToast(
                t("governance:sections.raise.submittedToast"),
                "success",
              );
            } else {
              showToast(t("governance:sections.raise.comingSoonToast"), "info");
            }
          }}
        >
          <select
            className={styles.rcSelect}
            defaultValue=""
            aria-label={t("governance:sections.raise.selectPlaceholder")}
          >
            <option value="" disabled>
              {t("governance:sections.raise.selectPlaceholder")}
            </option>
            <option>{t("governance:sections.raise.option.member")}</option>
            <option>{t("governance:sections.raise.option.gathering")}</option>
            <option>{t("governance:sections.raise.option.content")}</option>
            <option>{t("governance:sections.raise.option.appeal")}</option>
            <option>{t("governance:sections.raise.option.other")}</option>
          </select>
          <textarea
            className={styles.rcTextarea}
            placeholder={t("governance:sections.raise.textareaPlaceholder")}
            aria-label={t("governance:sections.raise.textareaPlaceholder")}
          />
          <input
            className={styles.rcInput}
            type="email"
            placeholder={t("governance:sections.raise.emailPlaceholder")}
            aria-label={t("governance:sections.raise.emailPlaceholder")}
          />
          <Button type="submit">
            {t("governance:sections.raise.submitCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </form>
      </div>
    </Reveal>
  );
}
