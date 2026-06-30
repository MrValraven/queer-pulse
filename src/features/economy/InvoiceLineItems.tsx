import { FiPlus, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { euro } from "./economy.data";
import { type LineItem, lineTotal, emptyLine } from "./invoice.data";
import styles from "./InvoiceGeneratorPage.module.css";

interface InvoiceLineItemsProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

/** Editable invoice line rows: description / qty / unit, with add + remove. */
export function InvoiceLineItems({ items, onChange }: InvoiceLineItemsProps) {
  const patch = (id: string, change: Partial<LineItem>) =>
    onChange(items.map((l) => (l.id === id ? { ...l, ...change } : l)));

  const remove = (id: string) => onChange(items.filter((l) => l.id !== id));
  const add = () => onChange([...items, emptyLine()]);

  // Parse to a number, treating an empty/invalid field as 0.
  const num = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <fieldset className={styles.lines}>
      <legend className={styles.legend}>Line items</legend>

      <div className={styles.lineHead} aria-hidden>
        <span>Description</span>
        <span>Qty</span>
        <span>Unit (€)</span>
        <span>Total</span>
        <span />
      </div>

      {items.map((l, i) => (
        <div key={l.id} className={styles.lineRow}>
          <label className={styles.srOnly} htmlFor={`desc-${l.id}`}>
            Description for line {i + 1}
          </label>
          <input
            id={`desc-${l.id}`}
            className={styles.rcInput}
            type="text"
            placeholder="What you delivered"
            value={l.desc}
            onChange={(e) => patch(l.id, { desc: e.target.value })}
          />

          <label className={styles.srOnly} htmlFor={`qty-${l.id}`}>
            Quantity for line {i + 1}
          </label>
          <input
            id={`qty-${l.id}`}
            className={styles.rcInput}
            type="number"
            min={0}
            step="any"
            value={Number.isFinite(l.qty) ? l.qty : ""}
            onChange={(e) => patch(l.id, { qty: num(e.target.value) })}
          />

          <label className={styles.srOnly} htmlFor={`unit-${l.id}`}>
            Unit price for line {i + 1}
          </label>
          <input
            id={`unit-${l.id}`}
            className={styles.rcInput}
            type="number"
            min={0}
            step="any"
            value={Number.isFinite(l.unit) ? l.unit : ""}
            onChange={(e) => patch(l.id, { unit: num(e.target.value) })}
          />

          <span className={styles.lineTotal}>{euro(lineTotal(l))}</span>

          <button
            type="button"
            className={styles.lineRemove}
            onClick={() => remove(l.id)}
            disabled={items.length === 1}
            aria-label={`Remove line ${i + 1}`}
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
        className={styles.addLine}
      >
        <FiPlus aria-hidden /> Add line
      </Button>
    </fieldset>
  );
}
