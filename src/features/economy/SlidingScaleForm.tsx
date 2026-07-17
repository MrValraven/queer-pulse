import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SlidingScale, Tier } from "./slidingScale.data";
import styles from "./SlidingScalePage.module.css";

interface TierFieldsProps {
  tier: Tier;
  index: number;
  onChange: (patch: Partial<Tier>) => void;
}

/** The editable inputs for a single tier (name, price, who-it's-for). */
function TierFields({ tier, index, onChange }: TierFieldsProps) {
  const { t } = useTranslation();
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>
        {t("economy:slidingScale.tierLegend", { index: index + 1 })}
      </legend>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor={`tier-name-${tier.id}`}>
            {t("economy:slidingScale.tierNameLabel")}
          </label>
          <input
            id={`tier-name-${tier.id}`}
            className={styles.rcInput}
            type="text"
            placeholder={t("economy:slidingScale.tierNamePlaceholder")}
            value={tier.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor={`tier-price-${tier.id}`}>
            {t("economy:slidingScale.tierPriceLabel")}
          </label>
          <input
            id={`tier-price-${tier.id}`}
            className={styles.rcInput}
            type="text"
            inputMode="text"
            placeholder={t("economy:slidingScale.tierPricePlaceholder")}
            value={tier.price}
            onChange={(e) => onChange({ price: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor={`tier-for-${tier.id}`}>
          {t("economy:slidingScale.tierForWhomLabel")}
        </label>
        <textarea
          id={`tier-for-${tier.id}`}
          className={styles.rcTextarea}
          placeholder={t("economy:slidingScale.tierForWhomPlaceholder")}
          value={tier.forWhom}
          onChange={(e) => onChange({ forWhom: e.target.value })}
        />
      </div>
    </fieldset>
  );
}

interface SlidingScaleFormProps {
  scale: SlidingScale;
  onChange: (patch: Partial<SlidingScale>) => void;
  makerName: string;
  onMakerNameChange: (name: string) => void;
}

/** The input column for the sliding-scale generator. */
export function SlidingScaleForm({
  scale,
  onChange,
  makerName,
  onMakerNameChange,
}: SlidingScaleFormProps) {
  const { t } = useTranslation();
  const patchTier = (id: string, patch: Partial<Tier>) =>
    onChange({
      tiers: scale.tiers.map((tier) =>
        tier.id === id ? { ...tier, ...patch } : tier,
      ),
    });

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="ss-maker">
          {t("economy:slidingScale.yourNameLabel")}
        </label>
        <input
          id="ss-maker"
          className={styles.rcInput}
          type="text"
          placeholder={t("economy:slidingScale.yourNamePlaceholder")}
          value={makerName}
          onChange={(e) => onMakerNameChange(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="ss-service">
          {t("economy:slidingScale.serviceLabel")}
        </label>
        <input
          id="ss-service"
          className={styles.rcInput}
          type="text"
          placeholder={t("economy:slidingScale.servicePlaceholder")}
          value={scale.service}
          onChange={(e) => onChange({ service: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="ss-intro">
          {t("economy:slidingScale.introLabel")}
        </label>
        <textarea
          id="ss-intro"
          className={styles.rcTextarea}
          placeholder={t("economy:slidingScale.introPlaceholder")}
          value={scale.intro}
          onChange={(e) => onChange({ intro: e.target.value })}
        />
      </div>

      {scale.tiers.map((tier, i) => (
        <TierFields
          key={tier.id}
          tier={tier}
          index={i}
          onChange={(patch) => patchTier(tier.id, patch)}
        />
      ))}
    </div>
  );
}
