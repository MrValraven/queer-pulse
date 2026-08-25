import { AdminCheckLine } from "./ui";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { OrgTierFormDraft } from "./adminOrgTierForm.utils";
import type { OrgTierCtaType } from "../marketing/api/orgTiers.api";
import styles from "./AdminOrgTiersPage.module.css";

interface FieldsProps {
  draft: OrgTierFormDraft;
  onChange: (patch: Partial<OrgTierFormDraft>) => void;
}

/** Name, price, and the copy fields (dek, bullets, footnote). */
export function AdminOrgTierContentFields({ draft, onChange }: FieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="tier-name">
        {t("admin:orgTier.field.name")}
      </label>
      <input
        id="tier-name"
        className={styles.textInput}
        value={draft.name}
        onChange={(event) => onChange({ name: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="tier-price-display">
        {t("admin:orgTier.field.price")}
      </label>
      <input
        id="tier-price-display"
        className={styles.textInput}
        placeholder={t("admin:orgTier.field.priceDisplay.placeholder")}
        value={draft.priceDisplay}
        onChange={(event) => onChange({ priceDisplay: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="tier-price-period">
        {t("admin:orgTier.field.pricePeriod")}
      </label>
      <input
        id="tier-price-period"
        className={styles.textInput}
        placeholder={t("admin:orgTier.field.pricePeriod.placeholder")}
        value={draft.pricePeriod}
        onChange={(event) => onChange({ pricePeriod: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="tier-dek">
        {t("admin:orgTier.field.dek")}
      </label>
      <textarea
        id="tier-dek"
        className={styles.textarea}
        rows={3}
        value={draft.dek}
        onChange={(event) => onChange({ dek: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="tier-bullets">
        {t("admin:orgTier.field.bullets")}
      </label>
      <textarea
        id="tier-bullets"
        className={styles.textarea}
        rows={5}
        value={draft.bullets}
        onChange={(event) => onChange({ bullets: event.target.value })}
      />
      <p className={styles.fieldHint}>{t("admin:orgTier.field.bulletsHint")}</p>

      <label className={styles.fieldLabel} htmlFor="tier-footnote">
        {t("admin:orgTier.field.footnote")}
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

// `value` is the canonical stored id; `labelKey` resolves via t() at render.
const CTA_OPTIONS: { value: OrgTierCtaType; labelKey: string }[] = [
  { value: "toast", labelKey: "orgTier.ctaOption.toast" },
  { value: "link", labelKey: "orgTier.ctaOption.link" },
  { value: "propose", labelKey: "orgTier.ctaOption.propose" },
];

/** Call-to-action config, sort order, and the visibility toggles. */
export function AdminOrgTierCtaFields({ draft, onChange }: FieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="tier-cta-type">
        {t("admin:orgTier.field.cta")}
      </label>
      <Select
        id="tier-cta-type"
        value={draft.ctaType}
        options={CTA_OPTIONS.map((option) => ({
          value: option.value,
          label: t(`admin:${option.labelKey}`),
        }))}
        onChange={(value) =>
          onChange({ ctaType: (value ?? draft.ctaType) as OrgTierCtaType })
        }
      />

      <label className={styles.fieldLabel} htmlFor="tier-cta-label">
        {t("admin:orgTier.field.ctaLabel")}
      </label>
      <input
        id="tier-cta-label"
        className={styles.textInput}
        value={draft.ctaLabel}
        onChange={(event) => onChange({ ctaLabel: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="tier-cta-target">
        {t("admin:orgTier.field.ctaTarget")}
      </label>
      <input
        id="tier-cta-target"
        className={styles.textInput}
        placeholder={t("admin:orgTier.field.ctaTarget.placeholder")}
        value={draft.ctaTarget}
        onChange={(event) => onChange({ ctaTarget: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="tier-sort-order">
        {t("admin:orgTier.field.sortOrder")}
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
          title={t("admin:orgTier.toggle.featured.title")}
          sub={t("admin:orgTier.toggle.featured.sub")}
        />
        <AdminCheckLine
          checked={draft.published}
          onChange={(checked) => onChange({ published: checked })}
          title={t("admin:orgTier.toggle.published.title")}
          sub={t("admin:orgTier.toggle.published.sub")}
        />
      </div>
    </div>
  );
}
