import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from './ModalKit'
import styles from './ApplicationModals.module.css'

const JOB_TYPES = ['Full-time', 'Part-time', 'Freelance', 'Contract', 'Internship']

export function PostJobModal({ onClose }: { onClose: () => void }) {
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [desc, setDesc] = useState('')
  const { sending, done, submit } = useSubmitFlow()
  const valid =
    role.trim().length > 2 &&
    company.trim().length > 1 &&
    location.trim().length > 1 &&
    !!type &&
    desc.trim().length >= 40

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel title="Submitted for" em="review." onClose={onClose} closeLabel="Done">
          Thanks for posting <strong>{role}</strong> at <strong>{company}</strong>. Every listing is
          vetted by the community before it goes live — we check that employers are genuinely
          queer-inclusive, not just rainbow-washing. You'll hear back within a few days.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Job board</div>
          <h2 className={styles.title}>
            Post a <em>job.</em>
          </h2>
          <p className={styles.sub}>
            Hiring? Reach queer talent who can show up as themselves. Listings are community-vetted —
            we only publish employers who are genuinely inclusive.
          </p>

          <div className={styles.field}>
            <label htmlFor="pj-role">Role *</label>
            <input
              id="pj-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Product Designer"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pj-company">Company *</label>
            <input
              id="pj-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Who's hiring?"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pj-loc">Location *</label>
            <input
              id="pj-loc"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lisbon · Hybrid"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pj-type">Type *</label>
            <select id="pj-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Choose one…</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="pj-desc">Description *</label>
            <textarea
              id="pj-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's the role, what's the team, and what makes this a genuinely safe place to work?"
            />
          </div>
          <p className={styles.note}>
            {desc.trim().length < 40
              ? `${40 - desc.trim().length} more characters in the description to submit.`
              : 'Tell us how you support queer staff — vetting looks for substance, not slogans.'}
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              Cancel
            </button>
            <Button variant="primary" size="lg" disabled={!valid || sending} onClick={() => valid && submit()}>
              {sending ? <Sending label="Submitting…" /> : 'Submit for review'}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  )
}
