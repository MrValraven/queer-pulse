import { useState } from 'react'
import { Button, Sending } from '../../shared/components/ui'
import { GLOSSARY } from './queer101.data'
import { ResourceModal, PlumSuccess } from './ResourceModal'
import styles from './ResourceModal.module.css'

export function SuggestEditModal({ onClose }: { onClose: () => void }) {
  const [term, setTerm] = useState('')
  const [change, setChange] = useState('')
  const [phase, setPhase] = useState<'form' | 'loading' | 'done'>('form')

  const valid = term.trim().length > 0 && change.trim().length > 8

  const submit = () => {
    if (!valid || phase === 'loading') return
    setPhase('loading')
    setTimeout(() => setPhase('done'), 1100)
  }

  return (
    <ResourceModal title={phase === 'done' ? '' : 'Suggest an edit'} onClose={onClose}>
      {phase === 'done' ? (
        <PlumSuccess
          title={<>Suggestion <em>received.</em></>}
          sub="The editors look at suggestions weekly and discuss bigger changes at the monthly assembly. This is a living document precisely because of edits like yours."
          onClose={onClose}
        />
      ) : (
        <>
          <div className={styles.body}>
            <p className={styles.sub}>
              Community-edited. If a definition feels incomplete or wrong, tell us which term
              and what you'd change.
            </p>

            <span className={styles.label}>Which term</span>
            <select className={styles.select} value={term} onChange={(e) => setTerm(e.target.value)}>
              <option value="">Select a term…</option>
              {GLOSSARY.map((g) => (
                <option key={g.term} value={g.term}>
                  {g.term}
                </option>
              ))}
              <option value="__new">A term that's missing</option>
            </select>

            <span className={styles.label}>Suggested change</span>
            <textarea
              className={styles.textarea}
              value={change}
              onChange={(e) => setChange(e.target.value)}
              placeholder="What's off, and how you'd put it instead. Sources welcome but not required."
            />
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={submit} disabled={!valid || phase === 'loading'}>
              {phase === 'loading' ? <Sending label="Sending…" /> : 'Send suggestion'}
            </Button>
          </div>
        </>
      )}
    </ResourceModal>
  )
}
