import { FiZap } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BENEFITS, CURRENCIES, RATE_PER } from "./postJob.data";
import { CheckGrid, SwitchRow } from "./PostJobControls";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

export function PostJobStepPay({ form }: { form: PostJobForm }) {
  const { t } = useTranslation();
  const { state, patch, toggleIn } = form;

  return (
    <>
      <div className={styles.stepHead}>
        <div className={styles.eyebrow}>
          {t("economy:postJob.step3.eyebrow")}
        </div>
        <h1 className={styles.stepTitle}>
          <Translation
            i18nKey="economy:postJob.step3.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.stepSub}>{t("economy:postJob.step3.sub")}</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {t("economy:postJob.step3.rateTitle")}
        </div>
        <div
          className={[styles.rateRow, state.hidePay && styles.rateHidden]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <div className={styles.label}>
              {t("economy:postJob.step3.currency")}
            </div>
            <select
              className={styles.select}
              value={state.currency}
              onChange={(e) => patch({ currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <div className={styles.label}>{t("economy:postJob.step3.min")}</div>
            <input
              className={styles.input}
              type="number"
              value={state.rateMin}
              onChange={(e) => patch({ rateMin: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <div className={styles.label}>
              {t("economy:postJob.step3.max")}{" "}
              <span className={styles.opt}>
                {t("economy:postJob.step3.optAbbrev")}
              </span>
            </div>
            <input
              className={styles.input}
              type="number"
              value={state.rateMax}
              onChange={(e) => patch({ rateMax: e.target.value })}
              placeholder="—"
            />
          </div>
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <div className={styles.label}>{t("economy:postJob.step3.per")}</div>
            <select
              className={styles.select}
              value={state.ratePer}
              onChange={(e) => patch({ ratePer: e.target.value })}
            >
              {RATE_PER.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <SwitchRow
            on={state.hidePay}
            onToggle={() => patch({ hidePay: !state.hidePay })}
            name={t("economy:postJob.step3.hidePay.name")}
            description={t("economy:postJob.step3.hidePay.desc")}
          />
          <SwitchRow
            on={state.barter}
            onToggle={() => patch({ barter: !state.barter })}
            name={t("economy:postJob.step3.barter.name")}
            description={t("economy:postJob.step3.barter.desc")}
          />
        </div>

        <div className={styles.nudge}>
          <span className={styles.nudgeIc} aria-hidden>
            <FiZap size={15} />
          </span>
          <span>
            <Translation
              i18nKey="economy:postJob.step3.nudge"
              components={{ strong: <strong /> }}
            />
          </span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {t("economy:postJob.step3.benefitsTitle")}{" "}
          <span className={styles.muted}>
            · {t("economy:postJob.field.optional")}
          </span>
        </div>
        <div className={styles.cardSub}>
          {t("economy:postJob.step3.benefitsSub")}
        </div>
        <CheckGrid
          options={BENEFITS}
          selected={state.benefits}
          onToggle={(v) => toggleIn("benefits", v)}
        />
      </div>
    </>
  );
}
