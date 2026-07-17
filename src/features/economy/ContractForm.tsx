import { LANG_OPTIONS, type ContractCtx, type Lang } from "./contract.data";
import { ContractClauses } from "./ContractClauses";
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
          <div>
            <label className={styles.rcLabel} htmlFor="c-provider-name">
              {t("economy:contractTool.nameLabel")}
            </label>
            <input
              id="c-provider-name"
              className={styles.rcInput}
              value={ctx.providerName}
              placeholder={t("economy:contractTool.providerNamePlaceholder")}
              onChange={(e) => onChange({ providerName: e.target.value })}
            />
          </div>
          <div>
            <label className={styles.rcLabel} htmlFor="c-provider-nif">
              {t("economy:contractTool.nifLabel")}
            </label>
            <input
              id="c-provider-nif"
              className={styles.rcInput}
              value={ctx.providerNif}
              placeholder={t("economy:contractTool.providerNifPlaceholder")}
              onChange={(e) => onChange({ providerNif: e.target.value })}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupLegend}>
          {t("economy:contractTool.clientLegend")}
        </legend>
        <div className={styles.rcRow}>
          <div>
            <label className={styles.rcLabel} htmlFor="c-client-name">
              {t("economy:contractTool.nameLabel")}
            </label>
            <input
              id="c-client-name"
              className={styles.rcInput}
              value={ctx.clientName}
              placeholder={t("economy:contractTool.clientNamePlaceholder")}
              onChange={(e) => onChange({ clientName: e.target.value })}
            />
          </div>
          <div>
            <label className={styles.rcLabel} htmlFor="c-client-nif">
              {t("economy:contractTool.nifLabel")}
            </label>
            <input
              id="c-client-nif"
              className={styles.rcInput}
              value={ctx.clientNif}
              placeholder={t("economy:contractTool.clientNifPlaceholder")}
              onChange={(e) => onChange({ clientNif: e.target.value })}
            />
          </div>
        </div>
      </fieldset>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="c-project">
          {t("economy:contractTool.projectTitleLabel")}
        </label>
        <input
          id="c-project"
          className={styles.rcInput}
          value={ctx.project}
          placeholder={t("economy:contractTool.projectTitlePlaceholder")}
          onChange={(e) => onChange({ project: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="c-scope">
          {t("economy:contractTool.scopeLabel")}
        </label>
        <textarea
          id="c-scope"
          className={styles.rcTextarea}
          value={ctx.scope}
          rows={4}
          placeholder={t("economy:contractTool.scopePlaceholder")}
          onChange={(e) => onChange({ scope: e.target.value })}
        />
      </div>

      <div className={styles.rcRow}>
        <div>
          <label className={styles.rcLabel} htmlFor="c-fee">
            {t("economy:contractTool.feeLabel")}
          </label>
          <input
            id="c-fee"
            className={styles.rcInput}
            value={ctx.fee}
            placeholder={t("economy:contractTool.feePlaceholder")}
            onChange={(e) => onChange({ fee: e.target.value })}
          />
        </div>
        <div>
          <label className={styles.rcLabel} htmlFor="c-timeline">
            {t("economy:contractTool.timelineLabel")}
          </label>
          <input
            id="c-timeline"
            className={styles.rcInput}
            value={ctx.timeline}
            placeholder={t("economy:contractTool.timelinePlaceholder")}
            onChange={(e) => onChange({ timeline: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.rcRow}>
        <div>
          <label className={styles.rcLabel} htmlFor="c-terms">
            {t("economy:contractTool.paymentTermsLabel")}
          </label>
          <input
            id="c-terms"
            className={styles.rcInput}
            value={ctx.paymentTerms}
            placeholder={t("economy:contractTool.paymentTermsPlaceholder")}
            onChange={(e) => onChange({ paymentTerms: e.target.value })}
          />
        </div>
        <div>
          <label className={styles.rcLabel} htmlFor="c-law">
            {t("economy:contractTool.governingLawLabel")}
          </label>
          <input
            id="c-law"
            className={styles.rcInput}
            value={ctx.governingLaw}
            placeholder={t("economy:contractTool.governingLawPlaceholder")}
            onChange={(e) => onChange({ governingLaw: e.target.value })}
          />
        </div>
      </div>

      <ContractClauses
        selected={selected}
        onToggle={onToggleClause}
        lang={lang}
      />
    </div>
  );
}
