import { useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { useDrafts } from '../../app/providers/DraftsProvider'
import { SENDER_NAME } from './invite.data'
import styles from './InvitePage.module.css'

interface InviteEmailFormProps {
  onSent: (inviteeName: string) => void
}

type DraftState = 'idle' | 'saving' | 'saved'

export function InviteEmailForm({ onSent }: InviteEmailFormProps) {
  const { showToast } = useToast()
  const { addDraft, removeDraft } = useDrafts()
  const [first, setFirst] = useState('')
  const [know, setKnow] = useState('')
  const [note, setNote] = useState('')
  const [draftState, setDraftState] = useState<DraftState>('idle')
  // One stable id per form session so re-saving updates the same Drafts entry.
  const [draftId] = useState(() => `invite-${Date.now()}`)

  function saveDraft() {
    if (draftState === 'saving') return
    setDraftState('saving')
    // Simulate a write — flips to a persisted "Saved" confirmation and pushes a
    // real entry onto the cross-app Drafts store.
    window.setTimeout(() => {
      const name = first.trim()
      const filled = [first, know, note].filter((v) => v.trim()).length
      removeDraft(draftId) // replace any earlier save of this same draft
      addDraft({
        id: draftId,
        kind: 'INVITE',
        kindVariant: 'post',
        title: `Invitation · ${name || 'someone'}`,
        desc:
          know.trim() ||
          'A friend you want to vouch for — invite not sent yet.',
        meta: [{ label: 'Saved just now', variant: 'pulse' }],
        progress: Math.min(95, 25 + filled * 25),
        actions: [
          { label: 'Resume', variant: 'primary' },
          { label: 'Delete', variant: 'danger', deletes: true },
        ],
      })
      setDraftState('saved')
      showToast('Draft saved — find it in Drafts', 'success')
    }, 650)
  }

  /** Editing after a save means there's something new to save again. */
  function markDirty() {
    setDraftState((s) => (s === 'saved' ? 'idle' : s))
  }

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
              onChange={(e) => {
                setFirst(e.target.value)
                markDirty()
              }}
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
            onChange={(e) => {
              setKnow(e.target.value)
              markDirty()
            }}
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
            onChange={(e) => {
              setNote(e.target.value)
              markDirty()
            }}
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
        <Button
          type="button"
          variant="ghost"
          onClick={saveDraft}
          disabled={draftState !== 'idle'}
        >
          {draftState === 'saving' && 'Saving…'}
          {draftState === 'saved' && (
            <>
              <FiCheck aria-hidden /> Saved to drafts
            </>
          )}
          {draftState === 'idle' && 'Save as draft'}
        </Button>
      </div>
      <div className={styles.formNote}>
        Your invitation is valid for 7 days. Unused invites don't roll over.
      </div>
    </form>
  )
}
