import { DocPreview } from "./tools/DocPreview";
import { DOC_STRINGS, type ContractCtx, type Lang } from "./contract.data";
import { activeClauses, dash, show } from "./contract.helpers";
import styles from "./ContractGeneratorPage.module.css";

interface ContractPreviewProps {
  ctx: ContractCtx;
  selected: string[];
  lang: Lang;
}

/** The live, printable contract document, in the chosen language. */
export function ContractPreview({ ctx, selected, lang }: ContractPreviewProps) {
  const S = DOC_STRINGS[lang];
  return (
    <DocPreview>
      <h2 className={styles.docTitle}>{S.title}</h2>

      <p className={styles.parties}>
        {S.between}{" "}
        <strong>{show(ctx.providerName, S.providerFallback)}</strong>
        {ctx.providerNif.trim() && (
          <span className={styles.nif}> (NIF {ctx.providerNif.trim()})</span>
        )}
        {` ${S.and} `}
        <strong>{show(ctx.clientName, S.clientFallback)}</strong>
        {ctx.clientNif.trim() && (
          <span className={styles.nif}> (NIF {ctx.clientNif.trim()})</span>
        )}
        .
      </p>

      <section className={styles.docSection}>
        <h3 className={styles.docHeading}>{S.projectScope}</h3>
        <p className={styles.docProject}>{show(ctx.project, dash)}</p>
        {ctx.scope.trim() && (
          <p className={styles.docBody}>{ctx.scope.trim()}</p>
        )}
      </section>

      <section className={styles.docSection}>
        <h3 className={styles.docHeading}>{S.feePayment}</h3>
        <p className={styles.docBody}>
          <strong>{S.fee}:</strong> {show(ctx.fee, dash)}
        </p>
        <p className={styles.docBody}>
          <strong>{S.paymentTerms}:</strong> {show(ctx.paymentTerms, dash)}
        </p>
      </section>

      <section className={styles.docSection}>
        <h3 className={styles.docHeading}>{S.timeline}</h3>
        <p className={styles.docBody}>{show(ctx.timeline, dash)}</p>
      </section>

      <ol className={styles.docClauses}>
        {activeClauses(selected).map((clause) => (
          <li key={clause.id} className={styles.docClause}>
            <h3 className={styles.docHeading}>{clause.label[lang]}</h3>
            <p className={styles.docBody}>{clause.body[lang](ctx)}</p>
          </li>
        ))}
      </ol>

      <p className={styles.docBody}>
        {S.governedBy(show(ctx.governingLaw, "Portugal"))}
      </p>

      <div className={styles.signatures}>
        <div className={styles.sign}>
          <span className={styles.signLine} />
          <span className={styles.signLabel}>
            {show(ctx.providerName, S.provider)}
          </span>
          <span className={styles.signMeta}>{S.date}</span>
        </div>
        <div className={styles.sign}>
          <span className={styles.signLine} />
          <span className={styles.signLabel}>
            {show(ctx.clientName, S.client)}
          </span>
          <span className={styles.signMeta}>{S.date}</span>
        </div>
      </div>

      <p className={styles.footnote}>{S.disclaimer}</p>
    </DocPreview>
  );
}
