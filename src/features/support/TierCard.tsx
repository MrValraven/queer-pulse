import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  amountFor,
  annualSaving,
  FREQS,
  TIER_LABEL_KEYS,
  TIER_NAMES,
  type TierIndex,
} from "./sustainer.pricing";
import { TIER_MICROLABEL_KEYS, TIER_PERK_KEYS } from "./sustainer.data";
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
  const { t } = useTranslation();
  const name = TIER_NAMES[index];
  const nameLabel = t(TIER_LABEL_KEYS[name]);
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
      aria-label={t("support:tiers.selectAriaLabel", { name: nameLabel })}
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
      {featured && (
        <div className={styles.mostChosen}>{t("support:tiers.mostChosen")}</div>
      )}
      <div className={styles.tierName}>{nameLabel}</div>
      <div className={styles.tierMicrolabel}>
        {t(TIER_MICROLABEL_KEYS[name])}
      </div>
      <div className={styles.tierAmount}>{store.money(amount)}</div>
      <div className={styles.tierPer}>{t(FREQS[store.freq].perKey)}</div>
      <div className={styles.tierNote}>
        {store.freq === "annual" && (
          <>
            <s>{store.money(annualSaving(index, store.cur).full)}</s>
            {t("support:tiers.saveSuffix", {
              amount: store.money(annualSaving(index, store.cur).save),
            })}
          </>
        )}
      </div>
      <div className={styles.tierPerks}>
        {TIER_PERK_KEYS[name].map((perkKey) => (
          <div key={perkKey} className={styles.tierPerk}>
            <span className={styles.tpCheck}>
              <FiCheck size={14} aria-hidden />
            </span>
            {t(perkKey)}
          </div>
        ))}
      </div>
      <span
        className={`${styles.tierSelectBtn} ${featured ? styles.tierSelectLight : styles.tierSelectGhost}`}
      >
        {t("support:tiers.chooseCta", { name: nameLabel })}
      </span>
    </div>
  );
}
