import type { SlidingScale, Tier } from './slidingScale.data'
import styles from './SlidingScalePage.module.css'

interface TierFieldsProps {
  tier: Tier
  index: number
  onChange: (patch: Partial<Tier>) => void
}

/** The editable inputs for a single tier (name, price, who-it's-for). */
function TierFields({ tier, index, onChange }: TierFieldsProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Tier {index + 1}</legend>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor={`tier-name-${tier.id}`}>
            Tier name
          </label>
          <input
            id={`tier-name-${tier.id}`}
            className={styles.rcInput}
            type="text"
            placeholder="e.g. Supported"
            value={tier.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor={`tier-price-${tier.id}`}>
            Price
          </label>
          <input
            id={`tier-price-${tier.id}`}
            className={styles.rcInput}
            type="text"
            inputMode="text"
            placeholder="e.g. €60"
            value={tier.price}
            onChange={(e) => onChange({ price: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor={`tier-for-${tier.id}`}>
          Who it&apos;s for
        </label>
        <textarea
          id={`tier-for-${tier.id}`}
          className={styles.rcTextarea}
          placeholder="The honest guidance that helps people self-select."
          value={tier.forWhom}
          onChange={(e) => onChange({ forWhom: e.target.value })}
        />
      </div>
    </fieldset>
  )
}

interface SlidingScaleFormProps {
  scale: SlidingScale
  onChange: (patch: Partial<SlidingScale>) => void
  makerName: string
  onMakerNameChange: (name: string) => void
}

/** The input column for the sliding-scale generator. */
export function SlidingScaleForm({
  scale,
  onChange,
  makerName,
  onMakerNameChange,
}: SlidingScaleFormProps) {
  const patchTier = (id: string, patch: Partial<Tier>) =>
    onChange({ tiers: scale.tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)) })

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="ss-maker">
          Your name
        </label>
        <input
          id="ss-maker"
          className={styles.rcInput}
          type="text"
          placeholder="The name people will see"
          value={makerName}
          onChange={(e) => onMakerNameChange(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="ss-service">
          Service / offering
        </label>
        <input
          id="ss-service"
          className={styles.rcInput}
          type="text"
          placeholder="e.g. 1:1 coaching session"
          value={scale.service}
          onChange={(e) => onChange({ service: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="ss-intro">
          Intro line
        </label>
        <textarea
          id="ss-intro"
          className={styles.rcTextarea}
          placeholder="A warm line that frames the scale."
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
  )
}
