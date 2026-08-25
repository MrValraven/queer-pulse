import { AdminCheckLine } from "./ui";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CoopFormDraft } from "./adminHousingCoopForm.utils";
import styles from "./AdminHousingCoopsPage.module.css";

interface FieldsProps {
  draft: CoopFormDraft;
  onChange: (patch: Partial<CoopFormDraft>) => void;
}

// `value` is the canonical stored id; `labelKey` resolves via t() at render.
const PHASE_OPTIONS: { value: CoopFormDraft["phase"]; labelKey: string }[] = [
  { value: "forming", labelKey: "housingCoop.phaseOption.forming" },
  { value: "legal", labelKey: "housingCoop.phaseOption.legal" },
  { value: "finance", labelKey: "housingCoop.phaseOption.finance" },
  { value: "property", labelKey: "housingCoop.phaseOption.property" },
  { value: "daily", labelKey: "housingCoop.phaseOption.daily" },
];

/** Identity, location, household count, phase, and the public description. */
export function AdminHousingCoopIdentityFields({
  draft,
  onChange,
}: FieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="coop-slug">
        {t("admin:housingCoop.field.slug")}
      </label>
      <input
        id="coop-slug"
        className={styles.textInput}
        value={draft.slug}
        onChange={(event) => onChange({ slug: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="coop-name">
        {t("admin:housingCoop.field.name")}
      </label>
      <input
        id="coop-name"
        className={styles.textInput}
        value={draft.name}
        onChange={(event) => onChange({ name: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="coop-name-em">
        {t("admin:housingCoop.field.nameEm")}
      </label>
      <input
        id="coop-name-em"
        className={styles.textInput}
        value={draft.nameEm}
        onChange={(event) => onChange({ nameEm: event.target.value })}
      />
      <p className={styles.fieldHint}>
        {t("admin:housingCoop.field.nameEmHint")}
      </p>

      <label className={styles.fieldLabel} htmlFor="coop-city">
        {t("admin:housingCoop.field.city")}
      </label>
      <input
        id="coop-city"
        className={styles.textInput}
        value={draft.city}
        onChange={(event) => onChange({ city: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="coop-area">
        {t("admin:housingCoop.field.area")}
      </label>
      <input
        id="coop-area"
        className={styles.textInput}
        value={draft.area}
        onChange={(event) => onChange({ area: event.target.value })}
        required
      />

      <label className={styles.fieldLabel} htmlFor="coop-household-count">
        {t("admin:housingCoop.field.households")}
      </label>
      <input
        id="coop-household-count"
        type="number"
        min={0}
        className={styles.numberInput}
        value={draft.householdCount}
        onChange={(event) => onChange({ householdCount: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="coop-phase">
        {t("admin:housingCoop.field.phase")}
      </label>
      <Select
        id="coop-phase"
        value={draft.phase}
        options={PHASE_OPTIONS.map((option) => ({
          value: option.value,
          label: t(`admin:${option.labelKey}`),
        }))}
        onChange={(value) =>
          onChange({ phase: (value ?? draft.phase) as CoopFormDraft["phase"] })
        }
      />

      <label className={styles.fieldLabel} htmlFor="coop-description">
        {t("admin:housingCoop.field.description")}
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

// `value` is the canonical stored id; `labelKey` resolves via t() at render.
const CTA_OPTIONS: { value: CoopFormDraft["ctaKind"]; labelKey: string }[] = [
  { value: "join", labelKey: "housingCoop.ctaOption.join" },
  { value: "updates", labelKey: "housingCoop.ctaOption.updates" },
  { value: "mentor", labelKey: "housingCoop.ctaOption.mentor" },
];

/** Timeline, progress, money, and the visibility toggles. */
export function AdminHousingCoopEconomicsFields({
  draft,
  onChange,
}: FieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="coop-progress">
        {t("admin:housingCoop.field.progress")}
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
        {t("admin:housingCoop.field.formingSince")}
      </label>
      <input
        id="coop-forming-since"
        className={styles.textInput}
        placeholder={t("admin:housingCoop.field.formingSincePlaceholder")}
        value={draft.formingSince}
        onChange={(event) => onChange({ formingSince: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="coop-operational-since">
        {t("admin:housingCoop.field.operationalSince")}
      </label>
      <input
        id="coop-operational-since"
        className={styles.textInput}
        placeholder={t("admin:housingCoop.field.operationalSincePlaceholder")}
        value={draft.operationalSince}
        onChange={(event) => onChange({ operationalSince: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="coop-share-amount">
        {t("admin:housingCoop.field.shareAmount")}
      </label>
      <input
        id="coop-share-amount"
        type="number"
        min={0}
        className={styles.numberInput}
        value={draft.shareAmountEuros}
        onChange={(event) => onChange({ shareAmountEuros: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="coop-monthly">
        {t("admin:housingCoop.field.monthly")}
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
        {t("admin:housingCoop.field.cta")}
      </label>
      <Select
        id="coop-cta-kind"
        value={draft.ctaKind}
        options={CTA_OPTIONS.map((option) => ({
          value: option.value,
          label: t(`admin:${option.labelKey}`),
        }))}
        onChange={(value) =>
          onChange({
            ctaKind: (value ?? draft.ctaKind) as CoopFormDraft["ctaKind"],
          })
        }
      />

      <div className={styles.checkStack}>
        <AdminCheckLine
          checked={draft.operational}
          onChange={(checked) => onChange({ operational: checked })}
          title={t("admin:housingCoop.toggle.operational.title")}
          sub={t("admin:housingCoop.toggle.operational.sub")}
        />
        <AdminCheckLine
          checked={draft.sharesAreTarget}
          onChange={(checked) => onChange({ sharesAreTarget: checked })}
          title={t("admin:housingCoop.toggle.sharesAreTarget.title")}
          sub={t("admin:housingCoop.toggle.sharesAreTarget.sub")}
        />
        <AdminCheckLine
          checked={draft.published}
          onChange={(checked) => onChange({ published: checked })}
          title={t("admin:housingCoop.toggle.published.title")}
          sub={t("admin:housingCoop.toggle.published.sub")}
        />
      </div>
    </div>
  );
}
