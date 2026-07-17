import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ToolPage } from "./tools/ToolPage";
import { useIssuer } from "./tools/useIssuer";
import { usePrintDocument } from "./tools/usePrintDocument";
import { InvoiceForm } from "./InvoiceForm";
import { InvoicePreview } from "./InvoicePreview";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  type LineItem,
  type InvoiceClient,
  lineTotal,
  initialLineItems,
  emptyClient,
  emptyLine,
  defaultInvoiceNumber,
  isoToday,
  isoInDays,
} from "./invoice.data";

/** Client-side freelance invoice generator → print-to-PDF fatura-recibo. */
export function InvoiceGeneratorPage() {
  const { t } = useTranslation();
  const [issuer, updateIssuer] = useIssuer();
  const print = usePrintDocument();

  const [client, setClientState] = useState<InvoiceClient>(emptyClient);
  const [invoiceNumber, setInvoiceNumber] = useState(defaultInvoiceNumber);
  const [issueDate, setIssueDate] = useState(isoToday);
  const [dueDate, setDueDate] = useState(() => isoInDays(30));
  const [lineItems, setLineItems] = useState<LineItem[]>(initialLineItems);
  const [ivaRate, setIvaRate] = useState(23);
  const [exempt53, setExempt53] = useState(false);
  const [dispensaRetention, setDispensaRetention] = useState(false);
  const [notes, setNotes] = useState("");

  const setClient = (patch: Partial<InvoiceClient>) =>
    setClientState((prev) => ({ ...prev, ...patch }));

  // Computation — NaN-guarded via lineTotal; exemption forces IVA to 0.
  const subtotal = lineItems.reduce((sum, l) => sum + lineTotal(l), 0);
  const ivaAmount = exempt53 ? 0 : (subtotal * ivaRate) / 100;
  const total = subtotal + ivaAmount;

  const reset = () => {
    setClientState(emptyClient);
    setInvoiceNumber(defaultInvoiceNumber);
    setIssueDate(isoToday());
    setDueDate(isoInDays(30));
    setLineItems([emptyLine()]);
    setIvaRate(23);
    setExempt53(false);
    setDispensaRetention(false);
    setNotes("");
  };

  return (
    <ToolPage
      eyebrow={t("economy:toolPage.eyebrowFreelance")}
      title={
        <Translation
          i18nKey="economy:invoiceTool.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("economy:invoiceTool.sub")}
      form={
        <InvoiceForm
          issuer={issuer}
          updateIssuer={updateIssuer}
          client={client}
          setClient={setClient}
          invoiceNumber={invoiceNumber}
          setInvoiceNumber={setInvoiceNumber}
          issueDate={issueDate}
          setIssueDate={setIssueDate}
          dueDate={dueDate}
          setDueDate={setDueDate}
          lineItems={lineItems}
          setLineItems={setLineItems}
          ivaRate={ivaRate}
          setIvaRate={setIvaRate}
          exempt53={exempt53}
          setExempt53={setExempt53}
          dispensaRetention={dispensaRetention}
          setDispensaRetention={setDispensaRetention}
          notes={notes}
          setNotes={setNotes}
        />
      }
      preview={
        <InvoicePreview
          issuer={issuer}
          client={client}
          invoiceNumber={invoiceNumber}
          issueDate={issueDate}
          dueDate={dueDate}
          lineItems={lineItems}
          ivaRate={ivaRate}
          exempt53={exempt53}
          dispensaRetention={dispensaRetention}
          notes={notes}
          subtotal={subtotal}
          ivaAmount={ivaAmount}
          total={total}
        />
      }
      actions={
        <>
          <Button
            variant="primary"
            size="lg"
            type="button"
            onClick={() => print(`fatura-${invoiceNumber}`)}
          >
            {t("economy:toolPage.downloadPdf")}
          </Button>
          <Button variant="ghost" size="lg" type="button" onClick={reset}>
            {t("economy:toolPage.reset")}
          </Button>
        </>
      }
    />
  );
}
