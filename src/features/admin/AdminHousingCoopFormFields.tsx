import { AdminCheckLine } from "./ui";
import type { CoopFormDraft } from "./adminHousingCoopForm.utils";
import styles from "./AdminHousingCoopsPage.module.css";

interface FieldsProps {
  draft: CoopFormDraft;
  onChange: (patch: Partial<CoopFormDraft>) => void;
}

const PHASE_OPTIONS: { value: CoopFormDraft["phase"]; label: string }[] = [
  { value: "forming", label: "Forming — finding the people" },
  { value: "legal", label: "Legal incorporation" },
  { value: "finance", label: "Finance & structure" },
  { value: "property", label: "Finding the property" },
  { value: "daily", label: "Daily life — operational" },
];

/** Identity, location, household count, phase, and the public description. */
export function AdminHousingCoopIdentityFields({
  draft,
  onChange,
}: FieldsProps) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="coop-slug">
        Slug
      </label>
      <input
        id="coop-slug"
        className={styles.textInput}
        value={draft.slug}
        onChange={(event) => onChange({ slug: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="coop-name">
        Name
      </label>
      <input
        id="coop-name"
        className={styles.textInput}
        value={draft.name}
        onChange={(event) => onChange({ name: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="coop-name-em">
        Name — emphasised word
      </label>
      <input
        id="coop-name-em"
        className={styles.textInput}
        value={draft.nameEm}
        onChange={(event) => onChange({ nameEm: event.target.value })}
      />
      <p className={styles.fieldHint}>
        The one word styled in italic coral on the public card. Leave blank
        for none.
      </p>

      <label className={styles.fieldLabel} htmlFor="coop-city">
        City
      </label>
      <input
        id="coop-city"
        className={styles.textInput}
        value={draft.city}
        onChange={(event) => onChange({ city: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="coop-area">
        Area
      </label>
      <input
        id="coop-area"
        className={styles.textInput}
        value={draft.area}
        onChange={(event) => onChange({ area: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="coop-household-count">
        Households
      </label>
      <input
        id="coop-household-count"
        type="number"
        min={0}
        className={styles.numberInput}
        value={draft.householdCount}
        onChange={(event) =>
          onChange({ householdCount: event.target.value })
        }
      />

      <label className={styles.fieldLabel} htmlFor="coop-phase">
        Phase
      </label>
      <select
        id="coop-phase"
        className={styles.select}
        value={draft.phase}
        onChange={(event) =>
          onChange({ phase: event.target.value as CoopFormDraft["phase"] })
        }
      >
        {PHASE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className={styles.fieldLabel} htmlFor="coop-description">
        Description
      </label>
      <textarea
        id="coop-description"
        className={styles.textarea}
        rows={4}
        value={draft.description}
        onChange={(event) => onChange({ description: event.target.value })}
      />
    </div>
  );
}

const CTA_OPTIONS: { value: CoopFormDraft["ctaKind"]; label: string }[] = [
  { value: "join", label: "Join the co-op" },
  { value: "updates", label: "Get updates" },
  { value: "mentor", label: "Talk to a mentor" },
];

/** Timeline, progress, money, and the visibility toggles. */
export function AdminHousingCoopEconomicsFields({
  draft,
  onChange,
}: FieldsProps) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="coop-progress">
        Progress (%)
      </label>
      <input
        id="coop-progress"
        type="number"
        min={0}
        max={100}
        className={styles.numberInput}
        value={draft.progress}
        onChange={(event) => onChange({ progress: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="coop-forming-since">
        Forming since
      </label>
      <input
        id="coop-forming-since"
        className={styles.textInput}
        placeholder="e.g. 2025-03-01"
        value={draft.formingSince}
        onChange={(event) =>
          onChange({ formingSince: event.target.value })
        }
      />

      <label className={styles.fieldLabel} htmlFor="coop-operational-since">
        Operational since
      </label>
      <input
        id="coop-operational-since"
        className={styles.textInput}
        placeholder="e.g. 2026-01-01"
        value={draft.operationalSince}
        onChange={(event) =>
          onChange({ operationalSince: event.target.value })
        }
      />

      <label className={styles.fieldLabel} htmlFor="coop-share-amount">
        Share amount (EUR)
      </label>
      <input
        id="coop-share-amount"
        type="number"
        min={0}
        className={styles.numberInput}
        value={draft.shareAmountEuros}
        onChange={(event) =>
          onChange({ shareAmountEuros: event.target.value })
        }
      />

      <label className={styles.fieldLabel} htmlFor="coop-monthly">
        Monthly (EUR)
      </label>
      <input
        id="coop-monthly"
        type="number"
        min={0}
        className={styles.numberInput}
        value={draft.monthlyEuros}
        onChange={(event) => onChange({ monthlyEuros: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="coop-cta-kind">
        Call to action
      </label>
      <select
        id="coop-cta-kind"
        className={styles.select}
        value={draft.ctaKind}
        onChange={(event) =>
          onChange({ ctaKind: event.target.value as CoopFormDraft["ctaKind"] })
        }
      >
        {CTA_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className={styles.checkStack}>
        <AdminCheckLine
          checked={draft.operational}
          onChange={(checked) => onChange({ operational: checked })}
          title="Operational"
          sub="The co-op has moved in and is running day to day."
        />
        <AdminCheckLine
          checked={draft.sharesAreTarget}
          onChange={(checked) => onChange({ sharesAreTarget: checked })}
          title="Share amount is a target"
          sub="Show the share amount as a goal, not a fixed price."
        />
        <AdminCheckLine
          checked={draft.published}
          onChange={(checked) => onChange({ published: checked })}
          title="Published"
          sub="Visible in the public housing directory."
        />
      </div>
    </div>
  );
}
