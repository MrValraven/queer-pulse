import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { SENDER_NAME } from './invite.data'
import styles from './InvitePage.module.css'

interface InviteEmailFormProps {
  onSent: (inviteeName: string) => void
}

export function InviteEmailForm({ onSent }: InviteEmailFormProps) {
  const { showToast } = useToast()
  const [first, setFirst] = useState('')
  const [know, setKnow] = useState('')
  const [note, setNote] = useState('')

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSent(first.trim() || 'Rosa')
      }}
    >
      <div className={styles.card}>
        <div className={styles.twoCol}>
          <div className={styles.field}>
            <label>First name</label>
            <input
              type="text"
              placeholder="Rosa"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Last name</label>
            <input type="text" placeholder="Lima" />
          </div>
        </div>
        <div className={styles.field}>
          <label>Their email</label>
          <input type="email" placeholder="rosa@email.com" />
        </div>
        <div className={styles.field}>
          <label>How you know them</label>
          <textarea
            maxLength={300}
            placeholder="How you met, and what makes them a good fit — this is your vouch."
            value={know}
            onChange={(e) => setKnow(e.target.value)}
          />
          <div className={styles.charCount}>{know.length}/300</div>
          <div className={styles.helper}>
            This becomes part of your vouch — shown to the moderation team, not the invitee.
          </div>
        </div>
        <div className={styles.field}>
          <label>
            Personal note{' '}
            <span
              style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}
            >
              (optional)
            </span>
          </label>
          <textarea
            maxLength={200}
            placeholder="A message they'll see in their invite email."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className={styles.charCount}>{note.length}/200</div>
        </div>
      </div>

      <div className={styles.epLabel}>What they'll receive</div>
      <div className={styles.emailPreview}>
        <div className={styles.epContent}>
          <div className={styles.epBrand}>
            Queer<em>Pulse</em>
          </div>
          <div className={styles.epSubject}>{SENDER_NAME} has invited you to QueerPulse</div>
          <div className={styles.epNote}>
            “
            {note.trim() ||
              "I think you'd belong here — it's exactly the kind of space we've talked about."}
            ”
          </div>
          <div className={styles.epBtn}>Open your invitation →</div>
          <div className={styles.epExpire}>Invite expires in 7 days</div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit">Send invitation</Button>
        <Button type="button" variant="ghost" onClick={() => showToast('Draft saved', 'info')}>
          Save as draft
        </Button>
      </div>
      <div className={styles.formNote}>
        Your invitation is valid for 7 days. Unused invites don't roll over.
      </div>
    </form>
  )
}
