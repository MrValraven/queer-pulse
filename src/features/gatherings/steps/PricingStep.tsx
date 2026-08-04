import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GatheringForm } from "../useGatheringForm";
import styles from "../CreateGatheringPage.module.css";

export function PricingStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step4.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step4.sub")}</p>
      <div
        className={styles.freeToggle}
        onClick={() => form.setFree(!form.free)}
        role="checkbox"
        aria-checked={form.free}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            form.setFree(!form.free);
          }
        }}
      >
        <div
          className={[styles.freeCheck, form.free && styles.freeCheckOn]
            .filter(Boolean)
            .join(" ")}
        >
          {form.free ? <FiCheck /> : ""}
        </div>
        <div>
          <div className={styles.freeLabel}>
            {t("gatherings:create.step4.freeLabel")}
          </div>
        </div>
      </div>
      {!form.free && (
        <div>
          <p className={styles.hint}>
            {t("gatherings:create.step4.tiersHint")}
          </p>
          <div className={styles.tierHead}>
            <span />
            <span className={styles.tierColHead}>
              {t("gatherings:create.step4.priceColHead")}
            </span>
            <span className={styles.tierColHead}>
              {t("gatherings:create.step4.spotsColHead")}
            </span>
            <span />
          </div>
          <div className={styles.tierRow}>
            <span className={styles.tierLabel}>
              {t("gatherings:create.step4.tier.solidarity.name")}
            </span>
            <div className={styles.moneyCell}>
              <span className={styles.moneyPrefix}>€</span>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                value={form.solPrice}
                onChange={(e) => form.setSolPrice(e.target.value)}
                aria-label={t(
                  "gatherings:create.step4.tier.solidarity.priceAria",
                )}
              />
            </div>
            <div className={styles.spotsCell}>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                value={form.solSpots}
                onChange={(e) => form.setSolSpots(e.target.value)}
                aria-label={t(
                  "gatherings:create.step4.tier.solidarity.spotsAria",
                )}
              />
              <span className={styles.spotsSuffix}>
                {t("gatherings:create.step4.spotsSuffix")}
              </span>
            </div>
            <span />
          </div>
          <div className={styles.tierNote}>
            {t("gatherings:create.step4.tier.solidarity.note")}
          </div>
          <div className={styles.tierRow}>
            <span className={styles.tierLabel}>
              {t("gatherings:create.step4.tier.standard.name")}
            </span>
            <div className={styles.moneyCell}>
              <span className={styles.moneyPrefix}>€</span>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                value={form.stdPrice}
                onChange={(e) => form.setStdPrice(e.target.value)}
                aria-label={t(
                  "gatherings:create.step4.tier.standard.priceAria",
                )}
              />
            </div>
            <div className={styles.spotsCell}>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                value={form.stdSpots}
                onChange={(e) => form.setStdSpots(e.target.value)}
                aria-label={t(
                  "gatherings:create.step4.tier.standard.spotsAria",
                )}
              />
              <span className={styles.spotsSuffix}>
                {t("gatherings:create.step4.spotsSuffix")}
              </span>
            </div>
            <span />
          </div>
          <div className={styles.tierRow}>
            <span className={styles.tierLabel}>
              {t("gatherings:create.step4.tier.supporter.name")}
            </span>
            <div className={styles.moneyCell}>
              <span className={styles.moneyPrefix}>€</span>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                value={form.supPrice}
                onChange={(e) => form.setSupPrice(e.target.value)}
                aria-label={t(
                  "gatherings:create.step4.tier.supporter.priceAria",
                )}
              />
            </div>
            <div className={styles.spotsCell}>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                value={form.supSpots}
                onChange={(e) => form.setSupSpots(e.target.value)}
                aria-label={t(
                  "gatherings:create.step4.tier.supporter.spotsAria",
                )}
              />
              <span className={styles.spotsSuffix}>
                {t("gatherings:create.step4.spotsSuffix")}
              </span>
            </div>
            <span />
          </div>
          <p className={styles.hint} style={{ marginTop: 8 }}>
            {t("gatherings:create.step4.tier.supporterHint")}
          </p>
        </div>
      )}
      <label
        className={styles.label}
        style={{ marginTop: 4 }}
        htmlFor={`${fieldId}-included`}
      >
        {t("gatherings:create.step4.includedLabel")}
      </label>
      <input
        id={`${fieldId}-included`}
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step4.includedPlaceholder")}
        value={form.included}
        onChange={(e) => form.setIncluded(e.target.value)}
      />
      <label className={styles.label} htmlFor={`${fieldId}-bring`}>
        {t("gatherings:create.step4.bringLabel")}
      </label>
      <input
        id={`${fieldId}-bring`}
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step4.bringPlaceholder")}
        value={form.bring}
        onChange={(e) => form.setBring(e.target.value)}
      />
    </div>
  );
}
