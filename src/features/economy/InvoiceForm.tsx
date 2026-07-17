import type { Issuer } from "./tools/useIssuer";
import { type LineItem, type InvoiceClient } from "./invoice.data";
import { InvoiceLineItems } from "./InvoiceLineItems";
import {
  InvoiceIssuerFields,
  InvoiceClientFields,
  InvoiceMetaFields,
} from "./InvoiceFormFields";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./InvoiceGeneratorPage.module.css";

export interface InvoiceFormProps {
  issuer: Issuer;
  updateIssuer: (patch: Partial<Issuer>) => void;
  client: InvoiceClient;
  setClient: (patch: Partial<InvoiceClient>) => void;
  invoiceNumber: string;
  setInvoiceNumber: (v: string) => void;
  issueDate: string;
  setIssueDate: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  lineItems: LineItem[];
  setLineItems: (items: LineItem[]) => void;
  ivaRate: number;
  setIvaRate: (v: number) => void;
  exempt53: boolean;
  setExempt53: (v: boolean) => void;
  dispensaRetention: boolean;
  setDispensaRetention: (v: boolean) => void;
  notes: string;
  setNotes: (v: string) => void;
}

/** The full input column for the invoice generator. */
export function InvoiceForm(props: InvoiceFormProps) {
  const {
    issuer,
    updateIssuer,
    client,
    setClient,
    invoiceNumber,
    setInvoiceNumber,
    issueDate,
    setIssueDate,
    dueDate,
    setDueDate,
    lineItems,
    setLineItems,
    ivaRate,
    setIvaRate,
    exempt53,
    setExempt53,
    dispensaRetention,
    setDispensaRetention,
    notes,
    setNotes,
  } = props;
  const { t } = useTranslation();

  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <InvoiceIssuerFields issuer={issuer} updateIssuer={updateIssuer} />

      <InvoiceClientFields client={client} setClient={setClient} />

      <InvoiceMetaFields
        invoiceNumber={invoiceNumber}
        setInvoiceNumber={setInvoiceNumber}
        issueDate={issueDate}
        setIssueDate={setIssueDate}
        dueDate={dueDate}
        setDueDate={setDueDate}
        ivaRate={ivaRate}
        setIvaRate={setIvaRate}
        exempt53={exempt53}
        setExempt53={setExempt53}
        dispensaRetention={dispensaRetention}
        setDispensaRetention={setDispensaRetention}
      />

      <InvoiceLineItems items={lineItems} onChange={setLineItems} />

      <fieldset className={styles.block}>
        <legend className={styles.legend}>
          {t("economy:invoiceTool.notes.legend")}
        </legend>
        <div className={styles.field}>
          <label className={styles.srOnly} htmlFor="inv-notes">
            {t("economy:invoiceTool.notes.legend")}
          </label>
          <textarea
            id="inv-notes"
            className={styles.rcTextarea}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("economy:invoiceTool.notes.placeholder")}
          />
        </div>
      </fieldset>
    </form>
  );
}
