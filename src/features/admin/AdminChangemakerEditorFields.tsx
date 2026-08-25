import { AdminCheckLine } from "./ui";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ChangemakerTint } from "../community/api/changemakers.api";
import type { ChangemakerFormDraft } from "./adminChangemakerEditor.utils";
import styles from "./AdminChangemakersPage.module.css";

interface FieldsProps {
  draft: ChangemakerFormDraft;
  onChange: (patch: Partial<ChangemakerFormDraft>) => void;
}

const TINT_OPTIONS: ChangemakerTint[] = ["coral", "jade", "plum"];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Identity, tags, and directory-listing fields. */
export function AdminChangemakerBasicFields({ draft, onChange }: FieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="changemaker-name">
        {t("community:changemakers.admin.editor.nameLabel")}
      </label>
      <input
        id="changemaker-name"
        className={styles.textInput}
        value={draft.name}
        onChange={(event) => onChange({ name: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="changemaker-initials">
        {t("community:changemakers.admin.editor.initialsLabel")}
      </label>
      <input
        id="changemaker-initials"
        className={styles.textInput}
        value={draft.initials}
        onChange={(event) => onChange({ initials: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="changemaker-cause">
        {t("community:changemakers.admin.editor.causeLabel")}
      </label>
      <input
        id="changemaker-cause"
        className={styles.textInput}
        value={draft.cause}
        onChange={(event) => onChange({ cause: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="changemaker-tint">
        {t("community:changemakers.admin.editor.tintLabel")}
      </label>
      <Select
        id="changemaker-tint"
        value={draft.tint}
        options={TINT_OPTIONS.map((tint) => ({
          value: tint,
          label: t(
            `community:changemakers.admin.editor.tint${capitalize(tint)}`,
          ),
        }))}
        onChange={(value) =>
          onChange({ tint: (value ?? draft.tint) as ChangemakerTint })
        }
      />

      <label className={styles.fieldLabel} htmlFor="changemaker-tags">
        {t("community:changemakers.admin.editor.tagsLabel")}
      </label>
      <input
        id="changemaker-tags"
        className={styles.textInput}
        value={draft.tagsText}
        onChange={(event) => onChange({ tagsText: event.target.value })}
      />
      <p className={styles.fieldHint}>
        {t("community:changemakers.admin.editor.tagsHint")}
      </p>

      <label className={styles.fieldLabel} htmlFor="changemaker-summary">
        {t("community:changemakers.admin.editor.summaryLabel")}
      </label>
      <textarea
        id="changemaker-summary"
        className={styles.textarea}
        rows={2}
        value={draft.summary}
        onChange={(event) => onChange({ summary: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="changemaker-image-url">
        {t("community:changemakers.admin.editor.imageUrlLabel")}
      </label>
      <input
        id="changemaker-image-url"
        className={styles.textInput}
        value={draft.imageUrl}
        onChange={(event) => onChange({ imageUrl: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="changemaker-sort-order">
        {t("community:changemakers.admin.editor.sortOrderLabel")}
      </label>
      <input
        id="changemaker-sort-order"
        type="number"
        className={styles.numberInput}
        value={draft.sortOrder}
        onChange={(event) =>
          onChange({ sortOrder: Number(event.target.value) })
        }
      />

      <div style={{ marginTop: 16 }}>
        <AdminCheckLine
          checked={draft.isFeatured}
          onChange={(checked) => onChange({ isFeatured: checked })}
          title={t("community:changemakers.admin.editor.isFeaturedLabel")}
        />
      </div>
    </div>
  );
}

/** Story-page fields: impact, byline, lead, body, and pull-quote. */
export function AdminChangemakerStoryFields({ draft, onChange }: FieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="changemaker-impact">
        {t("community:changemakers.admin.editor.impactLabel")}
      </label>
      <textarea
        id="changemaker-impact"
        className={styles.textarea}
        rows={3}
        value={draft.impactText}
        onChange={(event) => onChange({ impactText: event.target.value })}
      />
      <p className={styles.fieldHint}>
        {t("community:changemakers.admin.editor.impactHint")}
      </p>

      <label className={styles.fieldLabel} htmlFor="changemaker-byline">
        {t("community:changemakers.admin.editor.bylineLabel")}
      </label>
      <input
        id="changemaker-byline"
        className={styles.textInput}
        value={draft.byline}
        onChange={(event) => onChange({ byline: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="changemaker-hero-note">
        {t("community:changemakers.admin.editor.heroNoteLabel")}
      </label>
      <input
        id="changemaker-hero-note"
        className={styles.textInput}
        value={draft.heroNote}
        onChange={(event) => onChange({ heroNote: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="changemaker-lead">
        {t("community:changemakers.admin.editor.leadLabel")}
      </label>
      <textarea
        id="changemaker-lead"
        className={styles.textarea}
        rows={2}
        value={draft.lead}
        onChange={(event) => onChange({ lead: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="changemaker-body">
        {t("community:changemakers.admin.editor.bodyLabel")}
      </label>
      <textarea
        id="changemaker-body"
        className={styles.textarea}
        rows={6}
        value={draft.bodyText}
        onChange={(event) => onChange({ bodyText: event.target.value })}
      />
      <p className={styles.fieldHint}>
        {t("community:changemakers.admin.editor.bodyHint")}
      </p>

      <label
        className={styles.fieldLabel}
        htmlFor="changemaker-pull-quote-text"
      >
        {t("community:changemakers.admin.editor.pullQuoteTextLabel")}
      </label>
      <textarea
        id="changemaker-pull-quote-text"
        className={styles.textarea}
        rows={2}
        value={draft.pullQuoteText}
        onChange={(event) => onChange({ pullQuoteText: event.target.value })}
      />

      <label
        className={styles.fieldLabel}
        htmlFor="changemaker-pull-quote-cite"
      >
        {t("community:changemakers.admin.editor.pullQuoteCiteLabel")}
      </label>
      <input
        id="changemaker-pull-quote-cite"
        className={styles.textInput}
        value={draft.pullQuoteCite}
        onChange={(event) => onChange({ pullQuoteCite: event.target.value })}
      />
    </div>
  );
}
