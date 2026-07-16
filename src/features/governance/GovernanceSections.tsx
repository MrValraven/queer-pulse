import { Button, Reveal, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useGovernanceFinances } from "./api/useGovernanceFinances";
import {
  COUNCIL,
  DECISIONS,
  FINANCE_PARTNERS,
  HEALTH,
  PRINCIPLES,
  RESERVE_CURRENT,
  RESERVE_TARGET,
  STEPS,
} from "./governance.data";
import { FinanceLines } from "./GovernanceFinance";
import styles from "./GovernancePage.module.css";

export function HealthSection() {
  const { t } = useTranslation();
  return (
    <Reveal as="section" className={styles.section} id="health">
      <div className={styles.eye}>{t("governance:sections.health.eyebrow")}</div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.health.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.statGrid}>
        {HEALTH.map((s) => (
          <div key={s.labelKey} className={styles.statCard}>
            <div className={styles.statN}>{s.n}</div>
            <div className={styles.statL}>{t(s.labelKey)}</div>
            <div
              className={[
                styles.statTrend,
                s.up ? styles.trendUp : styles.trendOk,
              ].join(" ")}
            >
              {t(s.trendKey, s.trendValues)}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.prose}>
        <p>{t("governance:sections.health.prose1")}</p>
        <p>{t("governance:sections.health.prose2")}</p>
      </div>
    </Reveal>
  );
}

export function ModerationSection() {
  const { t } = useTranslation();
  return (
    <Reveal as="section" className={styles.section} id="moderation">
      <div className={styles.eye}>{t("governance:sections.moderation.eyebrow")}</div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.moderation.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        <p>{t("governance:sections.moderation.intro")}</p>
      </div>
      <div className={styles.steps}>
        {STEPS.map((s, i) => (
          <div key={s.titleKey} className={styles.step}>
            <div className={styles.stepNum}>{i + 1}</div>
            <div>
              <div className={styles.stepTitle}>{t(s.titleKey)}</div>
              <div className={styles.stepText}>{t(s.textKey)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.prose} style={{ marginTop: 16 }}>
        <p>
          <strong>{t("governance:sections.moderation.wontTolerate.label")}</strong>{" "}
          {t("governance:sections.moderation.wontTolerate.text")}
        </p>
      </div>
    </Reveal>
  );
}

export function CouncilSection() {
  const { t } = useTranslation();
  return (
    <Reveal as="section" className={styles.section} id="council">
      <div className={styles.eye}>{t("governance:sections.council.eyebrow")}</div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.council.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        <p>{t("governance:sections.council.intro")}</p>
      </div>
      <div className={styles.acList}>
        {COUNCIL.map((m) => (
          <div key={m.name} className={styles.acItem}>
            <div
              className={styles.acAv}
              style={{ background: m.bg, color: m.color }}
            >
              {m.i}
            </div>
            <div>
              <div className={styles.acName}>{m.name}</div>
              <div className={styles.acRole}>{t(m.roleKey)}</div>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

export function PrinciplesSection() {
  const { t } = useTranslation();
  return (
    <Reveal as="section" className={styles.section} id="principles">
      <div className={styles.eye}>{t("governance:sections.principles.eyebrow")}</div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.principles.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prinList}>
        {PRINCIPLES.map((p) => (
          <div key={p.titleKey} className={styles.prinItem}>
            <span className={styles.prinIcon}>
              <p.icon />
            </span>
            <div>
              <div className={styles.prinTitle}>{t(p.titleKey)}</div>
              <div className={styles.prinText}>{t(p.textKey)}</div>
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
  const { stats, income, expense, eventNotes, loading } =
    useGovernanceFinances();
  const totalIncome = stats.find((s) => s.l === "Total income this quarter")?.n;
  const totalExpense = stats.find((s) => s.l === "Total expenditure")?.n;

  return (
    <Reveal as="section" className={styles.section} id="finances">
      <div className={styles.eye}>{t("governance:sections.finances.eyebrow")}</div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.finances.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        <p>{t("governance:sections.finances.intro")}</p>
      </div>
      <div
        className={styles.statGrid}
        style={{ gridTemplateColumns: "repeat(2,1fr)", marginTop: 24 }}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.statCard} aria-hidden>
                <SkeletonLine width="60%" height={26} />
                <SkeletonLine
                  width="80%"
                  height={13}
                  style={{ marginTop: 8 }}
                />
              </div>
            ))
          : stats.map((s) => (
              <div key={s.l} className={styles.statCard}>
                <div className={styles.statN}>{s.n}</div>
                <div className={styles.statL}>{s.l}</div>
                <div
                  className={[
                    styles.statTrend,
                    s.up ? styles.trendUp : styles.trendOk,
                  ].join(" ")}
                >
                  {s.trend}
                </div>
              </div>
            ))}
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
                amount: totalIncome ?? "",
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
                amount: totalExpense ?? "",
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
          {t("governance:sections.finances.surplusBody", {
            target: fmt.currency(RESERVE_TARGET),
          })}
        </p>
        <div className={styles.reserveBar}>
          <div className={styles.reserveFill} />
        </div>
        <p className={styles.reserveCap}>
          {t("governance:sections.finances.reserveProgress", {
            current: fmt.currency(RESERVE_CURRENT),
            target: fmt.currency(RESERVE_TARGET),
          })}
        </p>
        <p>{t("governance:sections.finances.surplusRedirect")}</p>
      </div>
      {FINANCE_PARTNERS.map((partner) => (
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
    </Reveal>
  );
}

export function DecisionsSection() {
  const { t } = useTranslation();
  return (
    <Reveal as="section" className={styles.section} id="decisions">
      <div className={styles.eye}>{t("governance:sections.decisions.eyebrow")}</div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.decisions.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        {DECISIONS.map((d) => (
          <p key={d.leadKey}>
            <strong>{t(d.leadKey)}</strong> {t(d.bodyKey)}
          </p>
        ))}
      </div>
    </Reveal>
  );
}

export function RaiseSection() {
  const { showToast } = useToast();
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
            showToast(t("governance:sections.raise.submittedToast"), "success");
          }}
        >
          <select className={styles.rcSelect} defaultValue="">
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
          />
          <input
            className={styles.rcInput}
            type="email"
            placeholder={t("governance:sections.raise.emailPlaceholder")}
          />
          <Button type="submit">{t("governance:sections.raise.submitCta")}</Button>
        </form>
      </div>
    </Reveal>
  );
}
