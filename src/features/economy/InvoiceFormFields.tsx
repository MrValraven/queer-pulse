import type { Issuer } from "./tools/useIssuer";
import {
  IVA_RATES,
  IVA_EXEMPT_NOTE,
  RETENTION_DISPENSA_NOTE,
} from "./tax.constants";
import { type InvoiceClient } from "./invoice.data";
import { FormField } from "../../shared/components/ui";
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

      <FormField label={t("economy:invoiceTool.issuer.nameLabel")}>
        <input
          type="text"
          value={issuer.name}
          onChange={(e) => updateIssuer({ name: e.target.value })}
          placeholder={t("economy:invoiceTool.issuer.namePlaceholder")}
        />
      </FormField>

      <div className={styles.rcRow}>
        <FormField label={t("economy:invoiceTool.issuer.nifLabel")}>
          <input
            type="text"
            inputMode="numeric"
            value={issuer.nif}
            onChange={(e) => updateIssuer({ nif: e.target.value })}
            placeholder="123456789"
          />
        </FormField>
        <FormField label={t("economy:invoiceTool.issuer.emailLabel")}>
          <input
            type="email"
            value={issuer.email}
            onChange={(e) => updateIssuer({ email: e.target.value })}
            placeholder={t("economy:invoiceTool.issuer.emailPlaceholder")}
          />
        </FormField>
      </div>

      <FormField label={t("economy:invoiceTool.issuer.addressLabel")}>
        <input
          type="text"
          value={issuer.address}
          onChange={(e) => updateIssuer({ address: e.target.value })}
          placeholder={t("economy:invoiceTool.issuer.addressPlaceholder")}
        />
      </FormField>

      <FormField label={t("economy:invoiceTool.issuer.ibanLabel")}>
        <input
          type="text"
          value={issuer.iban ?? ""}
          onChange={(e) => updateIssuer({ iban: e.target.value })}
          placeholder="PT50 0000 0000 0000 0000 0000 0"
        />
      </FormField>
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

      <FormField label={t("economy:invoiceTool.client.nameLabel")}>
        <input
          type="text"
          value={client.name}
          onChange={(e) => setClient({ name: e.target.value })}
          placeholder={t("economy:invoiceTool.client.namePlaceholder")}
        />
      </FormField>

      <div className={styles.rcRow}>
        <FormField label={t("economy:invoiceTool.client.nifLabel")}>
          <input
            type="text"
            inputMode="numeric"
            value={client.nif}
            onChange={(e) => setClient({ nif: e.target.value })}
            placeholder={t("economy:invoiceTool.optional")}
          />
        </FormField>
        <FormField label={t("economy:invoiceTool.client.addressLabel")}>
          <input
            type="text"
            value={client.address}
            onChange={(e) => setClient({ address: e.target.value })}
            placeholder={t("economy:invoiceTool.optional")}
          />
        </FormField>
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

      <FormField label={t("economy:invoiceTool.meta.numberLabel")}>
        <input
          type="text"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="FR 2026/001"
        />
      </FormField>

      <div className={styles.rcRow}>
        <FormField label={t("economy:invoiceTool.meta.issueDateLabel")}>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />
        </FormField>
        <FormField label={t("economy:invoiceTool.meta.dueDateLabel")}>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </FormField>
      </div>

      <FormField label={t("economy:invoiceTool.meta.ivaRateLabel")}>
        <select
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
      </FormField>

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
