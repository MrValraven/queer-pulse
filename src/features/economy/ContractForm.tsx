import { LANG_OPTIONS, type ContractCtx, type Lang } from "./contract.data";
import { ContractClauses } from "./ContractClauses";
import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ContractGeneratorPage.module.css";

interface ContractFormProps {
  ctx: ContractCtx;
  /** Patch one or more context fields. */
  onChange: (patch: Partial<ContractCtx>) => void;
  selected: string[];
  onToggleClause: (id: string) => void;
  /** Active output-document language. */
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

/** The input column: language, parties, project, scope, fee, terms, clauses. */
export function ContractForm({
  ctx,
  onChange,
  selected,
  onToggleClause,
  lang,
  onLangChange,
}: ContractFormProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.form}>
      <fieldset className={styles.group}>
        <legend className={styles.groupLegend}>
          {t("economy:contractTool.docLanguageLegend")}
        </legend>
        <div
          className={styles.langToggle}
          role="group"
          aria-label={t("economy:contractTool.docLanguageAriaLabel")}
        >
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={[
                styles.langBtn,
                lang === opt.value && styles.langBtnOn,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={lang === opt.value}
              onClick={() => onLangChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupLegend}>
          {t("economy:contractTool.providerLegend")}
        </legend>
        <div className={styles.rcRow}>
          <FormField label={t("economy:contractTool.nameLabel")}>
            <input
              value={ctx.providerName}
              placeholder={t("economy:contractTool.providerNamePlaceholder")}
              onChange={(e) => onChange({ providerName: e.target.value })}
            />
          </FormField>
          <FormField label={t("economy:contractTool.nifLabel")}>
            <input
              value={ctx.providerNif}
              placeholder={t("economy:contractTool.providerNifPlaceholder")}
              onChange={(e) => onChange({ providerNif: e.target.value })}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupLegend}>
          {t("economy:contractTool.clientLegend")}
        </legend>
        <div className={styles.rcRow}>
          <FormField label={t("economy:contractTool.nameLabel")}>
            <input
              value={ctx.clientName}
              placeholder={t("economy:contractTool.clientNamePlaceholder")}
              onChange={(e) => onChange({ clientName: e.target.value })}
            />
          </FormField>
          <FormField label={t("economy:contractTool.nifLabel")}>
            <input
              value={ctx.clientNif}
              placeholder={t("economy:contractTool.clientNifPlaceholder")}
              onChange={(e) => onChange({ clientNif: e.target.value })}
            />
          </FormField>
        </div>
      </fieldset>

      <FormField label={t("economy:contractTool.projectTitleLabel")}>
        <input
          value={ctx.project}
          placeholder={t("economy:contractTool.projectTitlePlaceholder")}
          onChange={(e) => onChange({ project: e.target.value })}
        />
      </FormField>

      <FormField label={t("economy:contractTool.scopeLabel")}>
        <textarea
          value={ctx.scope}
          rows={4}
          placeholder={t("economy:contractTool.scopePlaceholder")}
          onChange={(e) => onChange({ scope: e.target.value })}
        />
      </FormField>

      <div className={styles.rcRow}>
        <FormField label={t("economy:contractTool.feeLabel")}>
          <input
            value={ctx.fee}
            placeholder={t("economy:contractTool.feePlaceholder")}
            onChange={(e) => onChange({ fee: e.target.value })}
          />
        </FormField>
        <FormField label={t("economy:contractTool.timelineLabel")}>
          <input
            value={ctx.timeline}
            placeholder={t("economy:contractTool.timelinePlaceholder")}
            onChange={(e) => onChange({ timeline: e.target.value })}
          />
        </FormField>
      </div>

      <div className={styles.rcRow}>
        <FormField label={t("economy:contractTool.paymentTermsLabel")}>
          <input
            value={ctx.paymentTerms}
            placeholder={t("economy:contractTool.paymentTermsPlaceholder")}
            onChange={(e) => onChange({ paymentTerms: e.target.value })}
          />
        </FormField>
        <FormField label={t("economy:contractTool.governingLawLabel")}>
          <input
            value={ctx.governingLaw}
            placeholder={t("economy:contractTool.governingLawPlaceholder")}
            onChange={(e) => onChange({ governingLaw: e.target.value })}
          />
        </FormField>
      </div>

      <ContractClauses
        selected={selected}
        onToggle={onToggleClause}
        lang={lang}
      />
    </div>
  );
}
