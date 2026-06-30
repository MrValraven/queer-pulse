import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { BILLING_ROWS, PAYMENT_METHOD, INVOICES } from "./membership.data";
import { InvoicePreviewModal, type InvoiceData } from "./InvoicePreviewModal";
import styles from "./MembershipPage.module.css";

export function BillingPanel() {
  const { showToast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [last4, setLast4] = useState("4242");
  const [saving, setSaving] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceData | null>(
    null,
  );

  function formatCard(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    setCardNum(digits.match(/.{1,4}/g)?.join(" ") ?? digits);
  }

  function saveCard() {
    const digits = cardNum.replace(/\s/g, "");
    if (digits.length < 16) {
      showToast("Please enter a valid card number.", "error");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setLast4(digits.slice(-4));
      setSaving(false);
      setFormOpen(false);
      setCardNum("");
      showToast("Card updated.", "success");
    }, 1200);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.sec} style={{ marginTop: 0 }}>
        Payment history
      </div>
      <div className={styles.infoCard}>
        {BILLING_ROWS.map((row) => (
          <div key={row.label} className={styles.infoRow}>
            <span className={styles.infoLbl}>{row.label}</span>
            <span className={`${styles.infoVal} ${row.ok ? styles.ok : ""}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.sec}>Payment method</div>
      <div className={styles.pm}>
        <div className={styles.pmIco}>{PAYMENT_METHOD.brand}</div>
        <div style={{ flex: 1 }}>
          <div className={styles.pmNum}>•••• •••• •••• {last4}</div>
          <div className={styles.pmExp}>{PAYMENT_METHOD.expiry}</div>
        </div>
        <button
          className={styles.updBtn}
          onClick={() => setFormOpen((v) => !v)}
        >
          Update card
        </button>
      </div>

      {formOpen && (
        <div className={styles.cardForm}>
          <p className={styles.cardFormNote}>
            Enter your new card details. We use Stripe for secure card handling
            — we never store card numbers.
          </p>
          <div>
            <label className={styles.cfl}>Card number</label>
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
              <label className={styles.cfl}>Expiry</label>
              <input
                className={styles.cfi}
                type="text"
                placeholder="MM / YY"
                maxLength={7}
              />
            </div>
            <div>
              <label className={styles.cfl}>CVC</label>
              <input
                className={styles.cfi}
                type="text"
                placeholder="•••"
                maxLength={4}
              />
            </div>
          </div>
          <div className={styles.cfStack}>
            <label className={styles.cfl}>Name on card</label>
            <input className={styles.cfi} type="text" placeholder="Full name" />
          </div>
          <div className={styles.cardFormActions}>
            <Button variant="primary" onClick={saveCard} disabled={saving}>
              {saving ? "Saving…" : "Save card"}
            </Button>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className={styles.sec}>Invoices</div>
      <div>
        {INVOICES.map((inv) => (
          <div key={inv.period} className={styles.invRow}>
            <span className={styles.invPeriod}>{inv.period}</span>
            <span className={styles.invAmt}>{inv.amount}</span>
            <button
              className={styles.invDl}
              onClick={() => setPreviewInvoice(inv)}
            >
              Download PDF
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
              `Invoice for ${previewInvoice.period} downloaded`,
              "success",
            )
          }
        />
      )}
    </div>
  );
}
