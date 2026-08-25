import { useId, useState } from "react";
import { FiZap, FiSettings, FiArrowRight } from "react-icons/fi";
import { FadeIn, Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SUMMARY, PAYOUTS, BREAKDOWN } from "./studioPayouts.data";
import {
  PayoutRowSkeleton,
  BreakdownRowSkeleton,
} from "./StudioPayoutsSkeletons";
import s from "./creator.module.css";

// Content: the mock SEPA bank account's masked IBAN — comes from the
// artist's payout method record in live mode.
const SEPA_MASKED_IBAN = "LU 82 0019 … 1844 3700";

export function PayoutsHero() {
  const { t } = useTranslation();
  return (
    <section className={s.hero}>
      <div
        className={s.heroInner}
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 40,
          alignItems: "end",
        }}
      >
        <div>
          <div className={s.eb}>{t("studio:payouts.hero.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:payouts.hero.title"
              components={{ em: <em /> }}
              values={{ amount: "€2,140", day: 5 }}
            />
          </h1>
          <div
            className="sub"
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 17,
              color: "rgba(247,243,238,.62)",
              marginTop: 14,
            }}
          >
            {t("studio:payouts.hero.sub")}
          </div>
        </div>
        <div className={s.sideCard} style={{ minWidth: 0 }}>
          <div className={s.sideEb}>
            {t("studio:payouts.hero.breakdownEyebrow", { month: "July" })}
          </div>
          {SUMMARY.map((line) => (
            <div key={line.labelKey} className={s.ln}>
              <span>{t(line.labelKey)}</span>
              <span
                className="v2"
                style={{ fontFamily: "var(--serif)", color: "var(--text)" }}
              >
                €
                <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
                  {line.v}
                </em>
              </span>
            </div>
          ))}
          <div className={s.ln}>
            <span>{t("studio:payouts.summary.splitsRouted")}</span>
            <span
              className="v2"
              style={{ fontFamily: "var(--serif)", color: "var(--text40)" }}
            >
              −€<em style={{ fontStyle: "normal" }}>198</em>
            </span>
          </div>
          <div className={s.ln}>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>
              {t("studio:payouts.summary.toYourIban")}
            </span>
            <span
              className="v2"
              style={{ fontFamily: "var(--serif)", fontSize: 18 }}
            >
              €
              <em style={{ fontStyle: "normal", color: "var(--jade-light)" }}>
                2,140
              </em>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PayoutsList({
  loading,
  onExport,
}: {
  loading: boolean;
  onExport: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={s.col}>
      <div className={s.card}>
        <div className={s.cardH}>
          <h3>
            <Translation
              i18nKey="studio:payouts.list.heading"
              components={{ em: <em /> }}
            />
          </h3>
          <button
            type="button"
            className={s.allLink}
            onClick={() => {
              onExport();
            }}
          >
            {t("studio:payouts.list.exportCsv")} <FiArrowRight aria-hidden />
          </button>
        </div>
        {loading
          ? Array.from({ length: PAYOUTS.length }).map((_, skeletonIndex) => (
              <PayoutRowSkeleton key={skeletonIndex} />
            ))
          : PAYOUTS.map((payout, payoutIndex) => (
              <FadeIn key={payout.m} delay={Math.min(payoutIndex, 8) * 60}>
                <div className={s.payRow}>
                  <div className={s.payDate}>
                    <div
                      className="d"
                      style={{
                        fontFamily: "var(--serif)",
                        fontWeight: 300,
                        fontSize: 26,
                        color: "var(--text)",
                        lineHeight: 1,
                      }}
                    >
                      {payout.d}
                    </div>
                    <div
                      className="m"
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                      }}
                    >
                      {payout.m}
                    </div>
                  </div>
                  <div>
                    <h5>{payout.title}</h5>
                    <div className={s.payMeta}>{payout.meta}</div>
                  </div>
                  <div className={s.payAmt}>
                    €<em>{payout.amt}</em>
                  </div>
                  <span
                    className={`${s.payStatus} ${payout.status === "pending" ? s.statusPending : s.statusPaid}`}
                  >
                    {payout.status === "pending"
                      ? t("studio:payouts.list.status.pending")
                      : t("studio:payouts.list.status.paid")}
                  </span>
                </div>
              </FadeIn>
            ))}
      </div>

      <div className={s.card}>
        <div className={s.cardH}>
          <h3>
            <Translation
              i18nKey="studio:payouts.breakdown.heading"
              components={{ em: <em /> }}
            />
          </h3>
          <div
            className="sub"
            style={{
              fontSize: 12.5,
              color: "var(--text40)",
              width: "100%",
            }}
          >
            {t("studio:payouts.breakdown.rateNote")}
          </div>
        </div>
        {loading
          ? Array.from({ length: BREAKDOWN.length }).map((_, skeletonIndex) => (
              <BreakdownRowSkeleton key={skeletonIndex} />
            ))
          : BREAKDOWN.map((breakdownRow, breakdownIndex) => (
              <FadeIn
                key={breakdownIndex}
                delay={Math.min(breakdownIndex, 8) * 60}
              >
                <div className={s.bdRow}>
                  <span
                    className="n"
                    style={{
                      fontFamily: "monospace",
                      color: "var(--text40)",
                      fontSize: 12,
                    }}
                  >
                    {breakdownRow.n}
                  </span>
                  <span
                    className="nm"
                    style={{
                      color: "var(--text)",
                      fontFamily: "var(--serif)",
                      fontSize: 14,
                    }}
                  >
                    {breakdownRow.nm}
                  </span>
                  <span
                    className="plays"
                    style={{ color: "var(--text60)", whiteSpace: "nowrap" }}
                  >
                    {breakdownRow.plays}
                  </span>
                  <span
                    className="rate"
                    style={{ color: "var(--text40)", fontSize: 12 }}
                  >
                    @ €0.05
                  </span>
                  <span
                    className="bdTotal"
                    style={{
                      fontFamily: "var(--serif)",
                      color: "var(--text)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    €
                    <em
                      style={{
                        fontStyle: "normal",
                        color: "var(--accent)",
                      }}
                    >
                      {breakdownRow.total}
                    </em>
                  </span>
                </div>
              </FadeIn>
            ))}
        <div className={s.bdFoot}>
          <span>{t("studio:payouts.breakdown.subtotalLabel")}</span>
          <span
            className="v"
            style={{
              fontFamily: "var(--serif)",
              fontSize: 18,
              color: "var(--text)",
            }}
          >
            €
            <em style={{ fontStyle: "normal", color: "var(--jade-light)" }}>
              1,820.00
            </em>
          </span>
        </div>
      </div>
    </div>
  );
}

export function PayoutsSidebar() {
  const { t } = useTranslation();
  const fieldId = useId();
  const [threshold, setThreshold] = useState("5");
  return (
    <div className={s.col}>
      <div className={s.sideCard}>
        <div className={s.sideEb}>
          {t("studio:payouts.sidebar.methodEyebrow")}
        </div>
        <h4>
          <Translation
            i18nKey="studio:payouts.sidebar.methodHeading"
            components={{ em: <em /> }}
          />
        </h4>
        <div className={s.method}>
          <span className={s.methodIc}>€</span>
          <span className={s.methodNm}>
            {t("studio:payouts.sidebar.method.sepa.label")}
            <small>{SEPA_MASKED_IBAN}</small>
          </span>
          <span className={s.methodBadge}>
            {t("studio:payouts.sidebar.method.sepa.badge")}
          </span>
        </div>
        <div className={s.method}>
          <span className={`${s.methodIc} ${s.methodIcAlt}`}>
            <FiZap />
          </span>
          <span className={s.methodNm}>
            {t("studio:payouts.sidebar.method.stripe.label")}
            <small>{t("studio:payouts.sidebar.method.stripe.hint")}</small>
          </span>
          <span className={s.methodSwitch}>
            {t("studio:payouts.sidebar.method.stripe.switchCta")}
          </span>
        </div>
        <div className={s.method}>
          <span className={`${s.methodIc} ${s.methodIcAlt}`}>
            <FiSettings />
          </span>
          <span className={s.methodNm}>
            {t("studio:payouts.sidebar.method.coopCredit.label")}
            <small>{t("studio:payouts.sidebar.method.coopCredit.hint")}</small>
          </span>
          <span className={s.methodSwitch}>
            {t("studio:payouts.sidebar.method.coopCredit.addCta")}
          </span>
        </div>
      </div>

      <div className={s.sideCard}>
        <div className={s.cardH}>
          <h3>
            <Translation
              i18nKey="studio:payouts.preferences.heading"
              components={{ em: <em /> }}
            />
          </h3>
        </div>
        <div className={s.field}>
          <label htmlFor={`${fieldId}-threshold`}>
            {t("studio:payouts.preferences.threshold.label")}
          </label>
          <Select
            id={`${fieldId}-threshold`}
            options={[
              {
                value: "5",
                label: t("studio:payouts.preferences.threshold.opt5"),
              },
              {
                value: "20",
                label: t("studio:payouts.preferences.threshold.opt20"),
              },
              {
                value: "100",
                label: t("studio:payouts.preferences.threshold.opt100"),
              },
            ]}
            value={threshold}
            onChange={(value) => setThreshold(value ?? "5")}
          />
          <span className={s.fhint}>
            {t("studio:payouts.preferences.threshold.hint")}
          </span>
        </div>
        <div className={s.field}>
          <label htmlFor={`${fieldId}-tax`}>
            {t("studio:payouts.preferences.taxResidency.label")}
          </label>
          <input
            id={`${fieldId}-tax`}
            type="text"
            defaultValue="Portugal · NIF on file"
          />
          <span className={s.fhint}>
            {t("studio:payouts.preferences.taxResidency.hint")}
          </span>
        </div>
        <div className={s.field}>
          <label htmlFor={`${fieldId}-email`}>
            {t("studio:payouts.preferences.notificationEmail.label")}
          </label>
          <input
            id={`${fieldId}-email`}
            type="email"
            defaultValue="mariana@queerpulse.org"
          />
        </div>
      </div>
    </div>
  );
}
