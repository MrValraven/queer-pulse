import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { getMember } from '../members/data/members'
import { routes } from '../../app/routeMap'
import { AuthLayout } from './AuthLayout'
import styles from './auth.module.css'

const INVITER = getMember('ines')!
const INVITER_NAME = `${INVITER.first} ${INVITER.last}`

type Visibility = 'open' | 'network' | 'private'
const PRONOUNS = ['he/him', 'she/her', 'they/them', 'she/they', 'he/they']

const STRENGTH_LABELS = ['At least 10 characters', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['var(--ink-40)', 'var(--accent-ink)', 'var(--amber)', 'var(--jade)', 'var(--jade)']
const PW_MIN = 10

function passwordScore(value: string): number {
  let score = 0
  if (value.length >= 10) score++
  if (value.length >= 14) score++
  if (/[0-9]/.test(value) || /[^a-zA-Z0-9]/.test(value)) score++
  if (value.length >= 18) score++
  return Math.min(score, 4)
}

type Touched = { first: boolean; last: boolean; password: boolean; confirm: boolean }

interface AboutProps {
  pronouns: string
  setPronouns: (v: string) => void
  bio: string
  setBio: (v: string) => void
  visibility: Visibility
  setVisibility: (v: Visibility) => void
}

const VIS_OPTS = [
  { value: 'open', label: 'Visible to all members', sub: 'Your profile appears in the member directory' },
  { value: 'network', label: 'Visible to connections only', sub: "Only people you've connected with can see your full profile" },
  { value: 'private', label: 'Private', sub: 'Your profile is hidden; you can still browse and join gatherings' },
] as const

function AboutAndVisibility({ pronouns, setPronouns, bio, setBio, visibility, setVisibility }: AboutProps) {
  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>About you</div>
        <div className={styles.field}>
          <label>Display name</label>
          <input type="text" placeholder="Tiago C." />
          <div className={styles.helper}>What members see. Can differ from your legal name.</div>
        </div>
        <div className={styles.field}>
          <label>Pronouns</label>
          <input
            type="text"
            placeholder="e.g. she/her"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
          />
          <div className={styles.pronounChips}>
            {PRONOUNS.map((p) => (
              <button key={p} type="button" className={styles.pChip} onClick={() => setPronouns(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.field}>
          <label>Location</label>
          <input type="text" placeholder="Lisbon, Portugal" />
        </div>
        <div className={styles.field}>
          <label>Short bio</label>
          <textarea
            maxLength={280}
            placeholder="A sentence or two about you…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <div className={styles.charCount}>{bio.length}/280</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Visibility</div>
        <div className={styles.visOpts}>
          {VIS_OPTS.map((opt) => (
            <label
              key={opt.value}
              className={[styles.visOpt, visibility === opt.value && styles.visOptSelected].filter(Boolean).join(' ')}
            >
              <input
                type="radio"
                name="vis"
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value)}
              />
              <div className={styles.visOptText}>
                <span>{opt.label}</span>
                <small>{opt.sub}</small>
              </div>
            </label>
          ))}
        </div>
      </div>
    </>
  )
}

export function CreateAccountPage() {
  const navigate = useNavigate()
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [bio, setBio] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('open')
  const [touched, setTouched] = useState<Touched>({ first: false, last: false, password: false, confirm: false })

  const score = useMemo(() => passwordScore(password), [password])

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Touched, string>> = {}
    if (!first.trim()) e.first = 'First name is required.'
    if (!last.trim()) e.last = 'Last name is required.'
    if (!password) e.password = 'Choose a password.'
    else if (password.length < PW_MIN) e.password = `Use at least ${PW_MIN} characters.`
    if (!confirm) e.confirm = 'Re-enter your password.'
    else if (confirm !== password) e.confirm = "Passwords don't match."
    return e
  }, [first, last, password, confirm])

  const isValid = Object.keys(errors).length === 0
  const touch = (key: keyof Touched) => setTouched((t) => ({ ...t, [key]: true }))

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!isValid) {
      setTouched({ first: true, last: true, password: true, confirm: true })
      return
    }
    navigate('/onboarding')
  }

  return (
    <AuthLayout wide>
      <div className={styles.vouchRow}>
        <div className={styles.vouchAv} aria-hidden>
          {INVITER.photo ? (
            <img
              src={INVITER.photo}
              alt=""
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            INVITER.initials
          )}
        </div>
        <div className={styles.vouchText}>
          <strong>{INVITER_NAME}</strong> invited you to QueerPulse
        </div>
      </div>

      <div className={styles.eyebrow}>Create your account</div>
      <h1>
        Welcome to the <em>community</em>
      </h1>
      <p className={styles.requiredLegend}>
        Fields marked <span className={styles.req}>*</span> are required.
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 20 }}>
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Your account</div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label>First name <span className={styles.req}>*</span></label>
              <input
                type="text"
                placeholder="Tiago"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                onBlur={() => touch('first')}
                aria-invalid={touched.first && !!errors.first}
              />
              {touched.first && errors.first && <div className={styles.fieldError}>{errors.first}</div>}
            </div>
            <div className={styles.field}>
              <label>Last name <span className={styles.req}>*</span></label>
              <input
                type="text"
                placeholder="Costa"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                onBlur={() => touch('last')}
                aria-invalid={touched.last && !!errors.last}
              />
              {touched.last && errors.last && <div className={styles.fieldError}>{errors.last}</div>}
            </div>
          </div>
          <div className={styles.field}>
            <label>Email address</label>
            <input type="email" value="tiago@gmail.com" disabled />
            <div className={styles.helper}>Taken from your invite — not editable</div>
          </div>
          <div className={styles.field}>
            <label>Password <span className={styles.req}>*</span></label>
            <input
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => touch('password')}
              aria-invalid={touched.password && !!errors.password}
            />
            <div className={styles.strengthBar}>
              {[1, 2, 3, 4].map((seg) => (
                <div
                  key={seg}
                  className={styles.strengthSeg}
                  style={{ background: seg <= score ? STRENGTH_COLORS[score] : undefined }}
                />
              ))}
            </div>
            {touched.password && errors.password ? (
              <div className={styles.fieldError}>{errors.password}</div>
            ) : (
              <div className={styles.strengthLabel} style={{ color: STRENGTH_COLORS[score] }}>
                {STRENGTH_LABELS[score]}
              </div>
            )}
            <div className={styles.helper}>At least {PW_MIN} characters. Add numbers or symbols for a stronger password.</div>
          </div>
          <div className={styles.field}>
            <label>Confirm password <span className={styles.req}>*</span></label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => touch('confirm')}
              aria-invalid={touched.confirm && !!errors.confirm}
            />
            {touched.confirm && errors.confirm && <div className={styles.fieldError}>{errors.confirm}</div>}
            {touched.confirm && !errors.confirm && confirm && (
              <div className={styles.fieldOk}>Passwords match.</div>
            )}
          </div>
        </div>

        <AboutAndVisibility
          pronouns={pronouns}
          setPronouns={setPronouns}
          bio={bio}
          setBio={setBio}
          visibility={visibility}
          setVisibility={setVisibility}
        />

        <Button type="submit" className={styles.authBtn} disabled={!isValid} aria-disabled={!isValid}>
          Create account
        </Button>
        <div className={styles.legalNote}>
          By creating an account you agree to our <Link to={routes.terms}>Terms of Use</Link> and{' '}
          <Link to={routes.privacy}>Privacy Policy</Link>
        </div>
        <div className={styles.signinLink}>
          Already have an account? <Link to={routes.signIn}>Sign in →</Link>
        </div>
      </form>
    </AuthLayout>
  )
}
