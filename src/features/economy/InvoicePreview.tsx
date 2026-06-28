import type { Issuer } from './tools/useIssuer'
import { DocPreview } from './tools/DocPreview'
import {
  TAX_DISCLAIMER,
  IVA_EXEMPT_NOTE,
  RETENTION_DISPENSA_NOTE,
} from './tax.constants'
import { euro } from './economy.data'
import { type LineItem, type InvoiceClient, lineTotal } from './invoice.data'
import styles from './InvoiceGeneratorPage.module.css'

export interface InvoicePreviewProps {
  issuer: Issuer
  client: InvoiceClient
  invoiceNumber: string
  issueDate: string
  dueDate: string
  lineItems: LineItem[]
  ivaRate: number
  exempt53: boolean
  dispensaRetention: boolean
  notes: string
  subtotal: number
  ivaAmount: number
  total: number
}

const fmtDate = (iso: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** A branded, printable fatura-recibo rendered inside the DocPreview sheet. */
export function InvoicePreview(props: InvoicePreviewProps) {
  const {
    issuer, client, invoiceNumber, issueDate, dueDate, lineItems,
    ivaRate, exempt53, dispensaRetention, notes, subtotal, ivaAmount, total,
  } = props

  const effectiveIva = exempt53 ? 0 : ivaRate

  return (
    <DocPreview>
      <header className={styles.docHead}>
        <div>
          <div className={styles.docBiz}>{issuer.name || 'Your name'}</div>
          {issuer.address && <div className={styles.docMeta}>{issuer.address}</div>}
          {issuer.nif && <div className={styles.docMeta}>NIF {issuer.nif}</div>}
          {issuer.email && <div className={styles.docMeta}>{issuer.email}</div>}
        </div>
        <div className={styles.docHeadRight}>
          <div className={styles.docLabel}>Fatura-Recibo</div>
          <div className={styles.docNo}>{invoiceNumber || '—'}</div>
          <div className={styles.docMeta}>Issued {fmtDate(issueDate)}</div>
          <div className={styles.docMeta}>Due {fmtDate(dueDate)}</div>
        </div>
      </header>

      <section className={styles.docParties}>
        <div>
          <div className={styles.docPartyLabel}>Billed to</div>
          <div className={styles.docPartyName}>{client.name || '—'}</div>
          {client.nif && <div className={styles.docMeta}>NIF {client.nif}</div>}
          {client.address && <div className={styles.docMeta}>{client.address}</div>}
        </div>
      </section>

      <table className={styles.docTable}>
        <thead>
          <tr>
            <th className={styles.docTh}>Description</th>
            <th className={`${styles.docTh} ${styles.docNumCol}`}>Qty</th>
            <th className={`${styles.docTh} ${styles.docNumCol}`}>Unit</th>
            <th className={`${styles.docTh} ${styles.docNumCol}`}>Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((l) => (
            <tr key={l.id}>
              <td className={styles.docTd}>{l.desc || '—'}</td>
              <td className={`${styles.docTd} ${styles.docNumCol}`}>
                {Number.isFinite(l.qty) ? l.qty : 0}
              </td>
              <td className={`${styles.docTd} ${styles.docNumCol}`}>{euro(l.unit || 0)}</td>
              <td className={`${styles.docTd} ${styles.docNumCol}`}>{euro(lineTotal(l))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.docTotals}>
        <div className={styles.docTotalRow}>
          <span>Subtotal</span>
          <span>{euro(subtotal)}</span>
        </div>
        <div className={styles.docTotalRow}>
          <span>IVA ({effectiveIva}%)</span>
          <span>{euro(ivaAmount)}</span>
        </div>
        <div className={`${styles.docTotalRow} ${styles.docGrand}`}>
          <span>Total</span>
          <span>{euro(total)}</span>
        </div>
      </div>

      {(exempt53 || dispensaRetention) && (
        <div className={styles.docNotesLegal}>
          {exempt53 && <div>{IVA_EXEMPT_NOTE}</div>}
          {dispensaRetention && <div>{RETENTION_DISPENSA_NOTE}</div>}
        </div>
      )}

      {notes && (
        <div className={styles.docNotes}>
          <div className={styles.docPartyLabel}>Notes</div>
          <p>{notes}</p>
        </div>
      )}

      <footer className={styles.docFootnote}>{TAX_DISCLAIMER}</footer>
    </DocPreview>
  )
}
