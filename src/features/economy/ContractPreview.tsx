import { DocPreview } from './tools/DocPreview'
import { CLAUSES, DOC_STRINGS, type ContractCtx, type Lang } from './contract.data'
import styles from './ContractGeneratorPage.module.css'

/** The clauses currently selected, in library order. */
function activeClauses(selected: string[]) {
  return CLAUSES.filter((clause) => selected.includes(clause.id))
}

const dash = '—'
const show = (value: string, fallback: string) => value.trim() || fallback

/**
 * Assemble the entire contract as plain text for the "Copy text" action,
 * in the chosen language. Mirrors the on-screen document order.
 */
export function contractToText(ctx: ContractCtx, selected: string[], lang: Lang): string {
  const S = DOC_STRINGS[lang]
  const lines: string[] = []
  lines.push(S.title.toUpperCase(), '')
  lines.push(
    `${S.between} ${show(ctx.providerName, S.providerFallback)}` +
      (ctx.providerNif.trim() ? ` (NIF ${ctx.providerNif.trim()})` : '') +
      ` ${S.and} ${show(ctx.clientName, S.clientFallback)}` +
      (ctx.clientNif.trim() ? ` (NIF ${ctx.clientNif.trim()})` : '') +
      '.',
    '',
  )
  lines.push(S.projectScope.toUpperCase())
  lines.push(show(ctx.project, dash))
  if (ctx.scope.trim()) lines.push(ctx.scope.trim())
  lines.push('')
  lines.push(S.feePayment.toUpperCase())
  lines.push(`${S.fee}: ${show(ctx.fee, dash)}`)
  lines.push(`${S.paymentTerms}: ${show(ctx.paymentTerms, dash)}`)
  lines.push('')
  lines.push(S.timeline.toUpperCase())
  lines.push(show(ctx.timeline, dash), '')

  activeClauses(selected).forEach((clause, i) => {
    lines.push(`${i + 1}. ${clause.label[lang].toUpperCase()}`)
    lines.push(clause.body[lang](ctx), '')
  })

  lines.push(S.governedBy(show(ctx.governingLaw, 'Portugal')), '')
  lines.push(`${S.provider}: ${show(ctx.providerName, '________________')}    ${S.date}: ____________`)
  lines.push(`${S.client}: ${show(ctx.clientName, '________________')}    ${S.date}: ____________`, '')
  lines.push(S.disclaimer)
  return lines.join('\n')
}

interface ContractPreviewProps {
  ctx: ContractCtx
  selected: string[]
  lang: Lang
}

/** The live, printable contract document, in the chosen language. */
export function ContractPreview({ ctx, selected, lang }: ContractPreviewProps) {
  const S = DOC_STRINGS[lang]
  return (
    <DocPreview>
      <h2 className={styles.docTitle}>{S.title}</h2>

      <p className={styles.parties}>
        {S.between} <strong>{show(ctx.providerName, S.providerFallback)}</strong>
        {ctx.providerNif.trim() && <span className={styles.nif}> (NIF {ctx.providerNif.trim()})</span>}
        {` ${S.and} `}
        <strong>{show(ctx.clientName, S.clientFallback)}</strong>
        {ctx.clientNif.trim() && <span className={styles.nif}> (NIF {ctx.clientNif.trim()})</span>}.
      </p>

      <section className={styles.docSection}>
        <h3 className={styles.docHeading}>{S.projectScope}</h3>
        <p className={styles.docProject}>{show(ctx.project, dash)}</p>
        {ctx.scope.trim() && <p className={styles.docBody}>{ctx.scope.trim()}</p>}
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

      <p className={styles.docBody}>{S.governedBy(show(ctx.governingLaw, 'Portugal'))}</p>

      <div className={styles.signatures}>
        <div className={styles.sign}>
          <span className={styles.signLine} />
          <span className={styles.signLabel}>{show(ctx.providerName, S.provider)}</span>
          <span className={styles.signMeta}>{S.date}</span>
        </div>
        <div className={styles.sign}>
          <span className={styles.signLine} />
          <span className={styles.signLabel}>{show(ctx.clientName, S.client)}</span>
          <span className={styles.signMeta}>{S.date}</span>
        </div>
      </div>

      <p className={styles.footnote}>{S.disclaimer}</p>
    </DocPreview>
  )
}
