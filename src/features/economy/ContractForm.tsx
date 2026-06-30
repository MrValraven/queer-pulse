import { LANG_OPTIONS, type ContractCtx, type Lang } from "./contract.data";
import { ContractClauses } from "./ContractClauses";
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
  return (
    <div className={styles.form}>
      <fieldset className={styles.group}>
        <legend className={styles.groupLegend}>Document language</legend>
        <div
          className={styles.langToggle}
          role="group"
          aria-label="Document language"
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
        <legend className={styles.groupLegend}>You (the Provider)</legend>
        <div className={styles.rcRow}>
          <div>
            <label className={styles.rcLabel} htmlFor="c-provider-name">
              Name
            </label>
            <input
              id="c-provider-name"
              className={styles.rcInput}
              value={ctx.providerName}
              placeholder="Your name or studio"
              onChange={(e) => onChange({ providerName: e.target.value })}
            />
          </div>
          <div>
            <label className={styles.rcLabel} htmlFor="c-provider-nif">
              NIF / VAT
            </label>
            <input
              id="c-provider-nif"
              className={styles.rcInput}
              value={ctx.providerNif}
              placeholder="123 456 789"
              onChange={(e) => onChange({ providerNif: e.target.value })}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupLegend}>Your client</legend>
        <div className={styles.rcRow}>
          <div>
            <label className={styles.rcLabel} htmlFor="c-client-name">
              Name
            </label>
            <input
              id="c-client-name"
              className={styles.rcInput}
              value={ctx.clientName}
              placeholder="Client or company name"
              onChange={(e) => onChange({ clientName: e.target.value })}
            />
          </div>
          <div>
            <label className={styles.rcLabel} htmlFor="c-client-nif">
              NIF / VAT
            </label>
            <input
              id="c-client-nif"
              className={styles.rcInput}
              value={ctx.clientNif}
              placeholder="987 654 321"
              onChange={(e) => onChange({ clientNif: e.target.value })}
            />
          </div>
        </div>
      </fieldset>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="c-project">
          Project title
        </label>
        <input
          id="c-project"
          className={styles.rcInput}
          value={ctx.project}
          placeholder="e.g. Brand identity for Casa Aurora"
          onChange={(e) => onChange({ project: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.rcLabel} htmlFor="c-scope">
          Scope of work
        </label>
        <textarea
          id="c-scope"
          className={styles.rcTextarea}
          value={ctx.scope}
          rows={4}
          placeholder="What you'll deliver, and what's out of scope."
          onChange={(e) => onChange({ scope: e.target.value })}
        />
      </div>

      <div className={styles.rcRow}>
        <div>
          <label className={styles.rcLabel} htmlFor="c-fee">
            Fee
          </label>
          <input
            id="c-fee"
            className={styles.rcInput}
            value={ctx.fee}
            placeholder="e.g. €2,400 + IVA"
            onChange={(e) => onChange({ fee: e.target.value })}
          />
        </div>
        <div>
          <label className={styles.rcLabel} htmlFor="c-timeline">
            Timeline
          </label>
          <input
            id="c-timeline"
            className={styles.rcInput}
            value={ctx.timeline}
            placeholder="e.g. 6 weeks from signing"
            onChange={(e) => onChange({ timeline: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.rcRow}>
        <div>
          <label className={styles.rcLabel} htmlFor="c-terms">
            Payment terms
          </label>
          <input
            id="c-terms"
            className={styles.rcInput}
            value={ctx.paymentTerms}
            placeholder="e.g. 50% on signing, 50% on delivery"
            onChange={(e) => onChange({ paymentTerms: e.target.value })}
          />
        </div>
        <div>
          <label className={styles.rcLabel} htmlFor="c-law">
            Governing law
          </label>
          <input
            id="c-law"
            className={styles.rcInput}
            value={ctx.governingLaw}
            placeholder="Portugal"
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
