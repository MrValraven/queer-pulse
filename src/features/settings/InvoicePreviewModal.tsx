import { FiDownload } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { invoicePeriodLabel, type InvoiceRecord } from "./membership.data";
import styles from "./SettingsModal.module.css";

/**
 * Invoice preview with a working download. The download generates a real text
 * invoice Blob and triggers a browser download via a temporary <a download>.
 *
 * `invoice.id` (e.g. "2026-05") — not the localized period label — is what
 * builds the invoice number, so switching language never changes a document's
 * identifier (§5.1: a display string must not double as a stored value).
 */
export function InvoicePreviewModal({
  invoice,
  onClose,
  onDownloaded,
}: {
  invoice: InvoiceRecord;
  onClose: () => void;
  onDownloaded?: () => void;
}) {
  useScrollLock();
  const { t } = useTranslation();
  const fmt = useFormat();

  const number = `QP-${invoice.id}`;
  const period = invoicePeriodLabel(invoice, fmt);
  const amount = fmt.currency(invoice.amount);
  const vatNote = t("settings:membership.invoice.vatNote", {
    amount: fmt.currency(0),
  });

  function buildInvoiceText() {
    return [
      t("settings:membership.invoice.docTitle"),
      "================================",
      ``,
      `${t("settings:membership.invoice.invoiceNumberLabel")}  ${number}`,
      `${t("settings:membership.invoice.billingPeriodLabel")}  ${period}`,
      `${t("settings:membership.invoice.issuedToLabel")}       tomas@example.com`,
      ``,
      t("settings:membership.invoice.lineItemsHeading"),
      "--------------------------------",
      `${t("settings:membership.invoice.lineItemLabel")} · ${period}        ${amount}`,
      vatNote,
      "--------------------------------",
      `${t("settings:membership.invoice.totalRow")}                                  ${amount}`,
      ``,
      t("settings:membership.invoice.paidInFullLong"),
      "QueerPulse · Lisbon · queerpulse.app",
    ].join("\n");
  }

  function download() {
    const blob = new Blob([buildInvoiceText()], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${number}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    onDownloaded?.();
  }

  const eyebrowText = t("settings:membership.invoice.eyebrow", { period });

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={eyebrowText}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("settings:modals.common.close")}
        >
          ×
        </button>
        <div className={styles.eye}>{eyebrowText}</div>
        <div className={styles.title}>
          <Translation
            i18nKey="settings:membership.invoice.title"
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.invSheet}>
          <div className={styles.invHeader}>
            <div className={styles.invBrand}>QueerPulse</div>
            <div className={styles.invMeta}>
              {number}
              <br />
              {period}
              <br />
              {t("settings:membership.invoice.paidInFullShort")}
            </div>
          </div>
          <div className={styles.invLine}>
            <span>
              {t("settings:membership.invoice.lineItemLabel")} · <b>{period}</b>
            </span>
            <b>{amount}</b>
          </div>
          <div className={styles.invLine}>
            <span>{vatNote}</span>
            <span>{fmt.currency(0)}</span>
          </div>
          <div className={styles.invTotal}>
            <span>{t("settings:membership.invoice.totalLabel")}</span>
            <span>{amount}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" onClick={download}>
            <FiDownload size={15} />{" "}
            {t("settings:membership.invoice.downloadCta")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("settings:modals.common.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
