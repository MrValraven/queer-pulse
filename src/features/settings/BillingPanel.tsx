import { useMemo, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  buildBillingRows,
  buildPaymentMethod,
  INVOICE_RECORDS,
  invoicePeriodLabel,
  type InvoiceRecord,
} from "./membership.data";
import { InvoicePreviewModal } from "./InvoicePreviewModal";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import styles from "./MembershipPage.module.css";

export function BillingPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const billingRows = useMemo(() => buildBillingRows(t, fmt), [t, fmt]);
  const paymentMethod = useMemo(() => buildPaymentMethod(t, fmt), [t, fmt]);
  const [formOpen, setFormOpen] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [last4, setLast4] = useState("4242");
  const [saving, setSaving] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(
    null,
  );

  function formatCard(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    setCardNum(digits.match(/.{1,4}/g)?.join(" ") ?? digits);
  }

  function saveCard() {
    const digits = cardNum.replace(/\s/g, "");
    if (digits.length < 16) {
      showToast(t("settings:membership.billing.toast.invalidCard"), "error");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setLast4(digits.slice(-4));
      setSaving(false);
      setFormOpen(false);
      setCardNum("");
      showToast(t("settings:membership.billing.toast.cardUpdated"), "success");
    }, 1200);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.sec} style={{ marginTop: 0 }}>
        {t("settings:membership.billing.sectionPaymentHistory")}
      </div>
      <div className={styles.infoCard}>
        {billingRows.map((row) => (
          <div key={row.label} className={styles.infoRow}>
            <span className={styles.infoLbl}>{row.label}</span>
            <span className={`${styles.infoVal} ${row.ok ? styles.ok : ""}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.sec}>
        {t("settings:membership.billing.sectionPaymentMethod")}
      </div>
      <div className={styles.pm}>
        <div className={styles.pmIco}>{paymentMethod.brand}</div>
        <div style={{ flex: 1 }}>
          <div className={styles.pmNum}>•••• •••• •••• {last4}</div>
          <div className={styles.pmExp}>{paymentMethod.expiry}</div>
        </div>
        <button
          type="button"
          className={styles.updBtn}
          onClick={() => setFormOpen((open) => !open)}
        >
          {t("settings:membership.billing.updateCard")}
        </button>
      </div>

      {formOpen && (
        <div className={styles.cardForm}>
          <p className={styles.cardFormNote}>
            {t("settings:membership.billing.cardForm.note")}
          </p>
          <div>
            <label className={styles.cfl}>
              {t("settings:membership.billing.cardForm.cardNumberLabel")}
            </label>
            <input
              className={styles.cfi}
              type="text"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={cardNum}
              onChange={(e) => formatCard(e.target.value)}
            />
          </div>
          <div className={styles.cfRow}>
            <div>
              <label className={styles.cfl}>
                {t("settings:membership.billing.cardForm.expiryLabel")}
              </label>
              <input
                className={styles.cfi}
                type="text"
                placeholder="MM / YY"
                maxLength={7}
              />
            </div>
            <div>
              <label className={styles.cfl}>
                {t("settings:membership.billing.cardForm.cvcLabel")}
              </label>
              <input
                className={styles.cfi}
                type="text"
                placeholder="•••"
                maxLength={4}
              />
            </div>
          </div>
          <div className={styles.cfStack}>
            <label className={styles.cfl}>
              {t("settings:membership.billing.cardForm.nameLabel")}
            </label>
            <input
              className={styles.cfi}
              type="text"
              placeholder={t(
                "settings:membership.billing.cardForm.namePlaceholder",
              )}
            />
          </div>
          <div className={styles.cardFormActions}>
            <Button variant="primary" onClick={saveCard} disabled={saving}>
              {saving
                ? t("settings:membership.billing.cardForm.saving")
                : t("settings:membership.billing.cardForm.save")}
            </Button>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              {t("settings:membership.billing.cardForm.cancel")}
            </Button>
          </div>
        </div>
      )}

      <div className={styles.sec}>
        {t("settings:membership.billing.sectionInvoices")}
      </div>
      <div>
        {INVOICE_RECORDS.map((invoice) => (
          <div key={invoice.id} className={styles.invRow}>
            <span className={styles.invPeriod}>
              {invoicePeriodLabel(invoice, fmt)}
            </span>
            <span className={styles.invAmt}>
              {fmt.currency(invoice.amount)}
            </span>
            <button
              type="button"
              className={styles.invDl}
              onClick={() => setPreviewInvoice(invoice)}
            >
              {t("settings:membership.billing.downloadPdf")}
            </button>
          </div>
        ))}
      </div>

      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          onDownloaded={() =>
            showToast(
              t("settings:membership.billing.toast.invoiceDownloaded", {
                period: invoicePeriodLabel(previewInvoice, fmt),
              }),
              "success",
            )
          }
        />
      )}
    </div>
  );
}
