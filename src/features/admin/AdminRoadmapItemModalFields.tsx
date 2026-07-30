import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminCheckLine } from "./ui";
import type { RoadmapColumn } from "./api/roadmapAdmin.api";
import type { RoadmapItemFormDraft } from "./adminRoadmapItemForm.utils";
import styles from "./AdminRoadmapPage.module.css";

const COLUMN_OPTIONS: RoadmapColumn[] = ["shipped", "building", "planned"];

interface FieldsProps {
  draft: RoadmapItemFormDraft;
  onChange: (patch: Partial<RoadmapItemFormDraft>) => void;
}

/** Column, category, name, description — shown for every item regardless
 *  of column. Changing `column` here is what lets an item move between
 *  Shipped/Building/Planned. */
export function AdminRoadmapItemCoreFields({ draft, onChange }: FieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldGroup}>
      <FormField label={t("admin:roadmap.board.field.column")}>
        <select
          className={styles.select}
          value={draft.column}
          onChange={(event) =>
            onChange({ column: event.target.value as RoadmapColumn })
          }
        >
          {COLUMN_OPTIONS.map((column) => (
            <option key={column} value={column}>
              {t(`admin:roadmap.board.column.${column}`)}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={t("admin:roadmap.board.field.category")} required>
        <input
          className={styles.textInput}
          value={draft.category}
          onChange={(event) => onChange({ category: event.target.value })}
          required
        />
      </FormField>

      <FormField label={t("admin:roadmap.board.field.name")} required>
        <input
          className={styles.textInput}
          value={draft.name}
          onChange={(event) => onChange({ name: event.target.value })}
          required
        />
      </FormField>

      <FormField label={t("admin:roadmap.board.field.description")} required>
        <textarea
          className={styles.textarea}
          rows={4}
          value={draft.description}
          onChange={(event) => onChange({ description: event.target.value })}
          required
        />
      </FormField>
    </div>
  );
}

/** Column-scoped fields — only the block matching `draft.column` renders,
 *  so the form never asks for (or silently carries over) data that column
 *  doesn't use. */
export function AdminRoadmapItemColumnFields({ draft, onChange }: FieldsProps) {
  const { t } = useTranslation();

  if (draft.column === "shipped") {
    return (
      <div className={styles.fieldGroup}>
        <FormField label={t("admin:roadmap.board.field.date")}>
          <input
            className={styles.textInput}
            placeholder={t("admin:roadmap.board.field.date.placeholder")}
            value={draft.date}
            onChange={(event) => onChange({ date: event.target.value })}
          />
        </FormField>
        <AdminCheckLine
          checked={draft.requested}
          onChange={(checked) => onChange({ requested: checked })}
          title={t("admin:roadmap.board.field.requested.title")}
          sub={t("admin:roadmap.board.field.requested.sub")}
        />
      </div>
    );
  }

  if (draft.column === "building") {
    return (
      <div className={styles.fieldGroup}>
        <FormField label={t("admin:roadmap.board.field.stage")}>
          <input
            className={styles.textInput}
            placeholder={t("admin:roadmap.board.field.stage.placeholder")}
            value={draft.stage}
            onChange={(event) => onChange({ stage: event.target.value })}
          />
        </FormField>
        <FormField label={t("admin:roadmap.board.field.eta")}>
          <input
            className={styles.textInput}
            placeholder={t("admin:roadmap.board.field.eta.placeholder")}
            value={draft.eta}
            onChange={(event) => onChange({ eta: event.target.value })}
          />
        </FormField>
        <FormField label={t("admin:roadmap.board.field.progress")}>
          <input
            type="number"
            min={0}
            max={100}
            className={styles.numberInput}
            value={draft.progress}
            onChange={(event) => onChange({ progress: event.target.value })}
          />
        </FormField>
        <AdminCheckLine
          checked={draft.requested}
          onChange={(checked) => onChange({ requested: checked })}
          title={t("admin:roadmap.board.field.requested.title")}
          sub={t("admin:roadmap.board.field.requested.sub")}
        />
      </div>
    );
  }

  return (
    <div className={styles.fieldGroup}>
      <FormField label={t("admin:roadmap.board.field.votes")}>
        <input
          type="number"
          min={0}
          className={styles.numberInput}
          value={draft.votes}
          onChange={(event) => onChange({ votes: event.target.value })}
        />
      </FormField>
      <AdminCheckLine
        checked={draft.hot}
        onChange={(checked) => onChange({ hot: checked })}
        title={t("admin:roadmap.board.field.hot.title")}
        sub={t("admin:roadmap.board.field.hot.sub")}
      />
    </div>
  );
}
