import { FiCheck } from "react-icons/fi";
import {
  amountFor,
  annualSaving,
  FREQS,
  money,
  TIER_NAMES,
  type TierIndex,
} from "./sustainer.pricing";
import { TIER_MICROLABELS, TIER_PERKS } from "./sustainer.data";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

/** One selectable contribution tier. The whole card is the control. */
export function TierCard({
  index,
  store,
}: {
  index: TierIndex;
  store: SustainerStore;
}) {
  const name = TIER_NAMES[index];
  const featured = index === 1;
  const selected = store.selType === "tier" && store.tier === index;
  const amount = amountFor(index, store.cur, store.freq);

  const cls = [
    styles.tierCard,
    featured && styles.featured,
    selected && styles.selected,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Select ${name} tier`}
      onClick={() => store.selectTier(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          store.selectTier(index);
        }
      }}
    >
      <div className={styles.tierCheck}>
        <FiCheck size={13} aria-hidden />
      </div>
      {featured && <div className={styles.mostChosen}>Most chosen</div>}
      <div className={styles.tierName}>{name}</div>
      <div className={styles.tierMicrolabel}>{TIER_MICROLABELS[name]}</div>
      <div className={styles.tierAmount}>{money(store.cur, amount)}</div>
      <div className={styles.tierPer}>{FREQS[store.freq].per}</div>
      <div className={styles.tierNote}>
        {store.freq === "annual" && (
          <>
            <s>{money(store.cur, annualSaving(index, store.cur).full)}</s>
            save {money(store.cur, annualSaving(index, store.cur).save)}/yr
          </>
        )}
      </div>
      <div className={styles.tierPerks}>
        {TIER_PERKS[name].map((perk) => (
          <div key={perk} className={styles.tierPerk}>
            <span className={styles.tpCheck}>
              <FiCheck size={14} aria-hidden />
            </span>
            {perk}
          </div>
        ))}
      </div>
      <span
        className={`${styles.tierSelectBtn} ${featured ? styles.tierSelectLight : styles.tierSelectGhost}`}
      >
        Choose {name}
      </span>
    </div>
  );
}
