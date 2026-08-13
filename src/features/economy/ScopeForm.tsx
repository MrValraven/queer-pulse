import { FiPlus, FiX } from "react-icons/fi";
import { Button, DatePicker } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ScopeState } from "./scope.data";
import styles from "./ScopeGeneratorPage.module.css";

interface EditableListProps {
  legend: string;
  hint: string;
  items: string[];
  idPrefix: string;
  placeholder: string;
  addLabel: string;
  onChange: (items: string[]) => void;
}

/** A labelled add/remove list of free-text rows (deliverables, exclusions). */
function EditableList({
  legend,
  hint,
  items,
  idPrefix,
  placeholder,
  addLabel,
  onChange,
}: EditableListProps) {
  const { t } = useTranslation();
  const patch = (i: number, value: string) =>
    onChange(items.map((it, idx) => (idx === i ? value : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <p className={styles.hint}>{hint}</p>

      {items.map((value, i) => (
        <div key={`${idPrefix}-${i}`} className={styles.listRow}>
          <label className={styles.srOnly} htmlFor={`${idPrefix}-${i}`}>
            {t("economy:scopeTool.itemAriaLabel", { legend, index: i + 1 })}
          </label>
          <input
            id={`${idPrefix}-${i}`}
            className={styles.rcInput}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => patch(i, e.target.value)}
          />
          <button
            type="button"
            className={styles.rowRemove}
            onClick={() => remove(i)}
            disabled={items.length === 1}
            aria-label={t("economy:scopeTool.removeItemAriaLabel", {
              legend,
              index: i + 1,
            })}
          >
            <FiX aria-hidden />
          </button>
        </div>
      ))}

      <Button
        variant="ghost"
        size="md"
        type="button"
        onClick={add}
        className={styles.addRow}
      >
        <FiPlus aria-hidden /> {addLabel}
      </Button>
    </fieldset>
  );
}

interface ScopeFormProps {
  scope: ScopeState;
  onChange: (patch: Partial<ScopeState>) => void;
}

/** The input column for the scope generator. */
export function ScopeForm({ scope, onChange }: ScopeFormProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="scope-project">
          {t("economy:scopeTool.projectLabel")}
        </label>
        <input
          id="scope-project"
          className={styles.rcInput}
          type="text"
          placeholder={t("economy:scopeTool.projectPlaceholder")}
          value={scope.project}
          onChange={(e) => onChange({ project: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="scope-client">
          {t("economy:scopeTool.clientLabel")}
        </label>
        <input
          id="scope-client"
          className={styles.rcInput}
          type="text"
          placeholder={t("economy:scopeTool.clientPlaceholder")}
          value={scope.clientName}
          onChange={(e) => onChange({ clientName: e.target.value })}
        />
      </div>

      <EditableList
        legend={t("economy:scopeTool.includedLegend")}
        hint={t("economy:scopeTool.includedHint")}
        items={scope.deliverables}
        idPrefix="deliverable"
        placeholder={t("economy:scopeTool.includedPlaceholder")}
        addLabel={t("economy:scopeTool.includedAdd")}
        onChange={(deliverables) => onChange({ deliverables })}
      />

      <EditableList
        legend={t("economy:scopeTool.excludedLegend")}
        hint={t("economy:scopeTool.excludedHint")}
        items={scope.outOfScope}
        idPrefix="exclusion"
        placeholder={t("economy:scopeTool.excludedPlaceholder")}
        addLabel={t("economy:scopeTool.excludedAdd")}
        onChange={(outOfScope) => onChange({ outOfScope })}
      />

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="scope-revisions">
          {t("economy:scopeTool.revisionsLabel")}
        </label>
        <input
          id="scope-revisions"
          className={styles.rcInput}
          type="text"
          placeholder={t("economy:scopeTool.revisionsPlaceholder")}
          value={scope.revisions}
          onChange={(e) => onChange({ revisions: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="scope-milestones">
          {t("economy:scopeTool.milestonesLabel")}
        </label>
        <textarea
          id="scope-milestones"
          className={styles.rcTextarea}
          placeholder={t("economy:scopeTool.milestonesPlaceholder")}
          value={scope.milestones}
          onChange={(e) => onChange({ milestones: e.target.value })}
        />
      </div>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="scope-price">
            {t("economy:scopeTool.priceLabel")}
          </label>
          <input
            id="scope-price"
            className={styles.rcInput}
            type="number"
            min={0}
            step="any"
            placeholder={t("economy:scopeTool.pricePlaceholder")}
            value={scope.price}
            onChange={(e) => onChange({ price: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label id="scope-valid-label" className={styles.rcLabel}>
            {t("economy:scopeTool.validUntilLabel")}
          </label>
          <DatePicker
            mode="date"
            id="scope-valid"
            labelledBy="scope-valid-label"
            value={scope.validUntil || null}
            onChange={(value) => onChange({ validUntil: value ?? "" })}
          />
        </div>
      </div>
    </div>
  );
}
