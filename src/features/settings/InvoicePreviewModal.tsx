import { FiDownload } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./SettingsModal.module.css";

export interface InvoiceData {
  period: string;
  amount: string;
}

const VAT_NOTE = "VAT reverse-charged · €0.00";

/**
 * Invoice preview with a working download. The download generates a real text
 * invoice Blob and triggers a browser download via a temporary <a download>.
 */
export function InvoicePreviewModal({
  invoice,
  onClose,
  onDownloaded,
}: {
  invoice: InvoiceData;
  onClose: () => void;
  onDownloaded?: () => void;
}) {
  useScrollLock();

  const number = `QP-${invoice.period.replace(/\s+/g, "-").toUpperCase()}`;

  function buildInvoiceText() {
    return [
      "QueerPulse — Membership invoice",
      "================================",
      ``,
      `Invoice number:  ${number}`,
      `Billing period:  ${invoice.period}`,
      `Issued to:       tomas@example.com`,
      ``,
      "Line items",
      "--------------------------------",
      `Sustaining membership · ${invoice.period}        ${invoice.amount}`,
      `${VAT_NOTE}`,
      "--------------------------------",
      `Total                                  ${invoice.amount}`,
      ``,
      "Paid in full. Thank you for sustaining the community.",
      "QueerPulse · Lisbon · queerpulse.app",
    ].join("\n");
  }

  function download() {
    const blob = new Blob([buildInvoiceText()], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownloaded?.();
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className={styles.eye}>Invoice · {invoice.period}</div>
        <div className={styles.title}>
          Your <em>invoice.</em>
        </div>
        <div className={styles.invSheet}>
          <div className={styles.invHeader}>
            <div className={styles.invBrand}>QueerPulse</div>
            <div className={styles.invMeta}>
              {number}
              <br />
              {invoice.period}
              <br />
              Paid in full
            </div>
          </div>
          <div className={styles.invLine}>
            <span>
              Sustaining membership · <b>{invoice.period}</b>
            </span>
            <b>{invoice.amount}</b>
          </div>
          <div className={styles.invLine}>
            <span>{VAT_NOTE}</span>
            <span>€0.00</span>
          </div>
          <div className={styles.invTotal}>
            <span>Total</span>
            <span>{invoice.amount}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={download}>
            <FiDownload size={15} /> Download invoice
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
