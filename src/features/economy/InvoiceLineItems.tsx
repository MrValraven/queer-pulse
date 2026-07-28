import { FiPlus, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { type LineItem, lineTotal, emptyLine } from "./invoice.data";
import styles from "./InvoiceGeneratorPage.module.css";

interface InvoiceLineItemsProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

/** Editable invoice line rows: description / qty / unit, with add + remove. */
export function InvoiceLineItems({ items, onChange }: InvoiceLineItemsProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
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
      <legend className={styles.legend}>
        {t("economy:invoiceTool.lines.legend")}
      </legend>

      <div className={styles.lineHead} aria-hidden>
        <span>{t("economy:invoiceTool.lines.description")}</span>
        <span>{t("economy:invoiceTool.lines.qty")}</span>
        <span>{t("economy:invoiceTool.lines.unit")}</span>
        <span>{t("economy:invoiceTool.lines.total")}</span>
        <span />
      </div>

      {items.map((l, i) => (
        <div key={l.id} className={styles.lineRow}>
          <label className={styles.srOnly} htmlFor={`desc-${l.id}`}>
            {t("economy:invoiceTool.lines.descAriaLabel", { index: i + 1 })}
          </label>
          <input
            id={`desc-${l.id}`}
            className={styles.rcInput}
            type="text"
            placeholder={t("economy:invoiceTool.lines.descPlaceholder")}
            value={l.description}
            onChange={(e) => patch(l.id, { description: e.target.value })}
          />

          <label className={styles.srOnly} htmlFor={`qty-${l.id}`}>
            {t("economy:invoiceTool.lines.qtyAriaLabel", { index: i + 1 })}
          </label>
          <input
            id={`qty-${l.id}`}
            className={styles.rcInput}
            type="number"
            min={0}
            step="any"
            value={Number.isFinite(l.quantity) ? l.quantity : ""}
            onChange={(e) => patch(l.id, { quantity: num(e.target.value) })}
          />

          <label className={styles.srOnly} htmlFor={`unit-${l.id}`}>
            {t("economy:invoiceTool.lines.unitAriaLabel", { index: i + 1 })}
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

          <span className={styles.lineTotal}>{fmt.currency(lineTotal(l))}</span>

          <button
            type="button"
            className={styles.lineRemove}
            onClick={() => remove(l.id)}
            disabled={items.length === 1}
            aria-label={t("economy:invoiceTool.lines.removeAriaLabel", {
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
        className={styles.addLine}
      >
        <FiPlus aria-hidden /> {t("economy:invoiceTool.lines.addCta")}
      </Button>
    </fieldset>
  );
}
