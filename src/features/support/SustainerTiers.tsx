import { forwardRef, useEffect, useState } from "react";
import { FiArrowRight, FiCheck, FiLock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { SustainerControls } from "./SustainerControls";
import { TierCard } from "./TierCard";
import { currencySymbol } from "./useSustainer";
import { money } from "./sustainer.pricing";
import type { SustainerStore } from "./useSustainer";
import type { TierIndex } from "./sustainer.pricing";
import styles from "./sustainer.module.css";

const TIERS: TierIndex[] = [0, 1, 2];

/** Helper line under the custom-amount field, framing the equivalent figure. */
function customHelp(store: SustainerStore, amount: number): string {
  if (store.freq === "monthly")
    return `= ${money(store.cur, amount * 12)} per year`;
  if (store.freq === "annual")
    return `≈ ${money(store.cur, Math.round(amount / 12))} per month`;
  return "A one-time contribution";
}

/** The amount-picker: frequency + currency controls, tier cards, custom amount,
 * the continue CTA, and the gift / pay-it-forward options. */
export const SustainerTiers = forwardRef<
  HTMLDivElement,
  { store: SustainerStore; onContinue: () => void }
>(({ store, onContinue }, ref) => {
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState(false);

  // Clear the custom field whenever a tier is chosen elsewhere.
  useEffect(() => {
    if (store.selType === "tier") setRaw("");
  }, [store.selType, store.tier]);

  const freqWord =
    store.freq === "monthly"
      ? "monthly"
      : store.freq === "annual"
        ? "yearly"
        : "one-time";
  const ctaName =
    store.selectedName === "Custom" ? "your amount" : store.selectedName;

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
        What feels <em>right</em>
      </h2>
      <p className={styles.secSub}>
        There's no wrong amount. Every contribution helps, and you can change or
        cancel at any time.
      </p>

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
            placeholder="Other"
            min={1}
            aria-label="Custom amount"
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
          Or contribute what you can, {freqWord}
        </div>
      </div>
      {store.selType === "custom" && store.custom ? (
        <div className={styles.customHelp}>
          {customHelp(store, store.custom)}
        </div>
      ) : (
        <div className={styles.customHelp} />
      )}
      {err && (
        <div className={styles.customErr}>
          Please enter an amount of {currencySymbol(store.cur)}1 or more.
        </div>
      )}

      <div className={styles.continueRow}>
        <Button variant="primary" size="lg" onClick={handleContinue}>
          Continue with {ctaName} <FiArrowRight aria-hidden />
        </Button>
        <span className={styles.chargeNote}>
          <FiLock size={15} aria-hidden />
          You won't be charged until you review &amp; confirm.
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
            Add{" "}
            <span className={styles.solidAmt}>
              {money(store.cur, store.solidAmount)}
            </span>{" "}
            to sponsor a free membership
            <span>
              Pay it forward for someone in the community who can't contribute
              right now.
            </span>
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
            Make this a gift
            <span>
              Support QueerPulse on behalf of someone else — they'll get the
              badge and a note from you.
            </span>
          </span>
        </button>
      </div>
    </>
  );
});
SustainerTiers.displayName = "SustainerTiers";
