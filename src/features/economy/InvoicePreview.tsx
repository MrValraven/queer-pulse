import type { Issuer } from "./tools/useIssuer";
import { DocPreview } from "./tools/DocPreview";
import {
  TAX_DISCLAIMER_KEY,
  IVA_EXEMPT_NOTE,
  RETENTION_DISPENSA_NOTE,
} from "./tax.constants";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { type LineItem, type InvoiceClient, lineTotal } from "./invoice.data";
import styles from "./InvoiceGeneratorPage.module.css";

export interface InvoicePreviewProps {
  issuer: Issuer;
  client: InvoiceClient;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  ivaRate: number;
  exempt53: boolean;
  dispensaRetention: boolean;
  notes: string;
  subtotal: number;
  ivaAmount: number;
  total: number;
}

/**
 * Muted filler for an invoice field the issuer has not filled in yet. A real
 * translated label rather than an em dash: a dash carries no meaning for a
 * screen reader, and the em dash is out of the product's copy anyway.
 */
function NotSet() {
  const { t } = useTranslation();
  return (
    <span className={styles.notSet}>{t("economy:placeholder.notSet")}</span>
  );
}

/** A branded, printable fatura-recibo rendered inside the DocPreview sheet. */
export function InvoicePreview(props: InvoicePreviewProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const {
    issuer,
    client,
    invoiceNumber,
    issueDate,
    dueDate,
    lineItems,
    ivaRate,
    exempt53,
    dispensaRetention,
    notes,
    subtotal,
    ivaAmount,
    total,
  } = props;

  const effectiveIva = exempt53 ? 0 : ivaRate;

  const fmtDate = (iso: string) => {
    if (!iso) return t("economy:placeholder.notSet");
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? iso
      : fmt.date(d, { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <DocPreview>
      <header className={styles.docHead}>
        <div>
          <div className={styles.docBiz}>
            {issuer.name || t("economy:invoiceTool.preview.yourNameFallback")}
          </div>
          {issuer.address && (
            <div className={styles.docMeta}>{issuer.address}</div>
          )}
          {issuer.nif && (
            <div className={styles.docMeta}>
              {t("economy:invoiceTool.preview.nifLine", { nif: issuer.nif })}
            </div>
          )}
          {issuer.email && <div className={styles.docMeta}>{issuer.email}</div>}
        </div>
        <div className={styles.docHeadRight}>
          <div className={styles.docLabel}>
            {t("economy:invoiceTool.preview.docLabel")}
          </div>
          <div className={styles.docNo}>{invoiceNumber || <NotSet />}</div>
          <div className={styles.docMeta}>
            {t("economy:invoiceTool.preview.issued", {
              date: fmtDate(issueDate),
            })}
          </div>
          <div className={styles.docMeta}>
            {t("economy:invoiceTool.preview.due", { date: fmtDate(dueDate) })}
          </div>
        </div>
      </header>

      <section className={styles.docParties}>
        <div>
          <div className={styles.docPartyLabel}>
            {t("economy:invoiceTool.preview.billedTo")}
          </div>
          <div className={styles.docPartyName}>{client.name || <NotSet />}</div>
          {client.nif && (
            <div className={styles.docMeta}>
              {t("economy:invoiceTool.preview.nifLine", { nif: client.nif })}
            </div>
          )}
          {client.address && (
            <div className={styles.docMeta}>{client.address}</div>
          )}
        </div>
      </section>

      <div className={styles.docTableScroll}>
        <table className={styles.docTable}>
          <thead>
            <tr>
              <th className={styles.docTh}>
                {t("economy:invoiceTool.lines.description")}
              </th>
              <th className={`${styles.docTh} ${styles.docNumCol}`}>
                {t("economy:invoiceTool.lines.qty")}
              </th>
              <th className={`${styles.docTh} ${styles.docNumCol}`}>
                {t("economy:invoiceTool.lines.unit")}
              </th>
              <th className={`${styles.docTh} ${styles.docNumCol}`}>
                {t("economy:invoiceTool.lines.total")}
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((l) => (
              <tr key={l.id}>
                <td className={styles.docTd}>{l.description || <NotSet />}</td>
                <td className={`${styles.docTd} ${styles.docNumCol}`}>
                  {Number.isFinite(l.quantity) ? l.quantity : 0}
                </td>
                <td className={`${styles.docTd} ${styles.docNumCol}`}>
                  {fmt.currency(l.unit || 0)}
                </td>
                <td className={`${styles.docTd} ${styles.docNumCol}`}>
                  {fmt.currency(lineTotal(l))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.docTotals}>
        <div className={styles.docTotalRow}>
          <span>{t("economy:invoiceTool.preview.subtotal")}</span>
          <span>{fmt.currency(subtotal)}</span>
        </div>
        <div className={styles.docTotalRow}>
          <span>
            {t("economy:invoiceTool.preview.ivaLabel", { rate: effectiveIva })}
          </span>
          <span>{fmt.currency(ivaAmount)}</span>
        </div>
        <div className={`${styles.docTotalRow} ${styles.docGrand}`}>
          <span>{t("economy:invoiceTool.preview.total")}</span>
          <span>{fmt.currency(total)}</span>
        </div>
      </div>

      {(exempt53 || dispensaRetention) && (
        <div className={styles.docNotesLegal}>
          {exempt53 && <div>{IVA_EXEMPT_NOTE}</div>}
          {dispensaRetention && <div>{RETENTION_DISPENSA_NOTE}</div>}
        </div>
      )}

      {notes && (
        <div className={styles.docNotes}>
          <div className={styles.docPartyLabel}>
            {t("economy:invoiceTool.preview.notesTitle")}
          </div>
          <p>{notes}</p>
        </div>
      )}

      <footer className={styles.docFootnote}>{t(TAX_DISCLAIMER_KEY)}</footer>
    </DocPreview>
  );
}
