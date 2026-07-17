import { forwardRef, useEffect, useState } from "react";
import { FiArrowRight, FiCheck, FiLock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SustainerControls } from "./SustainerControls";
import { TierCard } from "./TierCard";
import { currencySymbol } from "./useSustainer";
import { TIER_LABEL_KEYS } from "./sustainer.pricing";
import type { SustainerStore } from "./useSustainer";
import type { TierIndex } from "./sustainer.pricing";
import type { TFunction } from "../../shared/i18n/types";
import styles from "./sustainer.module.css";

const TIERS: TierIndex[] = [0, 1, 2];

const FREQ_ADVERB_KEY: Record<SustainerStore["freq"], string> = {
  monthly: "support:tiers.freqAdverb.monthly",
  annual: "support:tiers.freqAdverb.annual",
  once: "support:tiers.freqAdverb.once",
};

/** Helper line under the custom-amount field, framing the equivalent figure. */
function customHelp(
  t: TFunction,
  store: SustainerStore,
  amount: number,
): string {
  if (store.freq === "monthly")
    return t("support:tiers.customHelp.perYear", {
      amount: store.money(amount * 12),
    });
  if (store.freq === "annual")
    return t("support:tiers.customHelp.perMonth", {
      amount: store.money(Math.round(amount / 12)),
    });
  return t("support:tiers.customHelp.onceNote");
}

/** The amount-picker: frequency + currency controls, tier cards, custom amount,
 * the continue CTA, and the gift / pay-it-forward options. */
export const SustainerTiers = forwardRef<
  HTMLDivElement,
  { store: SustainerStore; onContinue: () => void }
>(({ store, onContinue }, ref) => {
  const { t } = useTranslation();
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState(false);

  // Clear the custom field whenever a tier is chosen elsewhere.
  useEffect(() => {
    if (store.selType === "tier") setRaw("");
  }, [store.selType, store.tier]);

  const ctaNameKey =
    store.selectedName === "Custom"
      ? "support:tiers.yourAmount"
      : TIER_LABEL_KEYS[store.selectedName as keyof typeof TIER_LABEL_KEYS];

  function handleContinue() {
    if (store.selType === "custom" && (!store.custom || store.custom < 1)) {
      setErr(true);
      return;
    }
    onContinue();
  }

  return (
    <>
      <h2 className={styles.secHead}>
        <Translation
          i18nKey="support:tiers.heading"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.secSub}>{t("support:tiers.sub")}</p>

      <div ref={ref}>
        <SustainerControls store={store} />
      </div>

      <div className={styles.tiersRow}>
        {TIERS.map((i) => (
          <TierCard key={i} index={i} store={store} />
        ))}
      </div>

      <div className={styles.customRow}>
        <div className={styles.customInputWrap}>
          <div className={styles.customEur}>{currencySymbol(store.cur)}</div>
          <input
            className={styles.customInput}
            type="number"
            inputMode="decimal"
            placeholder={t("support:tiers.customAmountPlaceholder")}
            min={1}
            aria-label={t("support:tiers.customAmountAriaLabel")}
            value={raw}
            onChange={(e) => {
              const next = e.target.value;
              setRaw(next);
              setErr(false);
              const v = parseFloat(next);
              store.setCustom(Number.isFinite(v) ? v : null);
            }}
          />
        </div>
        <div className={styles.customText}>
          {t("support:tiers.customText", {
            freq: t(FREQ_ADVERB_KEY[store.freq]),
          })}
        </div>
      </div>
      {store.selType === "custom" && store.custom ? (
        <div className={styles.customHelp}>
          {customHelp(t, store, store.custom)}
        </div>
      ) : (
        <div className={styles.customHelp} />
      )}
      {err && (
        <div className={styles.customErr}>
          {t("support:tiers.customErr", { sym: currencySymbol(store.cur) })}
        </div>
      )}

      <div className={styles.continueRow}>
        <Button variant="primary" size="lg" onClick={handleContinue}>
          {t("support:tiers.continueCta", { name: t(ctaNameKey) })}{" "}
          <FiArrowRight aria-hidden />
        </Button>
        <span className={styles.chargeNote}>
          <FiLock size={15} aria-hidden />
          {t("support:tiers.chargeNote")}
        </span>
      </div>

      <div className={styles.optsBlock}>
        <button
          type="button"
          className={`${styles.optRow} ${styles.optSolid}`}
          onClick={store.toggleSolid}
          aria-pressed={store.solid}
        >
          <span
            className={`${styles.optCheck} ${store.solid ? styles.on : ""}`}
            aria-hidden
          >
            <FiCheck size={12} />
          </span>
          <span className={styles.optLabel}>
            <Translation
              i18nKey="support:tiers.solidOpt.title"
              values={{ amount: store.money(store.solidAmount) }}
              components={{ amt: <span className={styles.solidAmt} /> }}
            />
            <span>{t("support:tiers.solidOpt.detail")}</span>
          </span>
        </button>

        <button
          type="button"
          className={`${styles.optRow} ${styles.optGift}`}
          onClick={store.toggleGift}
          aria-pressed={store.gift}
        >
          <span
            className={`${styles.optCheck} ${store.gift ? styles.on : ""}`}
            aria-hidden
          >
            <FiCheck size={12} />
          </span>
          <span className={styles.optLabel}>
            {t("support:tiers.giftOpt.title")}
            <span>{t("support:tiers.giftOpt.detail")}</span>
          </span>
        </button>
      </div>
    </>
  );
});
SustainerTiers.displayName = "SustainerTiers";
