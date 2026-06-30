import { FiPlus, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
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
            {legend} item {i + 1}
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
            aria-label={`Remove ${legend.toLowerCase()} item ${i + 1}`}
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
  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="scope-project">
          Project
        </label>
        <input
          id="scope-project"
          className={styles.rcInput}
          type="text"
          placeholder="e.g. Brand & website refresh"
          value={scope.project}
          onChange={(e) => onChange({ project: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="scope-client">
          Client name
        </label>
        <input
          id="scope-client"
          className={styles.rcInput}
          type="text"
          placeholder="Who this is for"
          value={scope.clientName}
          onChange={(e) => onChange({ clientName: e.target.value })}
        />
      </div>

      <EditableList
        legend="What's included"
        hint="The deliverables you commit to."
        items={scope.deliverables}
        idPrefix="deliverable"
        placeholder="A deliverable"
        addLabel="Add deliverable"
        onChange={(deliverables) => onChange({ deliverables })}
      />

      <EditableList
        legend="Not included"
        hint="Naming exclusions up front prevents most disputes."
        items={scope.outOfScope}
        idPrefix="exclusion"
        placeholder="Something out of scope"
        addLabel="Add exclusion"
        onChange={(outOfScope) => onChange({ outOfScope })}
      />

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="scope-revisions">
          Revisions
        </label>
        <input
          id="scope-revisions"
          className={styles.rcInput}
          type="text"
          placeholder="e.g. 2 rounds per deliverable"
          value={scope.revisions}
          onChange={(e) => onChange({ revisions: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="scope-milestones">
          Milestones &amp; terms
        </label>
        <textarea
          id="scope-milestones"
          className={styles.rcTextarea}
          placeholder="Payment schedule, timeline, conditions…"
          value={scope.milestones}
          onChange={(e) => onChange({ milestones: e.target.value })}
        />
      </div>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="scope-price">
            Price (optional)
          </label>
          <input
            id="scope-price"
            className={styles.rcInput}
            type="number"
            min={0}
            step="any"
            placeholder="Leave empty for scope only"
            value={scope.price}
            onChange={(e) => onChange({ price: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="scope-valid">
            Valid until
          </label>
          <input
            id="scope-valid"
            className={styles.rcInput}
            type="date"
            value={scope.validUntil}
            onChange={(e) => onChange({ validUntil: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
