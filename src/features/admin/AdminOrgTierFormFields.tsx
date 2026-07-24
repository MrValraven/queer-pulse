import { AdminCheckLine } from "./ui";
import type { OrgTierFormDraft } from "./adminOrgTierForm.utils";
import type { OrgTierCtaType } from "../marketing/api/orgTiers.api";
import styles from "./AdminOrgTiersPage.module.css";

interface FieldsProps {
  draft: OrgTierFormDraft;
  onChange: (patch: Partial<OrgTierFormDraft>) => void;
}

/** Name, price, and the copy fields (dek, bullets, footnote). */
export function AdminOrgTierContentFields({ draft, onChange }: FieldsProps) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="tier-name">
        Name
      </label>
      <input
        id="tier-name"
        className={styles.textInput}
        value={draft.name}
        onChange={(event) => onChange({ name: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="tier-price-display">
        Price
      </label>
      <input
        id="tier-price-display"
        className={styles.textInput}
        placeholder="e.g. €2.4k or Custom"
        value={draft.priceDisplay}
        onChange={(event) => onChange({ priceDisplay: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="tier-price-period">
        Price period
      </label>
      <input
        id="tier-price-period"
        className={styles.textInput}
        placeholder="e.g. per year"
        value={draft.pricePeriod}
        onChange={(event) => onChange({ pricePeriod: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="tier-dek">
        Dek
      </label>
      <textarea
        id="tier-dek"
        className={styles.textarea}
        rows={3}
        value={draft.dek}
        onChange={(event) => onChange({ dek: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="tier-bullets">
        Bullets
      </label>
      <textarea
        id="tier-bullets"
        className={styles.textarea}
        rows={5}
        value={draft.bullets}
        onChange={(event) => onChange({ bullets: event.target.value })}
      />
      <p className={styles.fieldHint}>One bullet per line.</p>

      <label className={styles.fieldLabel} htmlFor="tier-footnote">
        Footnote
      </label>
      <textarea
        id="tier-footnote"
        className={styles.textarea}
        rows={2}
        value={draft.footnote}
        onChange={(event) => onChange({ footnote: event.target.value })}
      />
    </div>
  );
}

const CTA_OPTIONS: { value: OrgTierCtaType; label: string }[] = [
  { value: "toast", label: "Toast — informational only" },
  { value: "link", label: "Link — navigates to a target" },
  { value: "propose", label: "Propose — opens the enquiry flow" },
];

/** Call-to-action config, sort order, and the visibility toggles. */
export function AdminOrgTierCtaFields({ draft, onChange }: FieldsProps) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="tier-cta-type">
        Call to action
      </label>
      <select
        id="tier-cta-type"
        className={styles.select}
        value={draft.ctaType}
        onChange={(event) =>
          onChange({ ctaType: event.target.value as OrgTierCtaType })
        }
      >
        {CTA_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className={styles.fieldLabel} htmlFor="tier-cta-label">
        CTA label
      </label>
      <input
        id="tier-cta-label"
        className={styles.textInput}
        value={draft.ctaLabel}
        onChange={(event) => onChange({ ctaLabel: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="tier-cta-target">
        CTA target
      </label>
      <input
        id="tier-cta-target"
        className={styles.textInput}
        placeholder="Only used when the call to action is a link"
        value={draft.ctaTarget}
        onChange={(event) => onChange({ ctaTarget: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="tier-sort-order">
        Sort order
      </label>
      <input
        id="tier-sort-order"
        type="number"
        className={styles.numberInput}
        value={draft.sortOrder}
        onChange={(event) => onChange({ sortOrder: event.target.value })}
      />

      <div className={styles.checkStack}>
        <AdminCheckLine
          checked={draft.featured}
          onChange={(checked) => onChange({ featured: checked })}
          title="Featured"
          sub="Highlighted as the recommended tier."
        />
        <AdminCheckLine
          checked={draft.published}
          onChange={(checked) => onChange({ published: checked })}
          title="Published"
          sub="Visible on the For Organisations page."
        />
      </div>
    </div>
  );
}
