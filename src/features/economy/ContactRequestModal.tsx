import { useState, type ReactNode } from 'react'
import { Button } from '../../shared/components/ui'
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from './ModalKit'
import styles from './ApplicationModals.module.css'

interface ContactRequestModalProps {
  /** Who the request goes to — used in the heading and success copy. */
  toName: string
  /** Optional small eyebrow above the title (e.g. "Housing · Introduction"). */
  eyebrow?: string
  /** Title text before the coral <em>. Defaults to "Send a". */
  title?: string
  /** The emphasised word (coral italic). Defaults to "request." */
  em?: string
  /** One warm sentence describing what this is. */
  sub?: string
  /** Pre-filled message body. */
  preset?: string
  /** Success-panel title before the <em>. Defaults to "Request". */
  successTitle?: string
  /** Success-panel emphasised word. Defaults to "sent." */
  successEm?: string
  /** Success-panel body. */
  successBody?: ReactNode
  /** Verb on the send button. Defaults to "Send request". */
  sendLabel?: string
  /** Spinner label while sending. Defaults to "Sending…". */
  sendingLabel?: string
  /** Minimum characters before the button enables. */
  minChars?: number
  onClose: () => void
}

/**
 * One reusable compose → loading → plum-panel-success flow for any "reach out"
 * action in the economy area (introductions, mentoring sessions, contacting a
 * practitioner). Wraps ModalKit so the success state is the standard plum panel.
 */
export function ContactRequestModal({
  toName,
  eyebrow,
  title = 'Send a',
  em = 'request.',
  sub,
  preset = '',
  successTitle = 'Request',
  successEm = 'sent.',
  successBody,
  sendLabel = 'Send request',
  sendingLabel = 'Sending…',
  minChars = 20,
  onClose,
}: ContactRequestModalProps) {
  const [message, setMessage] = useState(preset)
  const { sending, done, submit } = useSubmitFlow()
  const valid = message.trim().length >= minChars
  const firstName = toName.split(' ')[0]

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel title={successTitle} em={successEm} onClose={onClose} closeLabel="Done">
          {successBody ?? (
            <>
              Your message is on its way to <strong>{firstName}</strong>. They'll reply straight to
              your inbox here — contact details are shared once you both agree to take it further.
            </>
          )}
        </SuccessPanel>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (valid) submit()
          }}
        >
          {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
          <h2 className={styles.title}>
            {title} <em>{em}</em>
          </h2>
          {sub && <p className={styles.sub}>{sub}</p>}

          <div className={styles.field}>
            <label htmlFor="cr-msg">Your message *</label>
            <textarea
              id="cr-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A sentence about who you are and what you're hoping for goes a long way."
            />
          </div>
          <p className={styles.note}>
            {message.trim().length < minChars
              ? `${minChars - message.trim().length} more characters so they have context.`
              : 'Looks good — keep the conversation here until you both decide to take it further.'}
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose} disabled={sending}>
              Cancel
            </button>
            <Button variant="primary" size="lg" type="submit" disabled={!valid || sending}>
              {sending ? <Sending label={sendingLabel} /> : sendLabel}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  )
}
