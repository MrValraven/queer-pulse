import type { Issuer } from "./tools/useIssuer";
import {
  IVA_RATES,
  IVA_EXEMPT_NOTE,
  RETENTION_DISPENSA_NOTE,
} from "./tax.constants";
import { type InvoiceClient } from "./invoice.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./InvoiceGeneratorPage.module.css";

export function InvoiceIssuerFields({
  issuer,
  updateIssuer,
}: {
  issuer: Issuer;
  updateIssuer: (patch: Partial<Issuer>) => void;
}) {
  const { t } = useTranslation();
  return (
    <fieldset className={styles.block}>
      <legend className={styles.legend}>
        {t("economy:invoiceTool.issuer.legend")}
      </legend>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="iss-name">
          {t("economy:invoiceTool.issuer.nameLabel")}
        </label>
        <input
          id="iss-name"
          className={styles.rcInput}
          type="text"
          value={issuer.name}
          onChange={(e) => updateIssuer({ name: e.target.value })}
          placeholder={t("economy:invoiceTool.issuer.namePlaceholder")}
        />
      </div>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="iss-nif">
            {t("economy:invoiceTool.issuer.nifLabel")}
          </label>
          <input
            id="iss-nif"
            className={styles.rcInput}
            type="text"
            inputMode="numeric"
            value={issuer.nif}
            onChange={(e) => updateIssuer({ nif: e.target.value })}
            placeholder="123456789"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="iss-email">
            {t("economy:invoiceTool.issuer.emailLabel")}
          </label>
          <input
            id="iss-email"
            className={styles.rcInput}
            type="email"
            value={issuer.email}
            onChange={(e) => updateIssuer({ email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="iss-address">
          {t("economy:invoiceTool.issuer.addressLabel")}
        </label>
        <input
          id="iss-address"
          className={styles.rcInput}
          type="text"
          value={issuer.address}
          onChange={(e) => updateIssuer({ address: e.target.value })}
          placeholder={t("economy:invoiceTool.issuer.addressPlaceholder")}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="iss-iban">
          {t("economy:invoiceTool.issuer.ibanLabel")}
        </label>
        <input
          id="iss-iban"
          className={styles.rcInput}
          type="text"
          value={issuer.iban ?? ""}
          onChange={(e) => updateIssuer({ iban: e.target.value })}
          placeholder="PT50 0000 0000 0000 0000 0000 0"
        />
      </div>
    </fieldset>
  );
}

export function InvoiceClientFields({
  client,
  setClient,
}: {
  client: InvoiceClient;
  setClient: (patch: Partial<InvoiceClient>) => void;
}) {
  const { t } = useTranslation();
  return (
    <fieldset className={styles.block}>
      <legend className={styles.legend}>
        {t("economy:invoiceTool.client.legend")}
      </legend>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="cl-name">
          {t("economy:invoiceTool.client.nameLabel")}
        </label>
        <input
          id="cl-name"
          className={styles.rcInput}
          type="text"
          value={client.name}
          onChange={(e) => setClient({ name: e.target.value })}
          placeholder={t("economy:invoiceTool.client.namePlaceholder")}
        />
      </div>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="cl-nif">
            {t("economy:invoiceTool.client.nifLabel")}
          </label>
          <input
            id="cl-nif"
            className={styles.rcInput}
            type="text"
            inputMode="numeric"
            value={client.nif}
            onChange={(e) => setClient({ nif: e.target.value })}
            placeholder={t("economy:invoiceTool.optional")}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="cl-address">
            {t("economy:invoiceTool.client.addressLabel")}
          </label>
          <input
            id="cl-address"
            className={styles.rcInput}
            type="text"
            value={client.address}
            onChange={(e) => setClient({ address: e.target.value })}
            placeholder={t("economy:invoiceTool.optional")}
          />
        </div>
      </div>
    </fieldset>
  );
}

export interface InvoiceMetaFieldsProps {
  invoiceNumber: string;
  setInvoiceNumber: (v: string) => void;
  issueDate: string;
  setIssueDate: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  ivaRate: number;
  setIvaRate: (v: number) => void;
  exempt53: boolean;
  setExempt53: (v: boolean) => void;
  dispensaRetention: boolean;
  setDispensaRetention: (v: boolean) => void;
}

export function InvoiceMetaFields({
  invoiceNumber,
  setInvoiceNumber,
  issueDate,
  setIssueDate,
  dueDate,
  setDueDate,
  ivaRate,
  setIvaRate,
  exempt53,
  setExempt53,
  dispensaRetention,
  setDispensaRetention,
}: InvoiceMetaFieldsProps) {
  const { t } = useTranslation();
  return (
    <fieldset className={styles.block}>
      <legend className={styles.legend}>
        {t("economy:invoiceTool.meta.legend")}
      </legend>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="inv-no">
          {t("economy:invoiceTool.meta.numberLabel")}
        </label>
        <input
          id="inv-no"
          className={styles.rcInput}
          type="text"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="FR 2026/001"
        />
      </div>

      <div className={styles.rcRow}>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="inv-issue">
            {t("economy:invoiceTool.meta.issueDateLabel")}
          </label>
          <input
            id="inv-issue"
            className={styles.rcInput}
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.rcLabel} htmlFor="inv-due">
            {t("economy:invoiceTool.meta.dueDateLabel")}
          </label>
          <input
            id="inv-due"
            className={styles.rcInput}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="inv-iva">
          {t("economy:invoiceTool.meta.ivaRateLabel")}
        </label>
        <select
          id="inv-iva"
          className={styles.rcSelect}
          value={ivaRate}
          disabled={exempt53}
          onChange={(e) => setIvaRate(Number(e.target.value))}
        >
          {IVA_RATES.map((r) => (
            <option key={r.value} value={r.value}>
              {t(r.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <label className={styles.check} htmlFor="inv-exempt">
        <input
          id="inv-exempt"
          type="checkbox"
          checked={exempt53}
          onChange={(e) => setExempt53(e.target.checked)}
        />
        <span>{IVA_EXEMPT_NOTE}</span>
      </label>

      <label className={styles.check} htmlFor="inv-dispensa">
        <input
          id="inv-dispensa"
          type="checkbox"
          checked={dispensaRetention}
          onChange={(e) => setDispensaRetention(e.target.checked)}
        />
        <span>{RETENTION_DISPENSA_NOTE}</span>
      </label>
    </fieldset>
  );
}
